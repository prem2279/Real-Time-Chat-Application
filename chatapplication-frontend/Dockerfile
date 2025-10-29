# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# 1. Define a BUILD ARGUMENT for the environment variable
ARG VITE_API_URL

# 2. Set the environment variable using the build argument
ENV VITE_API_URL=${VITE_API_URL}

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Build the application.
# VITE injects VITE_ prefixed environment variables here.
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine

# Copy the custom Nginx configuration file into the default Nginx config directory
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build artifacts from the 'build' stage into Nginx's web root
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]