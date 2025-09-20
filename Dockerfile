FROM node:23-alpine

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
