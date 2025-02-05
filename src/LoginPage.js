import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Paper, Box } from '@mui/material';
import { useState } from 'react';
import './App.css';
import './LoginPage.css';

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAu5VHy8IyQmeTettqfui6I_zUGGdm-28w",
  authDomain: "collegemash-fde92.firebaseapp.com",
  projectId: "collegemash-fde92",
  storageBucket: "collegemash-fde92.appspot.com",
  messagingSenderId: "917282926405",
  appId: "1:917282926405:web:5ff92a32cddd56ff7dd82c",
  measurementId: "G-WYC9GM0JK8",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", userCredential.user);
      navigate('/profile');
    } catch (error) {
      console.error("Login error:", error.code, error.message);
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Box className="login-container">
      <Paper elevation={4} className="login-box">
        <img src="/gratify_logo.png" alt="Login Background" className="login-image" />
        <Box component="form" className="login-form" noValidate autoComplete="off">
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
          <Button variant="contained" fullWidth className="login-button" onClick={handleLogin}>
            Login
          </Button>
          <Button variant="outlined" fullWidth className="register-button" onClick={handleRegister}>
            Register
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginPage;
