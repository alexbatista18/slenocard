# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install cross-env globally for production
RUN npm install -g cross-env

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Set environment variables for production
ENV NODE_ENV=production
ENV SERVER_HOST=0.0.0.0
ENV FRONTEND_PORT=80
ENV BACKEND_PORT=5000

# Expose ports
EXPOSE 80 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

# Start the application
CMD ["npm", "start"] 