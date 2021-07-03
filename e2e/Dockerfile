FROM cypress/base:10
WORKDIR /app

COPY package.json .
COPY package-lock.json .

ENV CI=1
RUN npm ci
RUN npm run-script build

RUN npx cypress verify