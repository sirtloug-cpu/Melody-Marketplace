
export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string; // ID of the creator
  album: string;
  price: number; // In ZAR
  coverUrl: string;
  duration: string;
  genre: string;
  audioUrl: string;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  balance: number; // Creator earnings
  library: string[]; // Array of Track IDs purchased
  isArtist: boolean;
  avatarUrl?: string;
}

export enum View {
  MARKETPLACE = 'MARKETPLACE',
  LIBRARY = 'LIBRARY',
  PLAYLISTS = 'PLAYLISTS',
  ARTIST_DASHBOARD = 'ARTIST_DASHBOARD',
  AI_ASSISTANT = 'AI_ASSISTANT',
  UPLOADS = 'UPLOADS',
  SEARCH = 'SEARCH',
  PROFILE = 'PROFILE',
  BEAT_FEED = 'BEAT_FEED'
}
