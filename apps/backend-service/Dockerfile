# ---------- deps ----------
FROM node:24-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- build ----------
FROM node:24-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
# optional: generate untuk typecheck; tidak dipakai runtime
RUN npx -y prisma@5.22.0 generate
COPY . .

ARG GIT_SHA=dev
ARG ENV_NAME=local
ENV GIT_SHA=$GIT_SHA ENV_NAME=$ENV_NAME

RUN npm run build
RUN mkdir -p dist && echo "{\"sha\":\"$GIT_SHA\"}" > dist/version.json

# ---------- runtime ----------
FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0
RUN apt-get update && apt-get install -y --no-install-recommends libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*
ARG GIT_SHA=unknown
ENV GIT_SHA=$GIT_SHA
LABEL org.opencontainers.image.revision=$GIT_SHA

# 👉 Install HANYA prod deps
COPY --chown=node:node package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# 👉 Salin artefak app
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma

# 👉 Generate Prisma client terhadap node_modules runtime (pakai npx CLI; cepat)
RUN npx -y prisma@5.22.0 generate

USER node
EXPOSE 3000
CMD ["node","dist/index.js"]
