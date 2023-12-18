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
        <div className="flex items-center">
            <div className="mask rounded-full overflow-hidden w-16 h-16 ml-4">
                <img className="w-full h-full object-cover" src={images[1]} alt="Your Image" />
            </div>
            <div className="bg-accent text-primary inline-block px-4 py-2 rounded-full">
                <p>{display_name}</p>
            </div>
        </div>

    );
};

export default Profile;
