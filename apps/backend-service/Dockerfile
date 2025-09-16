# ---------- runtime ----------
FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0

# lib yg dibutuhkan (boleh tetap)
RUN apt-get update && apt-get install -y --no-install-recommends libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

ARG GIT_SHA=unknown
ENV GIT_SHA=$GIT_SHA
LABEL org.opencontainers.image.revision=$GIT_SHA

# 👉 Install HANYA prod deps (masih root)
COPY --chown=node:node package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# 👉 Salin artefak app
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma

# 👉 Generate Prisma client terhadap node_modules runtime
RUN npx -y prisma@5.22.0 generate

# ✅ Buat direktori yang akan dipakai untuk tulis & beri ownership ke user node
#    (tambahkan direktori lain bila perlu, mis. /app/uploads)
RUN install -d -o node -g node -m 0775 /app/temp

# (opsional) jika ingin semua isi /app milik node:
# RUN chown -R node:node /app

USER node
EXPOSE 3000
CMD ["node","dist/index.js"]
