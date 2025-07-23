const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(express.urlencoded({ extended: true }));

app.post('/auth', (req, res) => {
  const { name } = req.body;
  const creds = name.split("_")
  if (creds.length > 1 && readAccessFile(creds[0], creds[1])) {
    res.status(200).send('GRANTED');
  } else {
    res.status(403).send('DENIED');
  }
});

app.listen(2599, () => {});

function readAccessFile(username, password) {
  try {
    const absolutePath = path.resolve("./access.json");
    const data = fs.readFileSync(absolutePath, 'utf-8');
    const access = JSON.parse(data);
    return Object.keys(access).indexOf(username) > -1 && access[username] === password;
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return false;
  }
}