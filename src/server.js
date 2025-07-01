const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Proxy para API externa
app.use('/api', createProxyMiddleware({
  target: 'http://173.249.13.28:9099/sgrs-backend',
  changeOrigin: true

}));

const angularPath = path.join(__dirname, 'dist', 'sgrs-frontend');
app.use(express.static(angularPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(angularPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`App servida en http://localhost:${PORT}`);
});
