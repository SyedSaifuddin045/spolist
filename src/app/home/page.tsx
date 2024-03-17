'use client'

import { useEffect, useState } from 'react';
import Profile from '../../components/profile';
import { useSpotifyContext } from '../../context/SpotifyContext';
import { UserProfile } from '../../types/types';
import React from 'react';
import SearchBar from '@/src/components/searchbar';
import { useRouter } from 'next/navigation';
import AudioPlayer from '@/src/components/songplayer';
import Loader from '@/src/components/Loader';
import Three from '@/src/components/Three';

const UserHomePage = () => {
    const spotifyContext = useSpotifyContext();
    const router = useRouter();
    const [profile, setUserProfile] = useState<UserProfile | null>(spotifyContext.user || null);

    useEffect(() => {
        async function fetchData() {
            if (spotifyContext.token?.is_valid) {
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

    return (
        <div className='h-screen flex flex-col bg-red-800'>
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

            </div>
            <div className="flex-grow flex justify-center items-center">
                <div className="text-center" style={{ width: '100%', height: '100%' }}>
                    {spotifyContext.songIsBeingDownloaded ?
                        (<Loader songName={spotifyContext.currentSong?.name} />) : (<Three />)}
                </div>
            </div>

            {/* Position the AudioPlayer outside the red div */}
            <div className="absolute bottom-0 left-0 right-0">
                {spotifyContext.currentSong?.song_path && (
                    <AudioPlayer
                        src={spotifyContext.currentSong.song_path}
                        songName={spotifyContext.currentSong?.name}
                        songArtist={spotifyContext.currentSong?.artists[0]?.name}
                    />
                )}
            </div>
        </div>
    );


};

export default UserHomePage;
