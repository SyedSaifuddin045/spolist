export interface UserProfile {
    id: string;
    email: string;
    uri: string;
    url: string;
    images: string[];
    display_name: string;
}

export interface Token {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expiry_date: Date
}

export interface SpotifyContextProps {
    user: UserProfile | null;
    token: Token | null;
    login: (response: Token) => void;
    logout: () => void;
    setUser: (user: UserProfile | null) => void;
    setToken: (token: Token | null) => void
    isTokenRetrieved: boolean | null
}