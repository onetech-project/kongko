FROM node:14

# Install pm2 as node process manager
RUN npm install pm2 -g

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install
# If you are building your code for production
RUN npm ci --only=production

# Bundle app source
COPY . .

# minify client side code
RUN node minify.js

# Binds app to port 3000
EXPOSE 3000

# Run the app by RUN Command
# RUN pm2 start

# Run the app by CMD command
CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]

# What's next?