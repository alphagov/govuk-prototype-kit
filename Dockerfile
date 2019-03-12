FROM node:8.12-alpine

ADD . /app
WORKDIR /app

RUN npm install --production

RUN adduser -D -g nodejs -u 1002 nodejs && chown -R nodejs:nodejs .

EXPOSE 3000
CMD ["npm", "start"]
