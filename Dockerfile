# Use official Node.js LTS image
FROM node:18-alpine

# Add shell for Azure SSH/Console compatibility
RUN apk add --no-cache bash

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for backend
COPY backend/package*.json ./

RUN npm install

# Copy the rest of the backend files
COPY backend/ .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port (must be 8080 for Azure)
EXPOSE 8080

# Run migrations and start the app
CMD ["/bin/sh", "-c", "npx prisma migrate deploy && npm run start"]
