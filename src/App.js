import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import TabBar from './TabBar';
import Messages from './Messages';
import Community from './Community';
import Connections from './Connections';
import ViewProfile from './ViewProfile';
import Profile from './Profile';
import LoginPage from './LoginPage';
import RegisterPage from './Register';
import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Prevents blank screen by ensuring state is set
    });

    return () => unsubscribe(); // Cleanup function
  }, []);

  if (loading) return <div>Loading...</div>; // Prevent blank screen while checking auth

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {!user ? (
            <>
              <Route path="/" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" />} /> {/* Redirect unknown routes to login */}
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/connections" />} /> {/* Default route after login */}
              <Route path="/messages" element={<><TabBar /><Messages /></>} />
              <Route path="/community" element={<><TabBar /><Community /></>} />
              <Route path="/connections" element={<><TabBar /><Connections /></>} />
              <Route path="/profile/:userId" element={<ViewProfile />} /> {/* View other profiles */}
              <Route path="/profile" element={<><TabBar /><Profile /></>} /> {/* View own profile */}
              <Route path="*" element={<Navigate to="/connections" />} /> {/* Redirect unknown routes */}
            </>
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
