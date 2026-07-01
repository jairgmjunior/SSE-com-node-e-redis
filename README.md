# 🚀 SSE Node.js + Redis

This project is a Node.js application that uses Express and Redis to provide real-time data via SSE (Server-Sent Events). The application is packaged with Docker Compose for local execution with a Redis service.

## 🔍 Overview

- `index.js` creates an Express server that:
  - enables CORS with `cors`
  - serves static files from the `public` folder
  - exposes the `/stream` route as SSE
- `public/index.html` opens an `EventSource` to `/stream` and listens for `stock` events
- `docker-compose.yml` creates two services:
  - `app`: the Node.js application
  - `redis`: the Redis server
- `package.json` defines dependencies and scripts

## 📁 Main files

### `index.js` 🧩

- imports `express`, `cors` and the Redis client (`redis`)
- configures `express.static('public')` to serve `public/index.html`
- sets the `redisUrl` variable from `REDIS_URL`
- the `/stream` route:
  - sets SSE headers
  - creates and connects a Redis client on `redisUrl`
  - subscribes to the `notifications` channel
  - sends SSE events of type `stock` to the browser
  - keeps the connection open until the client closes it

### `public/index.html` 🌐

- is the page displayed in the browser
- creates an `EventSource('/stream')`
- uses `eventSource.addEventListener('stock', ...)` to update the content of `<p id="message">`
- displays messages received from the server in real time

### `package.json` 📦

Dependencies:

- `cors`: allows cross-origin requests
- `express`: HTTP server
- `ioredis`: alternative Redis client (still present in the project)
- `redis`: Redis client used in the current code
- `nodemon`: development tool to restart the app on changes

Scripts:

- `start`: `node index.js`
- `dev`: `nodemon index.js`

### `docker-compose.yml` 🐳

Configures two services:

- `app`
  - builds from the local Dockerfile
  - exposes port `3000`
  - mounts the project code into `/usr/src/app`
  - runs `npm install && npx nodemon index.js`
  - uses `REDIS_URL=redis://redis:6379`
  - depends on the `redis` service
- `redis`
  - uses the official `redis:latest` image
  - exposes port `6379`

It also defines the `rede_sse` network so the containers can communicate.

## ▶️ How to run

1. Open the terminal in the project folder:
2. Start Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. Open the browser at:
   ```
   http://localhost:3000/
   ```

## 🌐 What happens in the browser

- the page loads `public/index.html`
- the browser opens an `EventSource` to `/stream`
- when the Redis server publishes to the `notifications` channel, the Node server sends the SSE event named `stock`
- the browser automatically updates the text of `#message`

## 📝 Notes

- the current application expects Redis to publish messages to the `notifications` channel. Use this in the Redis terminal:
```bash
    127.0.0.1:6379> PUBLISH notifications "message to be sent..."
```

- Docker Compose uses `npx nodemon` for development, so changes in the code may automatically restart the server

## ⚠️ Points to note

- the Redis service is accessible internally as `redis:6379`
- the default URL used by the app is `redis://redis:6379` when `REDIS_URL` is not defined
- the current SSE sends events in the format:
  ```text
  event: stock
  data: <message>

  ```

