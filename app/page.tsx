'use client'

import { error } from 'console';
import { ReactElement, useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  uri: string;
  url: string;
  images: string[]; // Updated to an array of strings
  display_name: string;
}

export default function Home(): ReactElement {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [playlistName, setPlaylistName] = useState<string>('');
  let accessToken = localStorage.getItem("spotifyAccessToken") || '';

  useEffect(() => {
    async function fetchData() {
      if (!code) {
        redirectToAuthCodeFlow(clientId);
      } else {
        try {
          accessToken = await getAccessToken(clientId, code);
          if (accessToken === undefined) {
            console.log("Use Effect Access Token is undefined");
            return; // Exit the function if accessToken is undefined
          }
          console.log("Use Effect Access Token " + accessToken);
          localStorage.setItem("spotifyAccessToken", accessToken);
          setUser(await fetchProfile(accessToken));
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    }

    fetchData();
  }, []);


  async function redirectToAuthCodeFlow(clientId: string) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:3000");
    params.append("scope", "user-read-private user-read-email playlist-modify-public");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  function generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const digestArray = Array.from(new Uint8Array(digest));

    return btoa(String.fromCharCode.apply(null, digestArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async function getAccessToken(clientId: string, code: string): Promise<string> {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:3000");
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    const { access_token } = await result.json();
    return access_token;
  }

  async function fetchProfile(token: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data: any = await result.json();
    console.log(data);

    // Use the UserProfile interface to define the expected structure
    const profile: UserProfile = {
      id: data.id,
      email: data.email,
      uri: data.uri,
      url: data.external_urls.spotify,
      images: data.images.map((image: { url: string }) => image.url),
      display_name: data.display_name,
      // Add other properties as needed based on the Spotify API response
    };

    return profile;
  }

  async function createNewPlaylist() {
    try {
      console.log("inside create Playlist");
      if (accessToken !== null || accessToken !== '') {
        console.log("newPlaylist Acces Token : " + accessToken);
        const userId = user?.id; // Assuming user object is available from the state

        if (!userId) {
          console.error('User ID not found.');
          return;
        }

        var Name = playlistName;
        const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
        const headers = {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        };

        const body = JSON.stringify({
          name: Name,
          description: 'New playlist description', // You can customize this
          public: true,
        });

        const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: body,
        });

        if (response.ok) {
          const newPlaylist = await response.json();
          console.log('New Playlist:', newPlaylist);
          // Handle the new playlist data as needed
        } else {
          console.error('Failed to create playlist:', response.status, response.statusText);
        }
      }
    }
    catch (error) {
      console.error('Error creating playlist:', error);
    }
  }


  return (
    <div>
      <title>My Spotify Profile</title>
      <h1>Display your Spotify profile data:</h1>

      <section id="profile">
        <h2>Logged in as <span id="displayName">{user?.display_name}</span></h2>
        <span id="avatar">
          <img src={user?.images[0]} alt="User Avatar" /> {/* Display the first image URL */}
        </span>
        <ul>
          <li>User ID: <span id="id">{user?.id}</span></li>
          <li>Email: <span id="email">{user?.email}</span></li>
          <li>Spotify URI: <a id="uri" href={user?.uri}>{user?.uri}</a></li>
          <li>Link: <a id="url" href={user?.url}>{user?.url}</a></li>
          <li>Profile Image: <span id="imgUrl">{user?.images[0]}</span></li> {/* Display the first image URL */}
        </ul>
      </section>
      <section>
        <h2>Create Playlist:</h2>
        <input
          placeholder='Enter New Playlist Name:'
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          className='text-black'
        />
        <br></br>
        <button onClick={createNewPlaylist}>Create</button>
      </section>
    </div>
  );
}
