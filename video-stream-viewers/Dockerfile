# Use official Node image
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 2276
CMD ["node", "dist/index.js"]