FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY client/package*.json ./client/
RUN npm install --prefix client

COPY . .
RUN npm run build:client

EXPOSE 5000

CMD ["node", "server/index.js"]
