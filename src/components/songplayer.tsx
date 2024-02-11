import React, { ReactElement } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

interface AudioPlayerProps {
  src: string;
  songName?: string,
  songArtist?: string,
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, songName, songArtist, onPlay, onPause, onSeek }): ReactElement => {
  return (
    <H5AudioPlayer
      src={src}
      autoPlay={false}
      onPlay={onPlay}
      onPause={onPause}
      onSeeked={onSeek}
      customAdditionalControls={
        [
          RHAP_UI.LOOP,
          <span>
            <h3>{songName}</h3>
            <p>{songArtist}</p>
          </span>
        ]
      }
      className='fixed bottom-0 left-0 w-full bg-gray-200 shadow-md rounded-t-md p-4' // Adjust the styles as needed
    />
  );
};

export default AudioPlayer;
