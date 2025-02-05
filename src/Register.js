import React, { useState } from 'react';
import { TextField, Button, Typography, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      console.log("User registered:", newUser.uid);

      // Add user to Firestore with default values
      await setDoc(doc(db, 'users', newUser.uid), {
        name: username,
        email: email,
        connections: [],
        sentRequests: [],
        pendingRequests: [],
        bio: "Hello! I'm new here.",
        age: "N/A",
        schools: [],
      });

      // Redirect to messages page after successful registration
      navigate('/messages');
    } catch (error) {
      console.error("Registration error:", error.code, error.message);
      setError(error.message); // Display error to user
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, margin: '50px auto' }}>
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Confirm Password"
          type="password"
          variant="outlined"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleRegister}>
          Register
        </Button>
        <Button variant="text" color="secondary" fullWidth onClick={() => navigate('/')}>
          Already have an account? Login
        </Button>
      </Box>
    </Paper>
  );
}

export default RegisterPage;
