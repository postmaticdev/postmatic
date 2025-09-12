# ---------- deps ----------
FROM node:24-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- build ----------
FROM node:24-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# (opsional build-time env — kalau kamu pakai)
ARG ENV_STAGE=staging
ARG NEXT_PUBLIC_API_ORIGIN
ARG API_ORIGIN
ENV NEXT_PUBLIC_API_ORIGIN=${NEXT_PUBLIC_API_ORIGIN}
ENV API_ORIGIN=${API_ORIGIN}

COPY . .
# Pastikan next.config.* = { output: 'standalone' }
RUN npm run build

# ---------- runtime ----------
FROM node:24-slim AS runner
WORKDIR /app

# Bind ke semua interface & mode produksi
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV HOSTNAME=0.0.0.0

# ⬇️ Pola recommended Next: taruh server.js di root image
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000

# Healthcheck yang toleran (beri waktu warm-up & cek GET /)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
CMD node -e "const http=require('http');const p=process.env.PORT||3000;function t(h){http.get({hostname:h,port:p,path:'/'},r=>process.exit(r.statusCode<500?0:1)).on('error',()=>h==='localhost'?t('127.0.0.1'):process.exit(1));}t('localhost');"

CMD ["node","server.js"]
