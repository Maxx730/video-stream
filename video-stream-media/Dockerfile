FROM node:20-alpine

# Install FFmpeg for HLS/DASH segmenting
RUN apk add --no-cache ffmpeg

# App setup
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy your JS source (e.g., server.js)
COPY . .

# Optional: set env for prod
ENV NODE_ENV=production

# Persist HLS/recordings to a mounted volume
# (Make sure your NMS config writes to ./media)
VOLUME ["/app/media"]

EXPOSE 1935 8000
CMD ["node", "index.js"]
