FROM node:20-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Make the script executable
RUN chmod +x ./lib/index.mjs

# Command to run the MCP server
CMD ["node", "lib/index.mjs"] 