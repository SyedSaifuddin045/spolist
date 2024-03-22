import React, { ReactElement, useEffect, useImperativeHandle, useRef } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

interface AudioPlayerProps {
  src: string;
  songName?: string;
  songArtist?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: () => void;
  ref?: React.Ref<AudioPlayerRef>;
}

export interface AudioPlayerRef {
  audio: HTMLAudioElement | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = React.forwardRef(
  ({ src, songName, songArtist, onPlay, onPause, onSeek }, ref: React.Ref<AudioPlayerRef>): ReactElement => {
    const audioRef = useRef<H5AudioPlayer>(null);
    useEffect(() => {
      console.log("Audio Ref :" + audioRef.current?.audio.current?.localName)
    }, [audioRef])
    useImperativeHandle(ref, () => ({
      audio: audioRef.current?.audio.current || null,
    }));

    return (
      <H5AudioPlayer
        src={src}
        ref={audioRef}
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
  }
);

export default AudioPlayer;