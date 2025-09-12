# ---------- deps ----------
FROM node:24-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- build ----------
FROM node:24-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Salin source dulu
COPY . .

# Pilih env file untuk build Next (default: staging)
ARG ENV_STAGE=staging
# Pakai .env.local agar selalu dibaca Next saat build
COPY .env.${ENV_STAGE} .env.production

RUN npm run build   # next.config.* = { output: 'standalone' }

# ---------- runtime ----------
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV HOSTNAME=0.0.0.0

# Pola Next standalone yang stabil
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
  CMD node -e "const http=require('http');const p=process.env.PORT||3000;function t(h){http.get({hostname:h,port:p,path:'/'},r=>process.exit(r.statusCode<500?0:1)).on('error',()=>h==='localhost'?t('127.0.0.1'):process.exit(1));}t('localhost');"

CMD ["node","server.js"]
