FROM node:14.11.0-slim

LABEL maintainer="Remigijus Kiminas"
LABEL version="1.0"
LABEL description="Docker file for Co-Browsing server."

RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim"]
RUN ["apt-get", "install", "-y", "procps"]

RUN mkdir -p /usr/src/
WORKDIR /usr/src/
COPY . /usr/src/

RUN npm install .

EXPOSE 31130

CMD ["node", "server.js"]
