'use client'

import React from 'react';
import { UserProfile } from '../types/types';

interface ProfileProps {
    userProfile: UserProfile;
}

const Profile: React.FC<ProfileProps> = ({ userProfile }) => {
    const {
        id,
        email,
        uri,
        url,
        images,
        display_name
    } = userProfile;

    return (
        <div>
            <h1>User Profile</h1>
            <p>Display Name: {display_name}</p>
            <p>ID: {id}</p>
            <p>Email: {email}</p>
            <p>URI: {uri}</p>
            <p>URL: {url}</p>

            <h2>Images</h2>
            <ul>
                {images.map((image, index) => (
                    <img key={index} src={image}></img>
                ))}
            </ul>

        </div>
    );
};

export default Profile;
