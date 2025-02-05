import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Typography, Paper, TextField, List, ListItem, ListItemText, Button, Box } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom'; // Import navigate hook
import './Messages.css'

const SearchBar = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const SendButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(2),
}));

function Messages() {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const navigate = useNavigate(); // Initialize navigate hook

    const [connections, setConnections] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!currentUser) {
            console.warn("No current user found. Waiting for authentication...");
            return;
        }

        const fetchConnections = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.connections) {
                        // Fetch connection details
                        const connectionDetails = await Promise.all(
                            userData.connections.map(async (connectionId) => {
                                const connectionDoc = await getDoc(doc(db, 'users', connectionId));
                                if (connectionDoc.exists()) {
                                    return { id: connectionId, name: connectionDoc.data().name };
                                }
                                return null;
                            })
                        );

                        setConnections(connectionDetails.filter(Boolean));
                    }
                }
            } catch (error) {
                console.error("Error fetching connections:", error);
            }
        };

        fetchConnections();
    }, [currentUser]);

    // Load messages when a chat is selected
    useEffect(() => {
        if (!selectedChat || !currentUser) return;

        const messagesRef = collection(db, 'messages');
        const chatQuery = query(
            messagesRef,
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
            const chatMessages = snapshot.docs
                .map((doc) => doc.data())
                .filter(
                    (msg) =>
                        (msg.sender === currentUser.uid && msg.receiver === selectedChat.id) ||
                        (msg.sender === selectedChat.id && msg.receiver === currentUser.uid)
                );

            setMessages(chatMessages);
        });

        return () => unsubscribe();
    }, [selectedChat, currentUser]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat || !currentUser) return;

        try {
            await addDoc(collection(db, 'messages'), {
                sender: currentUser.uid,
                receiver: selectedChat.id,
                text: newMessage,
                timestamp: new Date(),
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const filteredConnections = connections.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewProfile = (userId) => {
        navigate(`/profile/${userId}`); // Navigate to the profile page of the selected user
    };

    return (
        <Paper elevation={3} sx={{ padding: 3, margin: '20px auto', maxWidth: 600 }}>
            <Typography variant="h5" gutterBottom>
                Messages
            </Typography>

            {/* Connection Search */}
            <SearchBar
                label="Search connections"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* List of Connections */}
            {!selectedChat ? (
                <List>
                    {filteredConnections.length > 0 ? (
                        filteredConnections.map((user) => (
                            <ListItem button key={user.id} onClick={() => setSelectedChat(user)}>
                                <ListItemText primary={user.name} />
                            </ListItem>
                        ))
                    ) : (
                        <Typography variant="body1">No connections found</Typography>
                    )}
                </List>
            ) : (
                <>
                    <Typography variant="h6">{selectedChat.name}</Typography>
                    {/* View Profile button */}
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleViewProfile(selectedChat.id)}
                    >
                        View Profile
                    </Button>

                    <Box sx={{ height: 300, overflowY: 'scroll', border: '1px solid #ccc', padding: 2, display: 'flex', flexDirection: 'column' }}>
                        {messages.map((msg, index) => (
                            <Box
                                key={index}
                                sx={{
                                    alignSelf: msg.sender === currentUser.uid ? 'flex-end' : 'flex-start',
                                    backgroundColor: msg.sender === currentUser.uid ? '#DCF8C6' : '#F1F1F1',
                                    padding: 1.5,
                                    borderRadius: 2,
                                    maxWidth: '70%',
                                    marginBottom: 1,
                                    wordWrap: 'break-word',
                                    display: 'inline-block',
                                }}
                            >
                                <Typography variant="body1">{msg.text}</Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Message Input */}
                    <Box sx={{ display: 'flex', marginTop: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Type a message"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <SendButton variant="contained" color="primary" onClick={handleSendMessage}>
                            Send
                        </SendButton>
                    </Box>

                    <Button variant="text" color="secondary" onClick={() => setSelectedChat(null)}>
                        Back to Connections
                    </Button>
                </>
            )}
        </Paper>
    );
}

export default Messages;
