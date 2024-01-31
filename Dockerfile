#Stage 1
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json .
COPY yarn*.lock .
RUN yarn install
COPY . .
CMD ["yarn", "start"]


FROM node:18-alpine AS builder
ENV NODE_ENV production
# Add a work directory
WORKDIR /app
# Cache and Install dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn install --production
# Copy app files
COPY . .
# Build the app
RUN yarn build

# Bundle static assets with nginx
FROM nginx:1.25.3-alpine as production
ENV NODE_ENV production
# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html
# Add your nginx.conf
COPY ./docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
