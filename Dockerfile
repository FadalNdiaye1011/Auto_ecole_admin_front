## =========================
## Étape 1 : Build Angular
## =========================
#FROM node:20-alpine AS build
#
#WORKDIR /app
#
#COPY package*.json ./
#RUN npm ci
#
#COPY . .
#RUN npm run build -- --configuration=production
#
#
## =========================
## Étape 2 : Run avec Node
## =========================
#FROM node:20-alpine
#
#WORKDIR /app
#
#RUN npm install -g serve
#
#COPY --from=build /app/dist /app/dist
#
#EXPOSE 4200
#
## ⚠️ IMPORTANT : browser
#CMD ["serve", "-s", "dist/auto-ecole/browser", "-l", "4200"]








# =========================
# Étape 1 : Build Angular
# =========================
FROM node:20-alpine AS build

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./
RUN npm ci --omit=dev

# Copier le reste des fichiers
COPY . .

# Build Angular en production
RUN npm run build -- --configuration=production

# =========================
# Étape 2 : Servir avec Nginx (plus léger que Node)
# =========================
FROM nginx:alpine

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=build /app/dist/auto-ecole/browser /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


