FROM node:20-slim
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install
CMD ["pnpm", "run", "start"]
EXPOSE 5000