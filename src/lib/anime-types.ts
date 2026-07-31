export type AnimeCard = {
  id: number;
  title: string;
  image: string;
  score: number | null;
  year: number | null;
  type: string | null;
  episodes: number | null;
  status: string | null;
  genres: string[];
  synopsis: string | null;
  members: number | null;
  rank: number | null;
};

export type StreamingLink = { name: string; url: string };

export type AnimeDetail = AnimeCard & {
  titleJp: string | null;
  studios: string[];
  trailer: string | null;
  banner: string | null;
  streaming: StreamingLink[];
  themesOpening: string[];
  themesEnding: string[];
  airedFrom: string | null;
  duration: string | null;
  source: string | null;
  rating: string | null;
};

export type AnimeVideo = { title: string; embedUrl: string; thumb: string | null };

export type AnimeVideos = {
  promos: AnimeVideo[];
  music: AnimeVideo[];
};
