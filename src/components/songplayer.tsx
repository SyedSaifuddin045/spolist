import React, { ReactElement } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

interface AudioPlayerProps {
  src: string;
  songName?: string;
  songArtist?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, songName, songArtist, onPlay, onPause, onSeek }): ReactElement => {
  return (
    <H5AudioPlayer
      src={src}
      autoPlay={true}
      onPlay={onPlay}
      onPause={onPause}
      onSeeked={onSeek}
      customAdditionalControls={[
        RHAP_UI.LOOP,
        <div className="flex items-center space-x-2">
          <h3 className="flex-shrink-0">{songName}</h3>
          <h3 className="flex-shrink-0">{songArtist}</h3>
        </div>,
      ]}
      className="fixed bottom-0 left-0 w-full bg-gray-200 shadow-md rounded-t-md p-4"
    />
  );
};

export default AudioPlayer;
