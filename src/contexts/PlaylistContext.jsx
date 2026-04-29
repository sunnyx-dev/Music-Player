import { createContext, useContext, useReducer, useEffect } from 'react';
import { saveToStorage, loadFromStorage } from '../utils/helpers';

const PlaylistContext = createContext();

const initialState = {
  playlists: loadFromStorage('playlists', [
    { id: 'liked', name: 'Liked Songs', songs: [], isPublic: false, icon: '❤️', createdAt: Date.now() },
  ]),
};

function reducer(state, action) {
  switch (action.type) {
    case 'CREATE_PLAYLIST': {
      const pl = { id: Date.now().toString(), songs: [], isPublic: false, createdAt: Date.now(), ...action.payload };
      const playlists = [...state.playlists, pl];
      saveToStorage('playlists', playlists);
      return { ...state, playlists };
    }
    case 'DELETE_PLAYLIST': {
      const playlists = state.playlists.filter(p => p.id !== action.payload);
      saveToStorage('playlists', playlists);
      return { ...state, playlists };
    }
    case 'ADD_SONG': {
      const playlists = state.playlists.map(p => {
        if (p.id !== action.payload.playlistId) return p;
        if (p.songs.find(s => s.id === action.payload.song.id)) return p;
        return { ...p, songs: [...p.songs, action.payload.song] };
      });
      saveToStorage('playlists', playlists);
      return { ...state, playlists };
    }
    case 'REMOVE_SONG': {
      const playlists = state.playlists.map(p => {
        if (p.id !== action.payload.playlistId) return p;
        return { ...p, songs: p.songs.filter(s => s.id !== action.payload.songId) };
      });
      saveToStorage('playlists', playlists);
      return { ...state, playlists };
    }
    case 'UPDATE_PLAYLIST': {
      const playlists = state.playlists.map(p =>
        p.id === action.payload.id ? { ...p, ...action.payload } : p
      );
      saveToStorage('playlists', playlists);
      return { ...state, playlists };
    }
    default: return state;
  }
}

export function PlaylistProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = {
    playlists: state.playlists,
    createPlaylist: (data) => dispatch({ type: 'CREATE_PLAYLIST', payload: data }),
    deletePlaylist: (id) => dispatch({ type: 'DELETE_PLAYLIST', payload: id }),
    addSongToPlaylist: (playlistId, song) => dispatch({ type: 'ADD_SONG', payload: { playlistId, song } }),
    removeSongFromPlaylist: (playlistId, songId) => dispatch({ type: 'REMOVE_SONG', payload: { playlistId, songId } }),
    updatePlaylist: (data) => dispatch({ type: 'UPDATE_PLAYLIST', payload: data }),
    getPlaylist: (id) => state.playlists.find(p => p.id === id),
  };
  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
}

export const usePlaylist = () => useContext(PlaylistContext);
