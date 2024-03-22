import React, { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useSpotifyContext } from '../context/SpotifyContext';
import styles from '../common/styles/global.module.css';
import { Song } from '../types/types';

const SearchBar: React.FC = () => {
    const spotifyContext = useSpotifyContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!spotifyContext.token?.is_valid)
                return;
            const access_token = spotifyContext.token?.access_token;

            if (searchQuery && access_token) {
                const search_url = `https://api.spotify.com/v1/search?q=${searchQuery}&type=track`;
                const headers = {
                    Authorization: `Bearer ${access_token}`,
                };

                try {
                    const search_response = await fetch(search_url, { headers });
                    const search_results = await search_response.json();
                    console.log(search_results)
                    setSearchResults(search_results.tracks.items);
                } catch (error) {
                    console.error('Error fetching search results:', error);
                }
            }
        };
        fetchData();
    }, [searchQuery, spotifyContext.token]);

    const handleSearch = () => {
        console.log('Search query:', searchQuery);
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleInputFocus = () => {
        setIsInputFocused(true);
    };

    const handleInputBlur = () => {
        setIsInputFocused(false);
    };

    const setSong = (clickedResult: Song) => {
        spotifyContext.setCurrentSong(clickedResult);
    };

    return (
        <div className='flex font-light p-4 relative items-center'>
            <input
                type="text"
                className='rounded-full font-bold from-neutral-100 text-secondary bg-secondary-content px-4 flex-grow py-2 mr-2'
                value={searchQuery}
                onChange={handleValueChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Search your Song..."
                ref={inputRef}
            />
            <FaSearch
                className={`cursor-pointer ${styles['search-hover-scale']}`}
                onClick={handleSearch}
            />

            {isInputFocused && searchResults.length > 0 && (
                <div className='absolute top-full left-0 right-0 bg-accent shadow-md p-8 overflow-y-auto max-h-80 rounded-box z-10'>
                    <ul className="space-y-4">
                        {searchResults.map((result) => (
                            <li key={result.id} onMouseDown={() => setSong(result)} className={`flex items-center bg-lime-400 rounded-box ${styles['hover-scale']}`}>
                                <img src={result.album.images[0].url} alt={result.name} className="w-16 h-16 object-cover mr-4 m-4 rounded-md" />
                                <div>
                                    <h3 className="text-lg font-semibold">{result.name}</h3>
                                    <a>{result.external_urls.spotify}</a>
                                    <p className="text-sm text-gray-600">{result.artists.map((artist) => artist.name).join(', ')}</p>
                                    <p className="text-sm text-gray-600">{result.album.name}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

        </div>
    );
};

export default SearchBar;
