'use client'
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { UserProfile, Token, SpotifyContextProps } from "../types/types";

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

    useEffect(() => {
        // Retrieve token from localStorage when the component mounts
        const storedToken = TokenManager.retrieve();
        if (storedToken && new Date() < new Date(storedToken.expiry_date)) {
            setToken(storedToken);
        } else {
            console.log("Token Exprired Tyring to Refresh");
            // Token is either not stored or expired, handle accordingly
            handleTokenExpired();
        }
    }, []);

    const handleTokenExpired = async () => {
        if (token) {
            try {
                // Token is invalid, Refresh it
                const refreshedToken = await TokenManager.refresh(token, clientId);
                setToken(refreshedToken);
            } catch (error) {
                console.error("Failed to Refresh Token");
                // Error refreshing token, set to null or handle appropriately
                setToken(null);
            }
        } else {
            // Token is not stored, set to null or handle appropriately
            setToken(null);
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

    const setTokenContext = (newToken: Token | null) => {
        setToken(newToken);
    }

    const contextValue: SpotifyContextProps = {
        user,
        token,
        login,
        logout,
        setUser: setUserContext,
        setToken: setTokenContext,
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