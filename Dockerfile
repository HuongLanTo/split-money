# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./

RUN npm install

# Copy the rest of the backend files
COPY backend/ .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose the port your app runs on (change if you use a different port)
EXPOSE 5001

# Start the app (change 'start' if your script is different)
CMD [ "npm", "run", "dev" ]
