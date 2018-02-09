FROM node:carbon

WORKDIR /code/

COPY teach-share/package*.json ./

RUN npm install

COPY teach-share/. .

EXPOSE 8080

CMD [ "npm", "run", "dev" ]
