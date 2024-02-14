'use client'
import axios from 'axios';
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { UserProfile, Token, SpotifyContextProps, Song } from "../types/types";

const TokenManager = {
    save: function (response: Token) {
        response.expiry_date = new Date(Date.now() + response?.expires_in * 1000)
        const tokenString = JSON.stringify(response);
        localStorage.setItem('token', tokenString);
    },

    retrieve: function (): Token | null {
        const tokenString = localStorage.getItem('token');
        if (tokenString) {
            const token: Token = JSON.parse(tokenString);
            token.is_valid = new Date() < new Date(token.expiry_date);
            return token;
        } else {
            return null;
        }
    },

    refresh: async function (token: Token, clientId: string) {
        const url = "https://accounts.spotify.com/api/token"
        const b = new URLSearchParams();
        b.append("grant_type", 'refresh_token');
        b.append("refresh_token", token.refresh_token);
        b.append("client_id", clientId);

        const payload = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: b,
        };

        try {
            const response = await fetch(url, payload);

            if (response.ok) {
                const refreshedToken: Token = await response.json();
                return refreshedToken;
            } else {
                // Handle the case where the refresh token request fails
                console.error('Failed to refresh token:', response.status, response.statusText);
                throw new Error('Failed to refresh token');
            }
        } catch (error) {
            // Handle any fetch errors
            console.error('Error refreshing token:', error);
            throw new Error('Error refreshing token');
        }
    }
};

const SpotifyContext = createContext<SpotifyContextProps | undefined>(undefined);

interface SpotifyContextProviderProps {
    children: ReactNode;
}

const SpotifyContextProvider: React.FC<SpotifyContextProviderProps> = ({ children }) => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<Token | null>(null);
    const [isTokenRetrieved, setTokenRetrieved] = useState<boolean | null>(null);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);

    useEffect(() => {
        // Retrieve token from localStorage when the component mounts
        const storedToken = TokenManager.retrieve();
        console.log(storedToken);
        if (storedToken) {
            if (new Date() < new Date(storedToken.expiry_date)) {
                storedToken.is_valid = new Date() < new Date(storedToken.expiry_date);
                setTokenContext(storedToken);
            } else {
                // Token is either not stored or expired, handle accordingly
                handleTokenExpired(storedToken);
            }
        }
        else if (!storedToken) {
            setTokenRetrieved(false);
        }
    }, []);

    const handleTokenExpired = async (expiredToken: Token) => {
        if (expiredToken) {
            try {
                console.log("Token Exprired Tyring to Refresh");
                // Token is expired, Refresh it
                const refreshedToken = await TokenManager.refresh(expiredToken, clientId);
                refreshedToken.is_valid = new Date() < new Date(refreshedToken.expiry_date);
                setTokenContext(refreshedToken);
                TokenManager.save(refreshedToken);
            } catch (error) {
                console.error("Failed to Refresh Token");
                // Error refreshing token, set to null or handle appropriately
                setToken(null);
                setTokenRetrieved(false);
            }
        } else {
            // Token is not stored, set to null or handle appropriately
            setToken(null);
            setTokenRetrieved(false);
        }
    };

    const login = (response: Token) => {
        TokenManager.save(response);
        setToken(response);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    const setUserContext = (newUser: UserProfile | null) => {
        setUser(newUser);
    };

    const setCurrentSpotifySong = async (song: Song | null) => {
        const downloadUrl = process.env.NEXT_PUBLIC_BACKEND_URL + `download_song?songID=${song?.id}`;
        console.log("Backend URL : " + downloadUrl);

        const requestBody = {
            songID: song?.id || '',
            songLink: song?.external_urls.spotify || '',
        };

        if (song == null) {
            setCurrentSong(song);
            return;
        }

        try {
            const songDownloadResponse = await axios.post(downloadUrl, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log(songDownloadResponse);

            if (songDownloadResponse.status === 200) {
                console.log('Download request successful');
                const getResponse = await axios.get(downloadUrl, {
                    responseType: 'blob',
                });

                if (getResponse.status === 200) {
                    console.log('GET request for song download successful');

                    // Convert the response to a Blob
                    const blob = new Blob([getResponse.data], { type: 'audio/mpeg' });

                    // Create a Blob URL for the song
                    const blobUrl = URL.createObjectURL(blob);
                    song.song_path = blobUrl;
                    setCurrentSong(song);
                }
            } else {
                console.error('Download request failed:', songDownloadResponse.status, songDownloadResponse.statusText);
            }
        } catch (error) {
            console.error('Error during download request:', error);
        }
    };


    const setTokenContext = (newToken: Token | null) => {
        setToken(newToken);
        if (newToken != null) {
            setTokenRetrieved(true);
            TokenManager.save(newToken);
            console.log("Setting token Retrieved to true");
        }
        else {
            setTokenRetrieved(false);
            console.log("Setting Token Retrieved to false");
        }
    }

    const contextValue: SpotifyContextProps = {
        user,
        token,
        login,
        logout,
        setUser: setUserContext,
        setToken: setTokenContext,
        isTokenRetrieved,
        currentSong,
        setCurrentSong: setCurrentSpotifySong
    };

    return <SpotifyContext.Provider value={contextValue}>{children}</SpotifyContext.Provider>;
};

const useSpotifyContext = () => {
    const context = useContext(SpotifyContext);
    if (!context) {
        throw new Error("useSpotifyContext must be used within a SpotifyContextProvider");
    }
    return context;
};

export { SpotifyContextProvider, useSpotifyContext, TokenManager };