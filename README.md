# Next.js Redis Demo

A scaled-down demo prototype integrating Next.js, React, and Redis to cache API responses from JSONPlaceholder, showcasing server-side and client-side rendering.

## Setup Instructions
### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- Yarn

### Environment Variables
Create a `.env` file in the root directory with:
```bash
REDIS_URL=redis://localhost:6380
API_BASE_URL=https://jsonplaceholder.typicode.com
NODE_ENV=development
DEFAULT_POSTS_LIMIT=10
REDIS_PORT=6380
APP_PORT=3000
```

### Running Locally
1. Clone the repository and navigate to the project directory.
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start the development environment:
   ```bash
   docker compose --profile dev up --build --remove-orphans
   ```
4. Access the app at `http://localhost:3000`.

### Running Production
```bash
docker compose --profile prod up --build
```

## Architecture Summary
- **Pages**:
  - `/`: Home page with static SSR content and a client-side rendered `PostList` component (dynamic import, SWR for data fetching).
  - `/posts`: Server-side rendered page using `getServerSideProps` to fetch and cache posts.
  - `/posts/[id]`: Client-side rendered post details page using SWR.
- **Redis Caching**: Managed in `lib/redis.js` with `getOrSetCache`, caching API responses with a 1-hour TTL for efficiency.
- **Data Fetching**:
  - **Client-Side**: SWR fetches paginated posts via `/api/posts`.
  - **Server-Side**: `getServerSideProps` fetches posts from JSONPlaceholder, cached in Redis.
- **API Routes**: `/api/posts` provides paginated posts with Redis caching; `/api/redis-test` verifies Redis connectivity.
- **Additional Features**: Pagination, error handling (`ErrorBoundary`), and Redis streams (partially implemented for real-time updates).

## Performance Metrics
- **API Response Time**: Redis caching reduces latency for API requests compared to uncached fetches, improving page load times.
- **Lighthouse Performance Score**:
  - Before: 85 (no caching, full bundle).
  - After: 92 (Redis caching, dynamic imports).
- **Testing Approach**:
  - Used Chrome DevTools for network timing and Lighthouse for performance scores.
  - Run `make performance` to generate a Lighthouse report at `reports/lighthouse.json`.

## Scaling Vision
To support millions of users, deploy multiple Next.js instances behind an AWS Application Load Balancer for traffic distribution. Use Redis Cluster with replication for high availability and sharding. Cache static assets and API responses via a CDN (Cloudflare) to reduce latency. Split the app into microservices (e.g., API gateway, post service) for independent scaling.

## Makefile Commands
- `make help`: List all commands.
- `make dev`: Start development environment with hot-reloading.
- `make test`: Run tests (limited coverage).
- `make performance`: Generate Lighthouse performance report.
- `make redis-cli`: Access Redis CLI.
- `make clean`: Remove containers and volumes.

## Limitations
- Limited test coverage (focuses on Redis caching, basic component tests).
- Redis streams for real-time updates are implemented but not fully integrated into the UI.
- Cache invalidation for dynamic dataset changes is not implemented.

## Notes
This is my first remote technical test, and while the project meets most objectives, some features (e.g., real-time updates, extensive testing) are incomplete due to time constraints. I’m eager to discuss my approach and potential improvements in an interview.
