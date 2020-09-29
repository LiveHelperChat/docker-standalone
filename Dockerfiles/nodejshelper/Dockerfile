FROM node:14.11.0-slim

LABEL maintainer="Remigijus Kiminas"
LABEL version="1.0"
LABEL description="Docker file for SocketCluster with support for clustering."

RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim"]

RUN mkdir -p /usr/src/
WORKDIR /usr/src/
COPY . /usr/src/

RUN npm install .

EXPOSE 8000

CMD ["npm", "run", "start:docker"]
