FROM node:10.13.0

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./

RUN npm ci
CMD ["npm", "run", "serve"]
