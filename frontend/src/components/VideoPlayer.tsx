import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoId: number;
  onPlay?: () => void;
}

export function VideoPlayer({ videoId, onPlay }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      onPlay?.();
    };

    video.addEventListener('play', handlePlay);
    return () => video.removeEventListener('play', handlePlay);
  }, [onPlay]);

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden mb-6">
      <video
        ref={videoRef}
        controls
        className="w-full h-auto max-h-96 md:max-h-full"
        src={`/api/videos/${videoId}/stream`}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
