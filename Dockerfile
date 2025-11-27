FROM node:12.13.1-alpine AS builder
WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/package.json
COPY ./yarn.lock /usr/src/app/yarn.lock
RUN npm set registry https://registry.npm.taobao.org && \
  npm install -g yarn
RUN yarn install
COPY ./ /usr/src/app
# RUN yarn install --verbose
RUN yarn build


FROM node:lst as cache
LABEL stage=cache
RUN npm set registry https://registry.npm.taobao.org && \
  npm install -g yarn
WORKDIR /usr/src/app

COPY ./package.json /usr/src/app/package.json
COPY ./yarn.lock /usr/src/app/yarn.lock
RUN yarn install --production
FROM cache
COPY --from=builder /usr/src/app/dist ./dist

# RUN yarn install --production --verbose
COPY ./ /usr/src/app

# RUN npm run tsc

EXPOSE 80

CMD yarn start:prod
