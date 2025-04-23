FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

RUN npm install -g pm2

COPY dist ./dist

EXPOSE 3000

CMD ["pm2-runtime", "start", "./dist/index.js", "--name", "backend"]

# docker buildx build --platform linux/arm64 -t backend --output type=docker .
# docker save -o backend.tar backend:latest
# scp .\backend.tar crazy5147@192.168.1.69:~/backend.tar