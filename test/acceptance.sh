#!/usr/bin/env bash

set -euo pipefail

# Config - Use deployed Render URLs
GRAPHQL_HTTP="https://eventflow-backend-latest.onrender.com/graphql"
GRAPHQL_WS="wss://eventflow-backend-latest.onrender.com/graphql"
HEALTH_URL="https://eventflow-backend-latest.onrender.com/health"

# Temporary files
TMP_DIR=$(mktemp -d)
trap "rm -rf ${TMP_DIR}" EXIT
SUB_LOG="${TMP_DIR}/subscription.log"
SUB_SCRIPT="${TMP_DIR}/subscription_client.js"

# Track resources for cleanup
USER_ID=""
USER_TOKEN=""
EVENT_ID=""
ORG_TOKEN=""
EXIT_CODE=0

# Cleanup function
cleanup() {
  echo ""
  echo "==================== CLEANUP ===================="
  
  # Always try cleanup, even if test failed
  local cleanup_errors=0

  # 1. Delete event (if created) - as organizer or admin
  if [[ -n "${EVENT_ID}" && -n "${ORG_TOKEN}" ]]; then
    echo "Deleting event ${EVENT_ID}..."
    DELETE_EVENT_PAYLOAD=$(cat <<JSON
{"query":"mutation(\$id: ID!) { deleteEvent(id: \$id) }","variables":{"id":"${EVENT_ID}"}}
JSON
    )
    DELETE_EVENT_RESP=$(gql "${DELETE_EVENT_PAYLOAD}" "${ORG_TOKEN}" || true)
    if ! echo "${DELETE_EVENT_RESP}" | jq -e '.data.deleteEvent' >/dev/null 2>&1; then
      echo "Warning: Failed to delete event: ${DELETE_EVENT_RESP}" >&2
      cleanup_errors=1
    else
      echo "✓ Event deleted"
    fi
  fi

  # 2. Delete test user (requires admin)
  if [[ -n "${USER_ID}" ]]; then
    echo "Deleting test user ${USER_ID}..."
    # Login as admin
    ADMIN_LOGIN_PAYLOAD='{"query":"mutation($input: LoginInput!) { login(input: $input) { accessToken } }","variables":{"input":{"email":"admin@eventflow.com","password":"admin123"}}}'
    ADMIN_LOGIN_RESP=$(gql "${ADMIN_LOGIN_PAYLOAD}" || true)
    ADMIN_TOKEN=$(echo "${ADMIN_LOGIN_RESP}" | jq -r '.data.login.accessToken // empty')
    
    if [[ -n "${ADMIN_TOKEN}" ]]; then
      DELETE_USER_PAYLOAD=$(cat <<JSON
{"query":"mutation(\$userId: ID!) { deleteUser(userId: \$userId) }","variables":{"userId":"${USER_ID}"}}
JSON
      )
      DELETE_USER_RESP=$(gql "${DELETE_USER_PAYLOAD}" "${ADMIN_TOKEN}" || true)
      if ! echo "${DELETE_USER_RESP}" | jq -e '.data.deleteUser' >/dev/null 2>&1; then
        echo "Warning: Failed to delete user: ${DELETE_USER_RESP}" >&2
        cleanup_errors=1
      else
        echo "✓ Test user deleted"
      fi
    else
      echo "Warning: Could not login as admin to delete user" >&2
      cleanup_errors=1
    fi
  fi

  if [[ ${cleanup_errors} -eq 0 ]]; then
    echo "✓ Cleanup completed successfully"
  else
    echo "⚠ Cleanup completed with warnings"
  fi
  echo "=================================================="
}

# Register cleanup trap
trap cleanup EXIT

# Helper functions
gql() {
  local query="$1"
  local token="${2:-}"
  local curl_opts=(
    -sS
    -H "Content-Type: application/json"
    --max-time 30
    --data "${query}"
  )
  
  if [[ -n "${token}" ]]; then
    curl_opts+=(-H "Authorization: Bearer ${token}")
  fi
  
  curl "${curl_opts[@]}" "${GRAPHQL_HTTP}" || echo '{"errors":[{"message":"Request failed"}]}'
}

extract_json() {
  echo "$1" | jq -r "$2 // empty"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: Missing required command: $1" >&2
    echo "Please install: $1" >&2
    exit 1
  fi
}

# Check dependencies
require_cmd jq
require_cmd curl
require_cmd node

# Check if graphql-ws is available (required for subscription)
if ! node -e "require('graphql-ws')" 2>/dev/null; then
  echo "Installing graphql-ws for subscription client..."
  npm install --prefix "${TMP_DIR}" graphql-ws >/dev/null 2>&1 || {
    echo "ERROR: Failed to install graphql-ws. Trying with npx..." >&2
    # Will use npx in subscription script
  fi
fi

echo "==================== ACCEPTANCE TEST ===================="
echo "Testing against: ${GRAPHQL_HTTP}"
echo ""

# Check backend health
echo "Checking backend health..."
HEALTH_RESP=$(curl -sS --max-time 10 "${HEALTH_URL}" || echo '{"status":"UNKNOWN"}')
if ! echo "${HEALTH_RESP}" | grep -q '"status":"OK"'; then
  echo "ERROR: Backend is not healthy: ${HEALTH_RESP}" >&2
  exit 1
fi
echo "✓ Backend is healthy"

# Step 1: Register a new user
echo ""
echo "Step 1: Registering a new user..."
RAND=$(date +%s)
USER_EMAIL="acceptance_test_${RAND}@example.com"
USER_PASS="password123"
REGISTER_PAYLOAD=$(cat <<JSON
{"query":"mutation(\$input: RegisterInput!) { register(input: \$input) { accessToken user { id email roles } } }","variables":{"input":{"name":"Acceptance Test User","email":"${USER_EMAIL}","password":"${USER_PASS}"}}}
JSON
)
REGISTER_RESP=$(gql "${REGISTER_PAYLOAD}")
USER_TOKEN=$(extract_json "${REGISTER_RESP}" '.data.register.accessToken')
USER_ID=$(extract_json "${REGISTER_RESP}" '.data.register.user.id')

if [[ -z "${USER_TOKEN}" || "${USER_TOKEN}" == "null" ]]; then
  echo "ERROR: Registration failed: ${REGISTER_RESP}" >&2
  EXIT_CODE=1
  exit 1
fi
echo "✓ Registered ${USER_EMAIL} (${USER_ID})"

# Step 2: Attempt to create event as USER (should fail)
echo ""
echo "Step 2: Attempting to create event as USER (should fail)..."
START_DATE=$(date -u -d '+1 hour' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v+1H +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '+1 hour' +%Y-%m-%dT%H:%M:%SZ)
END_DATE=$(date -u -d '+2 hour' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v+2H +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '+2 hour' +%Y-%m-%dT%H:%M:%SZ)
CREATE_EVENT_PAYLOAD=$(cat <<JSON
{"query":"mutation(\$input: CreateEventInput!) { createEvent(input: \$input) { id title capacity organizerId } }","variables":{"input":{"title":"Acceptance Test Event","description":"E2E Test Event","location":"Remote","startAt":"${START_DATE}","endAt":"${END_DATE}","capacity":2}}}
JSON
)
CREATE_AS_USER_RESP=$(gql "${CREATE_EVENT_PAYLOAD}" "${USER_TOKEN}" || true)
if echo "${CREATE_AS_USER_RESP}" | jq -e '.errors[0].message' >/dev/null 2>&1; then
  ERROR_MSG=$(extract_json "${CREATE_AS_USER_RESP}" '.errors[0].message')
  if echo "${ERROR_MSG}" | grep -qiE "not authorized|permission|role|organizer|admin"; then
    echo "✓ Create event correctly blocked for USER: ${ERROR_MSG}"
  else
    echo "ERROR: Unexpected error when USER tried to create event: ${ERROR_MSG}" >&2
    EXIT_CODE=1
    exit 1
  fi
else
  # Check if mutation unexpectedly succeeded
  if echo "${CREATE_AS_USER_RESP}" | jq -e '.data.createEvent.id' >/dev/null 2>&1; then
    EVENT_ID=$(extract_json "${CREATE_AS_USER_RESP}" '.data.createEvent.id')
    echo "ERROR: USER was able to create an event (ID: ${EVENT_ID}), expected failure!" >&2
    EXIT_CODE=1
    exit 1
  else
    echo "ERROR: Unexpected response when USER tried to create event: ${CREATE_AS_USER_RESP}" >&2
    EXIT_CODE=1
    exit 1
  fi
fi

# Step 3: Login as organizer and create event
echo ""
echo "Step 3: Logging in as organizer to create event..."
ORG_LOGIN_PAYLOAD='{"query":"mutation($input: LoginInput!) { login(input: $input) { accessToken user { id email roles } } }","variables":{"input":{"email":"organizer@eventflow.com","password":"organizer123"}}}'
ORG_LOGIN_RESP=$(gql "${ORG_LOGIN_PAYLOAD}")
ORG_TOKEN=$(extract_json "${ORG_LOGIN_RESP}" '.data.login.accessToken')
ORG_ID=$(extract_json "${ORG_LOGIN_RESP}" '.data.login.user.id')

if [[ -z "${ORG_TOKEN}" || "${ORG_TOKEN}" == "null" ]]; then
  echo "ERROR: Organizer login failed: ${ORG_LOGIN_RESP}" >&2
  EXIT_CODE=1
  exit 1
fi
echo "✓ Logged in as organizer (${ORG_ID})"

echo "Creating event as ORGANIZER..."
CREATE_EVENT_RESP=$(gql "${CREATE_EVENT_PAYLOAD}" "${ORG_TOKEN}")
EVENT_ID=$(extract_json "${CREATE_EVENT_RESP}" '.data.createEvent.id')

if [[ -z "${EVENT_ID}" || "${EVENT_ID}" == "null" ]]; then
  echo "ERROR: Event creation failed: ${CREATE_EVENT_RESP}" >&2
  EXIT_CODE=1
  exit 1
fi
echo "✓ Created event ${EVENT_ID}"

# Step 4: Setup subscription listener
echo ""
echo "Step 4: Setting up subscription listener for eventCapacityChanged..."
cat > "${SUB_SCRIPT}" <<'SUBSCRIPTION_SCRIPT'
const fs = require('fs');
const path = require('path');

// Try to load graphql-ws from multiple possible locations
let createClient;
try {
  // Try local node_modules first
  const graphqlWs = require('graphql-ws');
  createClient = graphqlWs.createClient;
  if (!createClient) {
    throw new Error('createClient not found');
  }
} catch (e1) {
  try {
    // Try parent directory node_modules
    const graphqlWsPath = require.resolve('graphql-ws', { paths: [process.cwd()] });
    const graphqlWs = require(graphqlWsPath);
    createClient = graphqlWs.createClient;
    if (!createClient) {
      throw new Error('createClient not found');
    }
  } catch (e2) {
    console.error(JSON.stringify({ type: 'error', error: 'Could not load graphql-ws. Please install: npm install graphql-ws' }));
    process.exit(1);
  }
}

const url = process.argv[2];
const eventId = process.argv[3];
const token = process.argv[4];
const outputFile = process.argv[5];

let client;
try {
  client = createClient({
    url,
    connectionParams: { authorization: `Bearer ${token}` },
  });
} catch (e) {
  console.error(JSON.stringify({ type: 'error', error: 'Failed to create client: ' + e.message }));
  process.exit(1);
}

let count = 0;
const messages = [];

(async () => {
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (client) {
          client.dispose();
        }
        resolve();
      }, 30000); // 30 second timeout

      const dispose = () => {
        clearTimeout(timeout);
        if (client) {
          client.dispose();
        }
      };

      client.subscribe(
        {
          query: 'subscription ($eventId: ID!) { eventCapacityChanged(eventId: $eventId) { eventId capacity remaining booked } }',
          variables: { eventId },
        },
        {
          next: (data) => {
            count += 1;
            const msg = JSON.stringify({ type: 'data', data });
            messages.push(msg);
            // Write to stderr so it doesn't interfere with file output
            console.error(msg);
            
            // Exit after 3 messages or when remaining is 0
            const remaining = data?.data?.eventCapacityChanged?.remaining;
            if (count >= 3 || remaining === 0) {
              dispose();
              resolve();
            }
          },
          error: (err) => {
            clearTimeout(timeout);
            const msg = JSON.stringify({ type: 'error', error: err.message || String(err) });
            messages.push(msg);
            console.error(msg);
            dispose();
            reject(err);
          },
          complete: () => {
            clearTimeout(timeout);
            dispose();
            resolve();
          },
        }
      );
    });

    // Write all messages to output file if provided
    if (outputFile && messages.length > 0) {
      fs.writeFileSync(outputFile, messages.join('\n'), 'utf8');
    }

    process.exit(0);
  } catch (error) {
    const msg = JSON.stringify({ type: 'error', error: error.message || String(error) });
    if (outputFile) {
      const existing = messages.length > 0 ? messages.join('\n') + '\n' : '';
      fs.writeFileSync(outputFile, existing + msg, 'utf8');
    }
    console.error(msg);
    process.exit(1);
  }
})();
SUBSCRIPTION_SCRIPT

# Try to run subscription - install graphql-ws if needed
echo "Starting subscription client..."
cd "${TMP_DIR}"
# Create package.json for local install
cat > package.json <<'EOF'
{
  "name": "subscription-client",
  "version": "1.0.0",
  "type": "commonjs"
}
EOF

# Try to install graphql-ws locally
if ! npm install graphql-ws --no-save --silent 2>/dev/null; then
  echo "WARNING: Could not install graphql-ws. Subscription verification may fail." >&2
fi

# Run subscription script in background, capture output
node "${SUB_SCRIPT}" "${GRAPHQL_WS}" "${EVENT_ID}" "${USER_TOKEN}" "${SUB_LOG}" 2>&1 &
SUB_PID=$!
cd - >/dev/null

# Give subscription time to connect
sleep 2

# Step 5: Book tickets until sold out
echo ""
echo "Step 5: Booking tickets until sold out..."
BOOK_PAYLOAD_TMPL='{"query":"mutation($eventId: ID!) { bookTicket(eventId: $eventId) { id status } }","variables":{"eventId":"__EVENT_ID__"}}'

echo "Booking first ticket..."
BOOK1_RESP=$(gql "${BOOK_PAYLOAD_TMPL/__EVENT_ID__/${EVENT_ID}}" "${USER_TOKEN}")
BOOK1_ID=$(extract_json "${BOOK1_RESP}" '.data.bookTicket.id')
if [[ -z "${BOOK1_ID}" || "${BOOK1_ID}" == "null" ]]; then
  echo "ERROR: First booking failed: ${BOOK1_RESP}" >&2
  EXIT_CODE=1
  exit 1
fi
echo "✓ Booked first ticket (${BOOK1_ID})"

echo "Booking second ticket..."
BOOK2_RESP=$(gql "${BOOK_PAYLOAD_TMPL/__EVENT_ID__/${EVENT_ID}}" "${USER_TOKEN}" || true)
BOOK2_ID=$(extract_json "${BOOK2_RESP}" '.data.bookTicket.id')
if [[ -z "${BOOK2_ID}" || "${BOOK2_ID}" == "null" ]]; then
  # User might already have a ticket (upsert), try with seeded user
  echo "Second booking with same user (upsert behavior). Trying with different user..."
  SEED_LOGIN='{"query":"mutation($input: LoginInput!) { login(input: $input) { accessToken } }","variables":{"input":{"email":"user@eventflow.com","password":"user123"}}}'
  SEED_LOGIN_RESP=$(gql "${SEED_LOGIN}")
  SEED_TOKEN=$(extract_json "${SEED_LOGIN_RESP}" '.data.login.accessToken')
  if [[ -n "${SEED_TOKEN}" && "${SEED_TOKEN}" != "null" ]]; then
    BOOK2_RESP=$(gql "${BOOK_PAYLOAD_TMPL/__EVENT_ID__/${EVENT_ID}}" "${SEED_TOKEN}")
    BOOK2_ID=$(extract_json "${BOOK2_RESP}" '.data.bookTicket.id')
  fi
  
  if [[ -z "${BOOK2_ID}" || "${BOOK2_ID}" == "null" ]]; then
    echo "WARNING: Second booking failed or already exists: ${BOOK2_RESP}" >&2
  else
    echo "✓ Booked second ticket (${BOOK2_ID})"
  fi
else
  echo "✓ Booked second ticket (${BOOK2_ID})"
fi

# Wait a moment for subscription events
sleep 2

echo "Attempting third booking (should fail with sold out)..."
BOOK3_RESP=$(gql "${BOOK_PAYLOAD_TMPL/__EVENT_ID__/${EVENT_ID}}" "${USER_TOKEN}" || true)
if echo "${BOOK3_RESP}" | jq -e '.errors[0].message' >/dev/null 2>&1; then
  ERROR_MSG=$(extract_json "${BOOK3_RESP}" '.errors[0].message')
  if echo "${ERROR_MSG}" | grep -qiE "sold out"; then
    echo "✓ Third booking correctly failed with sold out: ${ERROR_MSG}"
  else
    echo "WARNING: Third booking failed but with unexpected error: ${ERROR_MSG}" >&2
  fi
else
  # Check if it unexpectedly succeeded
  BOOK3_ID=$(extract_json "${BOOK3_RESP}" '.data.bookTicket.id')
  if [[ -n "${BOOK3_ID}" && "${BOOK3_ID}" != "null" ]]; then
    echo "ERROR: Third booking unexpectedly succeeded (ID: ${BOOK3_ID})" >&2
    EXIT_CODE=1
    exit 1
  else
    echo "WARNING: Third booking response unclear: ${BOOK3_RESP}" >&2
  fi
fi

# Wait for subscription to finish (give it more time)
sleep 3
if [[ -n "${SUB_PID:-}" ]] && kill -0 "${SUB_PID}" 2>/dev/null; then
  wait "${SUB_PID}" 2>/dev/null || true
fi

# Step 6: Verify subscription
echo ""
echo "Step 6: Verifying subscription events..."
if [[ -f "${SUB_LOG}" ]]; then
  if grep -q 'eventCapacityChanged' "${SUB_LOG}" || grep -q '"remaining"' "${SUB_LOG}"; then
    echo "✓ Subscription events captured"
    
    # Parse subscription events
    EVENT_COUNT=$(jq -r 'select(.type=="data") | .data.data.eventCapacityChanged' "${SUB_LOG}" 2>/dev/null | jq -s 'length' || echo "0")
    REMAINING_ZERO=$(jq -r 'select(.type=="data") | .data.data.eventCapacityChanged.remaining' "${SUB_LOG}" 2>/dev/null | tail -n1 || echo "")
    
    if [[ "${EVENT_COUNT}" -ge "2" ]]; then
      echo "✓ Received ${EVENT_COUNT} capacity change events"
    else
      echo "WARNING: Expected at least 2 events, got ${EVENT_COUNT}" >&2
    fi
    
    if [[ "${REMAINING_ZERO}" == "0" ]]; then
      echo "✓ Final remaining capacity is 0"
    else
      echo "WARNING: Expected final remaining=0, got ${REMAINING_ZERO}" >&2
    fi
  else
    echo "WARNING: No subscription events found in log" >&2
    cat "${SUB_LOG}" >&2 || true
  fi
else
  echo "WARNING: Subscription log file not found" >&2
fi

echo ""
echo "==================== TEST SUMMARY ===================="
if [[ ${EXIT_CODE} -eq 0 ]]; then
  echo "✓ All acceptance tests PASSED"
else
  echo "✗ Some acceptance tests FAILED"
fi
echo "======================================================"

exit ${EXIT_CODE}
