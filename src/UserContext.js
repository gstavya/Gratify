import React, { createContext, useContext, useState } from 'react';

// Create a UserContext
const UserContext = createContext();

// Create a UserProvider component
export const UserProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <UserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook to use the UserContext
export const useUser = () => useContext(UserContext);
