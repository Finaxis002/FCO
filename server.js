const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy API requests
app.use(
  '/api',
  createProxyMiddleware({
    target: 'https://tumbledrybe.sharda.co.in',
    changeOrigin: true,
    secure: false,
  })
);

// Serve static files from the Vite build (dist) directory
app.use(express.static(path.join(__dirname, 'dist')));

// For SPA: serve index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Use PORT from environment, or default to 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
