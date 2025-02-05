import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home, People, Chat, AccountCircle } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

function TabBar() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current path
  const [value, setValue] = useState(location.pathname); // Keep track of selected tab

  console.log("Current route:", location.pathname); // Debugging

  const handleChange = (event, newValue) => {
    console.log("Navigating to:", newValue); // Debugging
    setValue(newValue); // Update active tab
    navigate(newValue); // Navigate to new route
  };

  return (
    <BottomNavigation value={value} onChange={handleChange}>
      <BottomNavigationAction label="Messages" value="/messages" icon={<Chat />} />
      <BottomNavigationAction label="Community" value="/community" icon={<People />} />
      <BottomNavigationAction label="Connections" value="/connections" icon={<Home />} />
      <BottomNavigationAction label="Profile" value="/profile" icon={<AccountCircle />} />
    </BottomNavigation>
  );
}

export default TabBar;