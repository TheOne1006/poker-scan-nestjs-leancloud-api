FROM node:24.11.1-alpine AS builder
WORKDIR /usr/app
COPY ./package.json /usr/app/package.json
COPY ./package-lock.json /usr/app/package-lock.json
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install
COPY ./config /usr/app/config
COPY ./nest-cli.json /usr/app/nest-cli.json
COPY ./tsconfig.json /usr/app/tsconfig.json
COPY ./src /usr/app/src
RUN npm run build


FROM node:24.11.1-alpine as cache
LABEL stage=cache
RUN npm config set registry https://registry.npmmirror.com/
WORKDIR /usr/app

COPY ./package.json /usr/app/package.json
COPY ./package-lock.json /usr/app/package-lock.json
COPY ./config /usr/app/config
COPY ./nest-cli.json /usr/app/nest-cli.json
COPY ./tsconfig.json /usr/app/tsconfig.json
RUN npm install --omit=dev
FROM cache
COPY --from=builder /usr/app/dist ./dist

# COPY ./ /usr/app

EXPOSE 3000

CMD npm run start:prod
