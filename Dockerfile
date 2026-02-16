# -----------------------------
# Base Image
# -----------------------------
FROM node:20-alpine

# -----------------------------
# Create App Directory
# -----------------------------
WORKDIR /app

# -----------------------------
# Copy package files first
# (better layer caching)
# -----------------------------
COPY package*.json ./

# -----------------------------
# Install dependencies
# -----------------------------
RUN npm install --omit=dev

# -----------------------------
# Copy remaining source code
# -----------------------------
COPY . .

# -----------------------------
# Expose app port
# -----------------------------
EXPOSE 5000

# -----------------------------
# Start server
# -----------------------------
CMD ["node", "backend/server.js"]
