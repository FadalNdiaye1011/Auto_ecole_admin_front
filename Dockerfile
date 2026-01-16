# =========================
# Étape 1 : Build Angular
# =========================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration=production


# =========================
# Étape 2 : Run avec Node
# =========================
FROM node:20-alpine

WORKDIR /app

# Installer un serveur statique léger
RUN npm install -g serve

# Copier le build Angular
# ⚠️ Remplace "auto-ecole-admin" par le nom réel du dossier dans dist
COPY --from=build /app/dist /app/dist

EXPOSE 3000

# Servir l'app Angular
CMD ["serve", "-s", "dist", "-l", "3000"]
