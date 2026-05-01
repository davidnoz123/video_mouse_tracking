# Docker and CI Notes

The Docker container should be capable of running the verifier without manual GUI access.

Recommended base image:

```Dockerfile
FROM node:20-bookworm-slim
```

Install Playwright dependencies using:

```bash
npx playwright install --with-deps chromium
```

Suggested Docker behaviour:

```bash
docker build -t video-tracker-test .
docker run --rm video-tracker-test
```

The container should:

1. install npm dependencies
2. generate the synthetic video if it is not checked in
3. run unit tests
4. run Playwright tests

Avoid:

- relying on network access after the build step
- hardcoded Windows paths
- local browser installations
- tests requiring visible GUI interaction

