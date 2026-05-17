"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Rotates ambient clips (sky, rain, nature) to suggest changing weather.
 * Sources: Pexels (free stock); swap for your own files in /public if you prefer.
 */
const WEATHER_CLIP_URLS: string[] = [
  "https://videos.pexels.com/video-files/3121459/3121459-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/3537224/3537224-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/1860074/1860074-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2491284/2491284-hd_1920_1080_25fps.mp4",
];

const ROTATE_MS = 14000;

export function HomeWeatherVideoBg() {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    const play = () => {
      void video.play().catch(() => {});
    };
    video.addEventListener("loadeddata", play);
    play();
    return () => video.removeEventListener("loadeddata", play);
  }, [index]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % WEATHER_CLIP_URLS.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        key={WEATHER_CLIP_URLS[index]}
        className="absolute inset-0 h-full w-full object-cover"
        src={WEATHER_CLIP_URLS[index]}
        autoPlay
        muted
        playsInline
        loop
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/75 via-emerald-900/55 to-amber-900/50" />
      <div className="absolute inset-0 bg-black/20 dark:bg-black/35" />
    </>
  );
}
