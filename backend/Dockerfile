FROM node:18

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including dev dependencies for Prisma)
RUN npm ci --network-timeout 300000

# Generate Prisma client with retry logic
RUN for i in 1 2 3; do npx prisma generate && break || sleep 5; done

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
