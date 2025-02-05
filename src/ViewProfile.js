import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Paper, Box } from '@mui/material';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

function ViewProfile() {
    const { userId } = useParams(); // Get user ID from URL
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userId) return;

            try {
                const docRef = doc(db, 'users', userId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                } else {
                    console.error("User not found");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchUserProfile();
    }, [userId]);

    if (!profile) return <Typography>Loading profile...</Typography>;

    return (
        <Paper elevation={3} sx={{ padding: 4, maxWidth: 600, margin: '50px auto' }}>
            <Typography variant="h4" gutterBottom>
                {profile.name}'s Profile
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography><strong>Email:</strong> {profile.email}</Typography>
                <Typography><strong>Bio:</strong> {profile.bio || "No bio available"}</Typography>
                <Typography><strong>Age:</strong> {profile.age || "Not specified"}</Typography>
                <Typography><strong>Schools:</strong> {profile.schools?.join(', ') || "No schools listed"}</Typography>
                <Typography><strong>Role:</strong> {profile.role}</Typography>
            </Box>
        </Paper>
    );
}

export default ViewProfile;
