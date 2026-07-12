# ---- Case Watch API ----
FROM node:22-alpine

WORKDIR /app

# Yarn 4 via corepack (lê o campo "packageManager" do package.json)
RUN corepack enable

# 1) deps primeiro (aproveita o cache de layer do Docker)
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

# 2) o resto do código
COPY . .

# a API sobe na 3000 (configurável via PORT)
EXPOSE 3000

# roda via tsx: mesmo runtime do dev, lida com ESM + decorators do TypeORM.
# (as migrations devem ter sido aplicadas — ver README)
CMD ["yarn", "tsx", "src/server.ts"]
