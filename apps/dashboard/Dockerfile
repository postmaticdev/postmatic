# ---------- deps ----------
FROM node:24-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- build ----------
FROM node:24-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# (opsional kalau kamu pakai build-time env)
ARG ENV_STAGE=staging
# kalau kamu pakai “copy .env.${ENV_STAGE} -> .env.production”, taruh di sini sebelum build:
COPY .env.${ENV_STAGE} .env.production

COPY . .
RUN npm run build # next.config.{js,ts} = { output: "standalone" }

# ---------- runtime ----------
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0

# 👉 Salin seluruh .next & public dengan kepemilikan user node
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
CMD node -e "require('http').get('http://127.0.0.1:'+process.env.PORT, r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["node",".next/standalone/server.js"]
