# biletsatis backend — pratik tarzı
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm prune --production

RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "dist/app.js"]
