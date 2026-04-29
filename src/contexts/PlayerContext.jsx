import { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react';
import { saveToStorage, loadFromStorage, shuffleArray } from '../utils/helpers';

const PlayerContext = createContext();

const initialState = {
  currentSong: null,
  queue: [],
  originalQueue: [],
  queueIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: loadFromStorage('volume', 0.7),
  muted: false,
  shuffle: false,
  repeat: 'off', // off, one, all
  liked: loadFromStorage('likedSongs', []),
  recentlyPlayed: loadFromStorage('recentlyPlayed', []),
  showQueue: false,
  showFullScreen: false,
  isLoading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SONG': {
      const song = action.payload;
      const recent = [song, ...state.recentlyPlayed.filter(s => s.id !== song.id)].slice(0, 50);
      saveToStorage('recentlyPlayed', recent);
      saveToStorage('lastSong', song);
      return { ...state, currentSong: song, isPlaying: true, currentTime: 0, isLoading: true, recentlyPlayed: recent };
    }
    case 'PLAY_QUEUE': {
      const { songs, index } = action.payload;
      return { ...state, queue: songs, originalQueue: songs, queueIndex: index };
    }
    case 'SET_PLAYING': return { ...state, isPlaying: action.payload };
    case 'SET_TIME': return { ...state, currentTime: action.payload };
    case 'SET_DURATION': return { ...state, duration: action.payload };
    case 'SET_VOLUME': {
      saveToStorage('volume', action.payload);
      return { ...state, volume: action.payload, muted: action.payload === 0 };
    }
    case 'TOGGLE_MUTE': return { ...state, muted: !state.muted };
    case 'TOGGLE_SHUFFLE': {
      if (!state.shuffle) {
        const shuffled = shuffleArray(state.queue);
        return { ...state, shuffle: true, queue: shuffled, queueIndex: shuffled.findIndex(s => s.id === state.currentSong?.id) };
      }
      const idx = state.originalQueue.findIndex(s => s.id === state.currentSong?.id);
      return { ...state, shuffle: false, queue: [...state.originalQueue], queueIndex: idx };
    }
    case 'SET_REPEAT': return { ...state, repeat: action.payload };
    case 'TOGGLE_LIKE': {
      const id = action.payload;
      const liked = state.liked.includes(id) ? state.liked.filter(l => l !== id) : [...state.liked, id];
      saveToStorage('likedSongs', liked);
      return { ...state, liked };
    }
    case 'ADD_TO_QUEUE': {
      const q = [...state.queue];
      q.splice(state.queueIndex + 1, 0, action.payload);
      return { ...state, queue: q };
    }
    case 'REMOVE_FROM_QUEUE': {
      const newQ = state.queue.filter((_, i) => i !== action.payload);
      let newIdx = state.queueIndex;
      if (action.payload < state.queueIndex) newIdx--;
      return { ...state, queue: newQ, queueIndex: newIdx };
    }
    case 'SET_QUEUE_INDEX': return { ...state, queueIndex: action.payload };
    case 'TOGGLE_QUEUE': return { ...state, showQueue: !state.showQueue };
    case 'TOGGLE_FULLSCREEN': return { ...state, showFullScreen: !state.showFullScreen };
    case 'SET_LOADING': return { ...state, isLoading: action.payload };
    default: return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const playerRef = useRef(null);
  const timerRef = useRef(null);

  // We need refs for state that is used inside YT event handlers since they are registered once
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const playNext = useCallback(() => {
    const s = stateRef.current;
    if (!s.queue.length) return;
    let next = s.queueIndex + 1;
    if (next >= s.queue.length) {
      if (s.repeat === 'all') next = 0; else return;
    }
    dispatch({ type: 'SET_QUEUE_INDEX', payload: next });
    dispatch({ type: 'SET_SONG', payload: s.queue[next] });
  }, []);

  const playPrev = useCallback(() => {
    const s = stateRef.current;
    if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getCurrentTime() > 3) { 
      seek(0); 
      return; 
    }
    if (!s.queue.length) return;
    let prev = s.queueIndex - 1;
    if (prev < 0) prev = s.repeat === 'all' ? s.queue.length - 1 : 0;
    dispatch({ type: 'SET_QUEUE_INDEX', payload: prev });
    dispatch({ type: 'SET_SONG', payload: s.queue[prev] });
  }, []);

  const seek = useCallback((time) => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(time, true);
      dispatch({ type: 'SET_TIME', payload: time });
    }
  }, []);

  useEffect(() => {
    // Load YouTube Iframe API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        playerRef.current = new window.YT.Player('youtube-player', {
          height: '0',
          width: '0',
          videoId: '',
          playerVars: {
            playsinline: 1,
            controls: 0,
            disablekb: 1,
          },
          events: {
            onReady: (event) => {
              // Apply initial volume
              event.target.setVolume(stateRef.current.muted ? 0 : stateRef.current.volume * 100);
            },
            onStateChange: (event) => {
              // YT.PlayerState.PLAYING = 1
              // YT.PlayerState.ENDED = 0
              // YT.PlayerState.PAUSED = 2
              // YT.PlayerState.BUFFERING = 3
              
              if (event.data === 1) { // PLAYING
                dispatch({ type: 'SET_PLAYING', payload: true });
                dispatch({ type: 'SET_LOADING', payload: false });
                
                const duration = event.target.getDuration();
                if (duration) dispatch({ type: 'SET_DURATION', payload: duration });
                
                if (!timerRef.current) {
                  timerRef.current = setInterval(() => {
                    if (playerRef.current && playerRef.current.getCurrentTime) {
                      dispatch({ type: 'SET_TIME', payload: playerRef.current.getCurrentTime() });
                    }
                  }, 500);
                }
              } else {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  timerRef.current = null;
                }
                if (event.data === 0) { // ENDED
                  dispatch({ type: 'SET_PLAYING', payload: false });
                  if (stateRef.current.repeat === 'one') {
                    event.target.seekTo(0);
                    event.target.playVideo();
                  } else {
                    playNext();
                  }
                } else if (event.data === 2) { // PAUSED
                  dispatch({ type: 'SET_PLAYING', payload: false });
                } else if (event.data === 3) { // BUFFERING
                  dispatch({ type: 'SET_LOADING', payload: true });
                }
              }
            },
          }
        });
      };
    } else if (window.YT && window.YT.Player && !playerRef.current) {
       // Setup if already loaded
       if (window.onYouTubeIframeAPIReady) window.onYouTubeIframeAPIReady();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playNext]);

  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(state.muted ? 0 : state.volume * 100);
    }
  }, [state.volume, state.muted]);

  useEffect(() => {
    if (!state.currentSong?.id) return;
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(state.currentSong.id);
      if (!state.isPlaying) {
        // if not meant to play immediately, pause it shortly after
        setTimeout(() => {
          if (playerRef.current && !stateRef.current.isPlaying) {
            playerRef.current.pauseVideo();
          }
        }, 100);
      }
    }
  }, [state.currentSong?.id]);

  useEffect(() => {
    if (playerRef.current && playerRef.current.playVideo) {
      if (state.isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [state.isPlaying]);

  const playSong = useCallback((song, songs = [], index = 0) => {
    dispatch({ type: 'SET_SONG', payload: song });
    if (songs.length) dispatch({ type: 'PLAY_QUEUE', payload: { songs, index } });
  }, []);

  const togglePlay = useCallback(() => {
    if (!state.currentSong) return;
    dispatch({ type: 'SET_PLAYING', payload: !state.isPlaying });
  }, [state.isPlaying, state.currentSong]);

  const value = {
    ...state, dispatch, playSong, togglePlay, seek, playNext, playPrev,
    setVolume: (v) => dispatch({ type: 'SET_VOLUME', payload: v }),
    toggleMute: () => dispatch({ type: 'TOGGLE_MUTE' }),
    toggleShuffle: () => dispatch({ type: 'TOGGLE_SHUFFLE' }),
    cycleRepeat: () => {
      const modes = ['off', 'all', 'one'];
      const next = modes[(modes.indexOf(state.repeat) + 1) % 3];
      dispatch({ type: 'SET_REPEAT', payload: next });
    },
    toggleLike: (id) => dispatch({ type: 'TOGGLE_LIKE', payload: id }),
    isLiked: (id) => state.liked.includes(id),
    addToQueue: (song) => dispatch({ type: 'ADD_TO_QUEUE', payload: song }),
    removeFromQueue: (i) => dispatch({ type: 'REMOVE_FROM_QUEUE', payload: i }),
    toggleQueue: () => dispatch({ type: 'TOGGLE_QUEUE' }),
    toggleFullScreen: () => dispatch({ type: 'TOGGLE_FULLSCREEN' }),
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export const usePlayer = () => useContext(PlayerContext);
