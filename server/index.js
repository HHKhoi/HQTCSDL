const dns = require('dns');
dns.setServers(['8.8.8.8']);
const app = require('./app');
const db = require('./shared/database/db');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
const PORT = process.env.PORT || 5000;

db.connect().then(async () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to database', err);
  process.exit(1);
});
