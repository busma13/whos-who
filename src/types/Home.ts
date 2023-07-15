export interface SpotifyToken {
  value: string;
  expiration: number;
}

export interface Artist {
  name: string;
}

export interface Track {
  name: string;
  album: { images: Image[] };
  artists: [Artist];
  popularity: number;
  preview_url: string;
}

export interface Image {
  height: number;
  url: string;
  width: number;
}

export interface ArtistGuessData {
  artist: Artist;
  image: Image | null;
}

export interface guessData {
  key: string;
  name: string;
  preview_url: string;
  artist: string;
  choices: {
    key: string;
    name: string;
    imgUrl: string;
  }[];
}
