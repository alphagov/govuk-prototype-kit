FROM node:8.12-alpine

ADD . /app
WORKDIR /app

ARG COLLECT_USAGE_DATA=true

RUN npm install
RUN echo "{\"collectUsageData\": $COLLECT_USAGE_DATA}" > usage-data-config.json

EXPOSE 3000
CMD ["npm", "start"]
