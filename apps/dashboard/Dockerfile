# ---------- deps ----------
FROM node:24-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- build ----------
FROM node:24-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

ARG ENV_STAGE=staging
# contoh: .env.staging → disalin menjadi .env.production sebelum build
COPY .env.${ENV_STAGE} .env.production

COPY . .

# Pastikan next.config.js berisi: module.exports = { output: 'standalone' }
RUN npm run build

# ---------- runtime ----------
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# copy hasil standalone build
COPY --from=build /app/.next/standalone ./ 
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

RUN mkdir -p .next/cache && chown -R node:node /app
RUN chown -R node:node /app
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD node -e "require('http').get('http://127.0.0.1:'+process.env.PORT, r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["node","server.js"]

