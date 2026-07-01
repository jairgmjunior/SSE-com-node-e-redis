const express = require('express');
const port = process.env.PORT || 3000;
const cors = require('cors');
const { RedisClient } = require('redis');

const app = express();
app.use(cors());
app.use(express.static('public'));

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

app.get('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const redisClient = new RedisClient({"url": redisUrl });
  await redisClient.connect();

  await redisClient.subscribe('notifications', (message) => {
    res.write(
        "event: stock" + "\n" +
        "data: " + message + "\n\n"
    );
  });

  req.on('close', async () => {
    res.end();
  });
  
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
  console.log(`Redis connected at ${redisUrl}`);
});
