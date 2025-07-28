# Use a slimmer Node.js v20 LTS image for smaller size and better security
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Use npm ci for a cleaner, more reproducible install if package-lock.json is present
# Otherwise, npm install is fine.
RUN npm ci --omit=dev

# Bundle app source
# .dockerignore should be used to exclude node_modules, .git, etc.
COPY . .

# Expose the port your Node.js application listens on
EXPOSE 8000

# Start the application
# Verify 'app.js' is your actual entry point
CMD [ "node", "app.js" ]