# syntax=docker/dockerfile:1
FROM node:20.14.0-bookworm-slim

# Install ffmpeg (needed to generate the synthetic test video)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy manifests first so dependency layer is cached separately from source
COPY package.json package-lock.json* ./
RUN npm install

# Install Playwright's Chromium browser and its system dependencies
RUN npx playwright install --with-deps chromium

# Copy application source
COPY . .

# Generate the synthetic test video into public/
RUN npm run generate:video

# Build the production bundle (also runs tsc type-check)
RUN npm run build

# Run unit tests then Playwright E2E tests
ENV CI=true
CMD ["npm", "test"]
