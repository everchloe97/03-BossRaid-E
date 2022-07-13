FROM node:16-alpine3.11

WORKDIR /boss-raid/
RUN apk update
RUN apk upgrade
RUN apk --no-cache add tzdata && \
        cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
        echo "Asia/Seoul" > /etc/timezone
COPY ./package.json /boss-raid/
COPY ./yarn.lock /boss-raid/
RUN yarn install
COPY . /boss-raid/
CMD yarn start:dev