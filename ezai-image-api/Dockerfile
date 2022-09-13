FROM node:16.15.0
WORKDIR /usr/src/app
RUN apt-get update && apt install tesseract-ocr -y
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8081
CMD [ "node", "index.js" ]
