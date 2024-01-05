'use client'

import { useEffect, useState } from 'react';
import { TokenManager, useSpotifyContext } from '../context/SpotifyContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Token } from '../types/types';

export default function Home() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
  const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET || '';
  const spotifyContext = useSpotifyContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams.has('code') && spotifyContext.isTokenRetrieved != null) {
      HF();
    }
  }, [spotifyContext.isTokenRetrieved]);

  useEffect(() => {
    Code();
  }, [])

  async function Code() {
    if (searchParams.has('code')) {
      const queryCode = searchParams.get('code') as string;
      if (queryCode != "") {
        console.log("Query Code : " + queryCode);
        if (!spotifyContext.token && queryCode) {
          const tkn: Token = await getAccessToken(clientId, queryCode);
          console.log("Token from code is : " + tkn?.access_token);
          spotifyContext.setToken(tkn);
          TokenManager.save(tkn);
          router.push('/home');
        }
      }
    }
  }

  async function HF() {
    if (spotifyContext.token && spotifyContext.isTokenRetrieved == true) {
      router.push('/home');
    }
    else {
      if (spotifyContext.isTokenRetrieved == false)
        console.log("No Token found in context");
      redirectToAuthCodeFlow(clientId);
    }
  }

  // async function homeFunction() {
  //   if (spotifyContext.token != null) {
  //     if (new Date() > new Date(spotifyContext.token?.expiry_date)) {
  //       // Token is invalid, Refresh it
  //       const refreshedToken = await refreshToken(spotifyContext.token);
  //       spotifyContext.setToken(refreshedToken);
  //       TokenManager.save(refreshedToken);
  //       // alert("Token is not null pushing to user");
  //       router.push(`/user`);
  //     } else {
  //       TokenManager.save(spotifyContext.token);
  //       // alert("Token is not null pushing to user");
  //       router.push(`/user`);
  //     }
  //   } else if (searchParams.has('code')) {
  //     const queryCode = searchParams.get('code') as string | undefined;
  //     if (queryCode != undefined) {
  //       if (queryCode != null && queryCode !== '') {
  //         // Check if there is no existing token before setting the new one
  //         if (!spotifyContext.token) {
  //           const tkn: Token = await getAccessToken(clientId, queryCode);
  //           console.log(tkn);
  //           spotifyContext.setToken(tkn);
  //         }
  //       }
  //     }
  //     // Move this part outside the if condition
  //     if (spotifyContext.token) {
  //       TokenManager.save(spotifyContext.token);
  //       console.log(spotifyContext.token);
  //       router.push(`/user`);
  //     }
  //   } else {
  //     redirectToAuthCodeFlow(clientId);
  //   }
  // }

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

  async function refreshToken(token: Token): Promise<Token> {
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

  async function getAccessToken(clientId: string, code: string): Promise<Token> {
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

    const access_token: Token = await result.json();
    // console.log(access_token)
    return access_token;
  }
}
