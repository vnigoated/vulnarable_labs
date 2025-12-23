FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables (These are the secrets for the Misconfig lab)
ENV SOVAP_API_KEY="sk_live_892348572345"
ENV SOVAP_ADMIN_SECRET="SuperSecretBackdoorKey"
ENV NODE_ENV="production"

# Start the server
CMD [ "node", "server.js" ]
