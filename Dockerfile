FROM oven/bun:1.2.22-alpine

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]
