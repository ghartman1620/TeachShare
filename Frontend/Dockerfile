FROM node:0.12.7
RUN mkdir /code

# change working directory
WORKDIR /code/teach-share/

# copy this all to container
ADD . /code/

# get dependencies...
RUN npm install

# expose the correct port
EXPOSE 8080
