# Etapa 1: Build de Angular
FROM node:20-alpine as builder
WORKDIR /sgrs-frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor NGINX
FROM nginx:alpine
COPY --from=builder /sgrs-frontend/dist/sgrs-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
