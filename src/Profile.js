import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Paper, Box, Autocomplete, FormControlLabel, Switch } from '@mui/material';
import { auth, db } from './firebase'; // Import Firebase config (auth & firestore)
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore functions
import { signOut, updatePassword } from 'firebase/auth'; // Import signOut and updatePassword for authentication
import './Profile.css';

function Profile() {
  // State for profile data and edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [schools, setSchools] = useState([]); // State for multiple schools
  const [role, setRole] = useState('Student'); // Default role is Student

  const schoolsList = ['American', 'Ardenwood', 'Azevada', 'Blacow', 'Brier', 'Bringhurst', 'Brookvale', 'Cabrillo', 'Centerville', 'Chadbourne', 'Durham', 'Forest Park', 'Glenmoor', 'Gomes', 'Green', 'Grimmer', 'Hirsch', 'Hopkins', 'Horner', 'Irvington', 'Kennedy', 'Leitch', 'Maloney', 'Mattos', 'Millard', 'Mission San Jose Elementary', 'Mission San Jose High', 'Mission Valley', 'Niles', 'Oliveria', 'Parkmont', 'Patterson', 'Robertson', 'Thornton', 'Vallejo Mill', 'Walters', 'Warm Springs', 'Warwick', 'Washington', 'Weibel']; // List of schools

  // Fetch the user's profile from Firestore when the component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        // Reference to the user's Firestore document using their UID
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setName(userData.name || '');
          setEmail(userData.email || '');
          setBio(userData.bio || '');
          setAge(userData.age || '');
          setSchools(userData.schools || []); // Set schools to an array
          setRole(userData.role || 'Student'); // Set role, default to Student
        }
      }
    };

    fetchUserProfile();
  }, []); // Runs once when the component is mounted

  // Save changes to Firestore
  const handleSaveClick = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        // Update only changed fields in Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          name,
          bio,
          age,
          schools, // Save selected schools as an array
          role, // Save role (Teacher or Student)
        });
        console.log('Profile saved successfully!');
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving profile: ', error);
      }
    }
  };

  // Handle password update logic
  const handlePasswordChange = async () => {
    const user = auth.currentUser;
    if (user && password) {
      try {
        // Update the password using Firebase Authentication
        await updatePassword(user, password);
        console.log('Password updated successfully!');
      } catch (error) {
        console.error('Error updating password:', error);
      }
    }
  };

  // Toggle edit mode
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully!');
      // Optionally, you can redirect the user to the login page after logging out:
      // navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 600, margin: '50px auto' }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
        noValidate
        autoComplete="off"
      >
        {/* Name */}
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!isEditing}
        />

        {/* Email (Read-only) */}
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          disabled
        />

        {/* Bio */}
        <TextField
          label="Bio"
          variant="outlined"
          fullWidth
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={!isEditing}
          multiline
          rows={4}
        />

        {/* Age */}
        <TextField
          label="Age"
          variant="outlined"
          fullWidth
          value={age}
          onChange={(e) => setAge(e.target.value)}
          disabled={!isEditing}
          type="number"
        />

        {/* School Dropdown (Searchable, Multiple Selections) */}
        <Autocomplete
          multiple
          disablePortal
          id="school-dropdown"
          value={schools}
          onChange={(event, newValue) => setSchools(newValue)} // Update state with selected schools
          options={schoolsList}
          renderInput={(params) => <TextField {...params} label="Schools" />}
          disabled={!isEditing}
        />

        {/* Role Toggle (Teacher/Student) */}
        <FormControlLabel
          control={
            <Switch
              checked={role === 'Teacher'}
              onChange={(e) => setRole(e.target.checked ? 'Teacher' : 'Student')}
              disabled={!isEditing}
            />
          }
          label={role === 'Teacher' ? 'Teacher' : 'Student'}
        />

        {/* Buttons */}
        {!isEditing ? (
          <Button variant="contained" color="primary" fullWidth onClick={handleEditClick}>
            Edit
          </Button>
        ) : (
          <>
            <Button variant="contained" color="primary" fullWidth onClick={handleSaveClick}>
              Save Changes
            </Button>
            <Button variant="outlined" color="secondary" fullWidth onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </>
        )}

        {/* Log Out Button */}
        <Button variant="outlined" color="error" fullWidth onClick={handleLogout} sx={{ marginTop: 2 }}>
          Log Out
        </Button>
      </Box>
    </Paper>
  );
}

export default Profile;
