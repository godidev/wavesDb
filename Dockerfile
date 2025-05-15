FROM node:20-slim

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Instalar pm2 globalmente
RUN npm install -g pm2

# Copiar el código fuente necesario para la compilación
COPY .env ./dist/.env
COPY . .

# Generar el directorio dist
RUN npm run build

# Copiar dist (este paso puede ser redundante si dist ya está en el lugar correcto)
COPY dist ./dist

EXPOSE 3000

CMD ["pm2-runtime", "start", "./dist/index.js", "--name", "backend"]

# docker buildx build --platform linux/arm64 -t backend --output type=docker .
# docker save -o backend.tar backend:latest
# scp .\backend.tar crazy5147@192.168.1.69:~/backend.tar