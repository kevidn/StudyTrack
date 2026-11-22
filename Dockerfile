# Multi-stage Dockerfile for StudyTrack
FROM node:20-alpine AS builder

WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend ./frontend
RUN cd frontend && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

COPY backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 4000
CMD ["node", "backend/server.js"]
