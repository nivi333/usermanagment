FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache curl
RUN npm ci --only=production
COPY . .

COPY wait-for-postgres.sh /wait-for-postgres.sh
RUN chmod +x /wait-for-postgres.sh
EXPOSE 3000
ENTRYPOINT ["/wait-for-postgres.sh", "postgres"]
CMD ["node", "index.js"]
