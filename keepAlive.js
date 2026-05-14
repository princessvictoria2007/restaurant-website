// keepAlive.js — pings the server every 14 minutes to prevent Render sleep
const https = require('https');

function keepAlive() {
  https.get('https://restaurant-website-0cxq.onrender.com/health', (res) => {
    console.log(`🏓 Keep-alive ping: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('Keep-alive error:', err.message);
  });
}

setInterval(keepAlive, 14 * 60 * 1000); // every 14 minutes
module.exports = keepAlive;