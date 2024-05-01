
# == Base stage

FROM node:20-alpine AS base

RUN npm i -g pnpm@8.10.0


# == New stage for builder

FROM base as builder

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install

COPY . .

# Creates a "dist" folder with the production build
RUN pnpm run build
RUN pnpm prune --prod


# == New stage for production
FROM base as production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist

EXPOSE 9000

CMD [ "pnpm", "run", "start:migrate:prod" ]

