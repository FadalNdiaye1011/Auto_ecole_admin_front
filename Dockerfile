# ======================
# 1️⃣ Build Angular
# ======================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration=production


# ======================
# 2️⃣ Nginx
# ======================
FROM nginx:alpine

# Supprimer config par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier la config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build Angular
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
