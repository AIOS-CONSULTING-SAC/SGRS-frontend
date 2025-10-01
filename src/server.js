const express = require('express');
const path = require('path'); 

const app = express();
const PORT = process.env.PORT || 3000;

const angularPath = path.join(__dirname, 'dist', 'sgrs-frontend');
app.use(express.static(angularPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(angularPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`App servida en http://localhost:${PORT}`);
});
