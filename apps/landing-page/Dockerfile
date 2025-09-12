# ---------- deps ----------
FROM node:24-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- build ----------
FROM node:24-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# (opsional build-time env)
ARG ENV_STAGE=staging
ARG NEXT_PUBLIC_API_ORIGIN
ARG API_ORIGIN
ENV NEXT_PUBLIC_API_ORIGIN=${NEXT_PUBLIC_API_ORIGIN}
ENV API_ORIGIN=${API_ORIGIN}

COPY . .
RUN npm run build # next.config.* = { output: 'standalone' }

# ---------- runtime ----------
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
PORT=3000 \
HOSTNAME=0.0.0.0# <- pastikan bind ke semua interface

# copy seluruh .next & public dengan ownership user node
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000

# Healthcheck yang lebih toleran (HEAD /, timeout lebih lega)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
CMD node -e "const http=require('http');const req=http.request({host:'127.0.0.1',port:process.env.PORT||3000,method:'HEAD',path:'/'},res=>process.exit(res.statusCode<500?0:1));req.on('error',()=>process.exit(1));req.end()"

CMD ["node",".next/standalone/server.js"]
