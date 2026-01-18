FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Install Python3 and build JupyterLite assets
RUN apk add --no-cache python3 py3-pip
ENV PIP_BREAK_SYSTEM_PACKAGES=1
RUN pip3 install jupyterlite-core jupyterlite-pyodide-kernel

# Bundle app source
COPY . .

# Build the static Jupyter site
RUN python3 -m jupyter lite build --contents content --output-dir public/jupyter

# Expose port
EXPOSE 3000

# Set environment variables (These are the secrets for the Misconfig lab)
ENV SOVAP_API_KEY="sk_live_892348572345"
ENV SOVAP_ADMIN_SECRET="SuperSecretBackdoorKey"
ENV NODE_ENV="production"

# Start the server
CMD [ "node", "server.js" ]
