# Build the static Vite bundle, then serve it from an unprivileged Nginx image.
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=${VITE_API_URL}
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
