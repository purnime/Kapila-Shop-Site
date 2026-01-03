# Build stage
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Explicitly copy essential files to override any potential .dockerignore issues
COPY index.html ./
COPY vite.config.js ./
COPY public ./public
COPY src ./src
COPY package*.json ./

# Copy everything else
COPY . .

# Check if index.html is present and fail loudly if not
RUN if [ ! -f index.html ]; then echo "CRITICAL ERROR: index.html is missing inside /app directory!" && exit 1; else echo "SUCCESS: index.html is present."; fi

# Debug: List files to confirm result
RUN ls -la

RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
# Only install production dependencies
RUN npm install --only=production

# Copy the built frontend from the build stage
COPY --from=build /app/dist ./dist

# Copy the server directory
COPY server ./server

# Expose the port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
