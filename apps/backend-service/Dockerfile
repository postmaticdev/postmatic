# ---------- deps ----------
FROM node:24-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- builder ----------
FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

# ---------- runtime ----------
FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
RUN apt-get update && apt-get install -y --no-install-recommends libssl3 ca-certificates \
&& rm -rf /var/lib/apt/lists/*

# package manifest harus ada sebelum prune
COPY --from=builder /app/package*.json ./
# bawa node_modules yang SUDAH digenerate prisma
COPY --from=builder /app/node_modules ./node_modules
# sisakan hanya prod deps
RUN npm prune --omit=dev

# app artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# kalau ada asset non-bundled:
# COPY --from=builder /app/src/public ./dist/public
# COPY --from=builder /app/src/views./dist/views

RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node","dist/index.js"]
