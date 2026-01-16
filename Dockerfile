# Étape 1 : builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copies package.json + package-lock.json pour tirer les dépendances (cache)
COPY package*.json ./

# Installer les dépendances (production build)
RUN npm ci

# Copier le reste du projet
COPY . .

# Construire Next.js
RUN npm run build

# Étape 2 : image finale légère
FROM node:18-alpine AS runner
WORKDIR /app

# Variables d'environnement recommandées
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copier uniquement ce qui est nécessaire pour exécuter la build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public


EXPOSE 3000

# S'assurer que le script start existe dans package.json: "next start -p 3000"
CMD ["npm", "run", "start"]
