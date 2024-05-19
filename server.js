const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Use cors middleware to handle CORS headers
app.use('/genre', require('./routes/genre'));
app.use('/profile', require('./routes/profile'));

app.use(express.static(path.join(__dirname, 'src')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});