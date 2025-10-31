#!/usr/bin/env node

const { createClient } = require('graphql-ws');

const url = process.argv[2];
const eventId = process.argv[3];
const token = process.argv[4];
const outputFile = process.argv[5];

const fs = require('fs');

const client = createClient({
  url,
  connectionParams: { authorization: `Bearer ${token}` },
});

let count = 0;
const messages = [];

(async () => {
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        dispose();
        resolve();
      }, 30000); // 30 second timeout

      const dispose = client.subscribe(
        {
          query: 'subscription ($eventId: ID!) { eventCapacityChanged(eventId: $eventId) { eventId capacity remaining booked } }',
          variables: { eventId },
        },
        {
          next: (data) => {
            count += 1;
            const msg = JSON.stringify({ type: 'data', data });
            messages.push(msg);
            console.log(msg);
            
            // Exit after 3 messages to avoid hanging
            if (count >= 3) {
              clearTimeout(timeout);
              dispose();
              resolve();
            }
          },
          error: (err) => {
            clearTimeout(timeout);
            const msg = JSON.stringify({ type: 'error', error: err.message || String(err) });
            messages.push(msg);
            console.error(msg);
            reject(err);
          },
          complete: () => {
            clearTimeout(timeout);
            resolve();
          },
        }
      );
    });

    // Write all messages to output file if provided
    if (outputFile) {
      fs.writeFileSync(outputFile, messages.join('\n'), 'utf8');
    }

    process.exit(0);
  } catch (error) {
    const msg = JSON.stringify({ type: 'error', error: error.message || String(error) });
    if (outputFile) {
      fs.writeFileSync(outputFile, messages.join('\n') + '\n' + msg, 'utf8');
    }
    console.error(msg);
    process.exit(1);
  }
})();

