# ---------- deps ----------
FROM node:24-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- build ----------
FROM node:24-slim AS build
WORKDIR /app
ENV NODE_ENV=production
ARG ENV_STAGE=staging

# deps siap dulu
COPY --from=deps /app/node_modules ./node_modules
# salin source
COPY . .

# Pakai .env.local supaya SELALU dibaca Next saat build
# (kalau file tidak ada, gagal; itu yang kita mau biar ketahuan)
RUN cp -f ".env.${ENV_STAGE}" .env.local \
 && echo "[Next build uses .env.local] ENV_STAGE=${ENV_STAGE}" \
 && echo "[.env.local size]" && wc -c .env.local \
 && echo "[.env.local keys]" \
 && sed -En 's/^[[:space:]]*(export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=.*/\2/p' .env.local | sort -u | head -n 50


# Build (output: standalone)
RUN npm run build # next.config.* = { output: 'standalone' }

# ---------- runtime ----------
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV HOSTNAME=0.0.0.0

# Pola Next standalone
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
CMD node -e "const http=require('http');const p=process.env.PORT||3000;http.get({host:'127.0.0.1',port:p,path:'/'},r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["node","server.js"]
