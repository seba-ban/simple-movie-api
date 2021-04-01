FROM node:14.15-alpine as build

WORKDIR /app

COPY ./package*.json ./tsconfig.json ./
RUN npm install

RUN mkdir ./src
COPY ./src ./src
RUN npm run compile

FROM node:14.15-alpine

WORKDIR /app
COPY ./package*.json ./

ENV NODE_ENV=production

RUN npm install --production

RUN mkdir dist

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["npm", "start"]