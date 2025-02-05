import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';
import {
  collection, addDoc, query, orderBy, onSnapshot,
  getDoc, doc
} from 'firebase/firestore';
import { Typography, Paper, TextField, Button, List, ListItem, ListItemText, Box } from '@mui/material';

function Community() {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [connections, setConnections] = useState([]);

  // Fetch user's connections
  useEffect(() => {
    if (!currentUser) return;

    const fetchConnections = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setConnections(userData.connections || []);
        }
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };

    fetchConnections();
  }, [currentUser]);

  // Fetch posts from Firestore (only from connections)
  useEffect(() => {
    if (!currentUser || connections.length === 0) return;

    const postsRef = collection(db, 'posts');
    const postsQuery = query(postsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const fetchedPosts = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(post => connections.includes(post.authorId) || post.authorId === currentUser.uid);

      setPosts(fetchedPosts);
    });

    return () => unsubscribe();
  }, [currentUser, connections]);

  // Handle post submission
  const handlePostSubmit = async () => {
    if (!postContent.trim() || !currentUser) return;

    try {
      // Fetch user data to get name
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      const authorName = userData?.name || "Anonymous"; // Get name from Firestore

      await addDoc(collection(db, 'posts'), {
        authorId: currentUser.uid,
        authorName: authorName, // Store fetched name instead of displayName
        content: postContent,
        timestamp: new Date(),
      });

      setPostContent('');
    } catch (error) {
      console.error("Error posting message:", error);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: '20px auto', maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        Community Posts
      </Typography>

      {/* Post Input */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Write something..."
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handlePostSubmit}>
          Post
        </Button>
      </Box>

      {/* Posts List */}
      <List sx={{ marginTop: 3 }}>
        {posts.length > 0 ? (
          posts.map(post => (
            <ListItem key={post.id} sx={{ borderBottom: '1px solid #ddd', paddingY: 2 }}>
              <ListItemText
                primary={<Typography variant="h6">{post.authorName}</Typography>} // Uses fetched name
                secondary={post.content}
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body1">No posts yet. Start by posting something!</Typography>
        )}
      </List>
    </Paper>
  );
}

export default Community;
