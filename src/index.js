const _ = require('lodash');
const minimist = require('minimist');
const axios = require('axios');
const express = require('express');

const args = minimist(process.argv.slice(2));
const app = express();

app.get('/user/:id', async (req, res) => {
  const profile = _.merge({}, req.query, { id: req.params.id });
  const upstream = await axios.get(`https://api.example.com/users/${profile.id}`);
  res.json(upstream.data);
});

app.get('/search', (req, res) => {
  const query = req.query.q || '';
  res.send(`<h1>Results for ${query}</h1>`);
});

const port = args.port || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
