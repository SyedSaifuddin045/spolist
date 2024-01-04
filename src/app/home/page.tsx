'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Profile from '../../components/profile';
import { useSpotifyContext } from '../../context/SpotifyContext';
import { UserProfile } from '../../types/types';
import React from 'react';

// ... other imports

const UserHomePage = () => {
    const router = useRouter();
    const spotifyContext = useSpotifyContext();
    const [profile, setUserProfile] = useState<UserProfile | null>(spotifyContext.user || null);

    useEffect(() => {
        async function fetchData() {
            if (profile == null) {
                const token = spotifyContext?.token?.access_token;
                console.log(token)
                if (token) {
                    try {
                        const fetchedProfile = await fetchProfile(token);
                        console.log(fetchedProfile)
                        setUserProfile(fetchedProfile);
                        spotifyContext.setUser(fetchedProfile);
                    } catch (error) {
                        console.error('Error fetching profile:', error);
                    }
                }
            }
        }

        fetchData();
    }, [spotifyContext.token]);

    async function fetchProfile(token: string): Promise<UserProfile> {
        const result = await fetch("https://api.spotify.com/v1/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        const data: any = await result.json();

        // Use the UserProfile interface to define the expected structure
        const newProfile: UserProfile = {
            id: data.id,
            email: data.email,
            uri: data.uri,
            url: data.external_urls.spotify,
            images: data.images.map((image: { url: string }) => image.url),
            display_name: data.display_name,
        };

        return newProfile;
    }

    return (
        <div>
            {profile ? (
                <Profile userProfile={profile} />
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};

export default UserHomePage;
