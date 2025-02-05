import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './UserContext'; // Ensure this path is correct

// Create root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app wrapped in UserProvider
root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);

// Measure performance
reportWebVitals();
