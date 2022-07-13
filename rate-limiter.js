import bodyParse from 'body-parser';
import cors from 'cors';
import express from 'express';

const corsOptions = {
  origin: '*'
};

const app = express();
app.use(cors(corsOptions));
app.use(bodyParse.json());

const INITIAL_LIMIT = 5;
const TIMEOUT = 10000;
const limiter = new Map();

app.get('/', (req, res) => {
  const apiKey = req.body['api_key'];

  if (!apiKey) {
    return res.status(400).send('Invalid API key');
  }

  const isRequestAllowed = apiLimiter(apiKey);
  if (!isRequestAllowed) {
    return res.status(400).send('You excided number of request for API key - ' + apiKey);
  }

  return res.status(200).send('API response');
});

function apiLimiter(apiKey) {
  const currentTime = new Date().getTime();

  // FIRST REQUEST
  if (!limiter.has(apiKey)) {
    limiter.set(apiKey, [currentTime, INITIAL_LIMIT]);
    return true;
  }

  // TIMEOUT IS FINISHED FOR REQUEST
  const [time, limit] = limiter.get(apiKey);
  const timeDifference = getTimeDifference(currentTime, time);
  console.log('currentTime', currentTime);
  console.log('time', time);
  console.log('timeDifference', timeDifference);

  if (timeDifference > TIMEOUT) {
    console.log('reset limits for API key: ', apiKey);
    limiter.set(apiKey, [currentTime, INITIAL_LIMIT - 1]);
    return true;
  }

  // EXCITED LIMIT OF REQUESTS
  if (limit > 0) {
    limiter.set(apiKey, [currentTime, limit - 1]);
    return true;
  }

  // REQUEST IS FORBIDDEN
  return false;
}

function getTimeDifference(time1, time2) {
  return time1 - time2;
}

app.listen('5000', () => {
  console.log(`Listening on port 5000`);
});