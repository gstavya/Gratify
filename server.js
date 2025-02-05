// server.js (backend)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // For cross-origin requests (if needed)
const app = express();

const users = [
  { email: 'user@example.com', password: 'password123' }, // Example user
];

app.use(cors()); // Enable CORS if frontend and backend are on different ports
app.use(bodyParser.json()); // Parse JSON request body

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    // Successful login, return success response or token
    res.json({ success: true, message: 'Login successful!' });
  } else {
    // Incorrect credentials, return 401 Unauthorized
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
