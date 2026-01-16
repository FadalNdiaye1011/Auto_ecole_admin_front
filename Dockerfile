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

RUN npm install -g serve

COPY --from=build /app/dist /app/dist

EXPOSE 4200

# ⚠️ IMPORTANT : browser
CMD ["serve", "-s", "dist/auto-ecole/browser", "-l", "4200"]
