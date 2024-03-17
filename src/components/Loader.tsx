import React from "react";

interface LoaderProps {
    songName: string | null |undefined;
}

const Loader: React.FC<LoaderProps> = ({ songName }) => {
    return (
        <div>Downloading Song {songName}...</div>
    );
};

export default Loader;
