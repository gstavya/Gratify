import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove, getDocs } from 'firebase/firestore';
import { Typography, Paper, TextField, List, ListItem, ListItemText, Button, Box, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText as MuiListItemText } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';

const SearchBar = styled(TextField)({
  marginBottom: '16px',
});

const ActionButton = styled(Button)({
  marginLeft: '10px',
});

// Styles for Teacher/Student toggle
const ToggleButton = styled(Box)(({ active }) => ({
  display: 'inline-block',
  padding: '10px 20px',
  margin: '0 5px',
  border: '1px solid #ccc',
  borderRadius: '20px',
  cursor: 'pointer',
  backgroundColor: active ? '#1976d2' : '#fff',
  color: active ? '#fff' : '#1976d2',
  fontWeight: 'bold',
  textAlign: 'center',
  '&:hover': {
    backgroundColor: '#1976d2',
    color: '#fff',
  },
}));

const schoolsList = ['American', 'Ardenwood', 'Azevada', 'Blacow', 'Brier', 'Bringhurst', 'Brookvale', 'Cabrillo', 'Centerville', 'Chadbourne', 'Durham', 'Forest Park', 'Glenmoor', 'Gomes', 'Green', 'Grimmer', 'Hirsch', 'Hopkins', 'Horner', 'Irvington', 'Kennedy', 'Leitch', 'Maloney', 'Mattos', 'Millard', 'Mission San Jose Elementary', 'Mission San Jose High', 'Mission Valley', 'Niles', 'Oliveria', 'Parkmont', 'Patterson', 'Robertson', 'Thornton', 'Vallejo Mill', 'Walters', 'Warm Springs', 'Warwick', 'Washington', 'Weibel']; // List of schools

function Connections() {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigate = useNavigate(); // Hook for navigation

  const [nameFilter, setNameFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState([]); // Multi-select schools
  const [roleFilter, setRoleFilter] = useState(''); // Role: Teacher/Student toggle
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingUserProfiles, setPendingUserProfiles] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        let usersList = [];

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (doc.id !== currentUser.uid) {
            usersList.push({
              id: doc.id,
              name: userData.name,
              schools: userData.schools || [],
              role: userData.role || '',
            });
          }
        });

        const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (currentUserDoc.exists()) {
          const userData = currentUserDoc.data();
          setConnections(userData.connections || []);
          setPendingRequests(userData.pendingRequests || []);
          setSentRequests(userData.sentRequests || []);
        }

        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [currentUser]);

  // Fetch profile for each pending request
  useEffect(() => {
    const fetchPendingProfiles = async () => {
      let profiles = {};
      for (let userId of pendingRequests) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          profiles[userId] = userDoc.data().name; // Store name of the user
        }
      }
      setPendingUserProfiles(profiles);
    };

    if (pendingRequests.length > 0) {
      fetchPendingProfiles();
    }
  }, [pendingRequests]);

  const handleSendRequest = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        pendingRequests: arrayUnion(currentUser.uid),
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        sentRequests: arrayUnion(userId),
      });

      setSentRequests([...sentRequests, userId]);
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        connections: arrayUnion(userId),
        pendingRequests: arrayRemove(userId),
      });

      await updateDoc(doc(db, 'users', userId), {
        connections: arrayUnion(currentUser.uid),
        sentRequests: arrayRemove(currentUser.uid),
      });

      setConnections([...connections, userId]);
      setPendingRequests(pendingRequests.filter((id) => id !== userId));
    } catch (error) {
      console.error('Error accepting connection:', error);
    }
  };

  // Filter out users who are already connected or have pending requests
  const applyFilters = () => {
    const result = users.filter((user) => {
      const nameMatches = user.name.toLowerCase().includes(nameFilter.toLowerCase());
      const schoolMatches = schoolFilter.length === 0 || schoolFilter.some((school) => user.schools.includes(school));
      const roleMatches = roleFilter ? user.role === roleFilter : true;

      return (
        !connections.includes(user.id) && // Exclude already connected users
        !sentRequests.includes(user.id) && // Exclude users the current user has already sent a request to
        !pendingRequests.includes(user.id) && // Exclude users with pending requests
        nameMatches && schoolMatches && roleMatches
      );
    });

    setFilteredUsers(result);
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: '20px auto', maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        Find Connections
      </Typography>

      {/* Filters */}
      <Box sx={{ marginBottom: 3 }}>
        <SearchBar
          label="Filter by Name"
          variant="outlined"
          fullWidth
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />

        {/* Multi-select Schools */}
        <FormControl fullWidth variant="outlined" sx={{ marginTop: 2 }}>
          <InputLabel>Filter by Schools</InputLabel>
          <Select
            multiple
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            label="Filter by Schools"
            renderValue={(selected) => selected.join(', ')}
          >
            {schoolsList.map((school, index) => (
              <MenuItem key={index} value={school}>
                <Checkbox checked={schoolFilter.includes(school)} />
                <MuiListItemText primary={school} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Teacher/Student Toggle (Clickable Rectangles) */}
        <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}>
          <ToggleButton
            active={roleFilter === 'Teacher'}
            onClick={() => setRoleFilter('Teacher')}
          >
            Teacher
          </ToggleButton>
          <ToggleButton
            active={roleFilter === 'Student'}
            onClick={() => setRoleFilter('Student')}
          >
            Student
          </ToggleButton>
        </Box>
      </Box>

      {/* Search Button */}
      <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" color="primary" onClick={applyFilters}>
          Search
        </Button>
      </Box>

      {/* List of users */}
      <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>
        Suggested Users:
      </Typography>
      <List>
        {filteredUsers.map((user) => (
          <ListItem key={user.id}>
            <ListItemText primary={user.name} />
            <ActionButton
              variant="contained"
              color="primary"
              onClick={() => handleSendRequest(user.id)}
            >
              Send Request
            </ActionButton>
            <ActionButton
              variant="outlined"
              color="secondary"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              View Profile
            </ActionButton>
          </ListItem>
        ))}
      </List>

      {/* Pending requests */}
      <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>
        Pending Requests:
      </Typography>
      <List>
        {pendingRequests.map((userId) => (
          <ListItem key={userId}>
            <ListItemText
              primary={`Request from ${pendingUserProfiles[userId] || 'Loading...'} `}
            />
            <ActionButton
              variant="contained"
              color="primary"
              onClick={() => handleAcceptRequest(userId)}
            >
              Accept
            </ActionButton>
            <ActionButton
              variant="outlined"
              color="secondary"
              onClick={() => navigate(`/profile/${userId}`)}
            >
              View Profile
            </ActionButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default Connections;
