# Stage 1: Build the React app
FROM node:20.10.0-alpine as build

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

# Expose port 4000
EXPOSE 4000

# Start the React app
CMD ["npm", "start"]
