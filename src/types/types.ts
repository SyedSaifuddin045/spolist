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
    is_valid:boolean;
    expiry_date: Date
}
export interface Song {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        name: string;
        images: Array<{ url: string }>;
    };
    external_urls:{
        spotify:string
    }
    song_path:string|null
}

export interface SpotifyContextProps {
    user: UserProfile | null;
    token: Token | null;
    currentSong: Song | null;  // Added currentSong
    setCurrentSong: (song: Song | null) => void;  // Added setCurrentSong
    login: (response: Token) => void;
    logout: () => void;
    setUser: (user: UserProfile | null) => void;
    setToken: (token: Token | null) => void;
    isTokenRetrieved: boolean | null;
    songIsBeingDownloaded:boolean;
}