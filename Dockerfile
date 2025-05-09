# Stage 1: Builder/Development
FROM node:18-alpine AS builder

# Create working directory
WORKDIR /app

# Generate default package.json if none exists
RUN if [ ! -f package.json ]; then \
      echo '{\
        "name": "nextjs-redis-demo",\
        "version": "1.0.0",\
        "scripts": {\
          "dev": "next dev",\
          "build": "next build",\
          "start": "next start",\
          "test": "jest",\
          "lint": "eslint ."\
        },\
        "dependencies": {\
          "next": "^14.1.0",\
          "react": "^18.2.0",\
          "react-dom": "^18.2.0",\
          "redis": "^4.6.5",\
          "swr": "^2.2.0"\
        },\
        "devDependencies": {\
          "eslint": "^8.56.0",\
          "eslint-config-next": "^14.1.0",\
          "jest": "^29.7.0",\
          "testing-library": "^0.0.2"\
        }\
      }' > package.json && \
      yarn install; \
    fi

# Copy package files first (if they exist)
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install

# Copy all other files
COPY . .

# Stage 2: Production
FROM node:18-alpine AS production
WORKDIR /app

COPY --from=builder /app .
RUN yarn build

EXPOSE 3000
CMD ["yarn", "start"]