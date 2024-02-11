'use client'

import { useEffect, useState } from 'react';
import Profile from '../../components/profile';
import { useSpotifyContext } from '../../context/SpotifyContext';
import { UserProfile } from '../../types/types';
import React from 'react';
import SearchBar from '@/src/components/searchbar';
import { useRouter } from 'next/navigation';
import AudioPlayer from '@/src/components/songplayer';

const UserHomePage = () => {
    const spotifyContext = useSpotifyContext();
    const router = useRouter();
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
                else {
                    router.push("/")
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

    const audioFilePath = "song.mp3";

    return (
        <div className='h-screen bg-red-800'>
            <div className="flex bg-base-200">
                {/* Display the Profile component if a profile is available, otherwise show "Loading..." */}
                {profile ? (
                    <Profile userProfile={profile} />
                ) : (
                    <div>Loading...</div>
                )}

                {/* Display the SearchBar component and pass handleSearch as a prop */}
                <div className='flex-grow'>
                    <SearchBar />
                </div>

                {/* Add a container for the AudioPlayer with flex styling */}
                <div className="flex items-center">
                    <AudioPlayer src={audioFilePath} songName={spotifyContext.currentSong?.name} songArtist={spotifyContext.currentSong?.artists[0]?.name} />
                </div>
            </div>
        </div>
    );

};

export default UserHomePage;
