import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { generateRoomCode, saveToStorage, loadFromStorage } from '../utils/helpers';
import { usePlayer } from './PlayerContext';
import { supabase, joinSupabaseRoomChannel, broadcastToSupabaseRoom } from '../services/supabase';

const RoomContext = createContext();

export function RoomProvider({ children }) {
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [hostControl, setHostControl] = useState(true);
  const channelRef = useRef(null);
  const player = usePlayer();
  const userName = loadFromStorage('userName', 'You');

  const createRoom = useCallback((name, mood) => {
    const code = generateRoomCode();
    const newRoom = { id: code, name: name || `${mood || 'Chill'} Room`, code, mood, host: userName, createdAt: Date.now() };
    setRoom(newRoom);
    setIsHost(true);
    setUsers([{ name: userName, avatar: '🎧', isHost: true }]);
    setMessages([]);
    saveToStorage('currentRoom', newRoom);
    initChannel(code, true, newRoom);
    return code;
  }, [userName]);

  const joinRoom = useCallback((code) => {
    const newRoom = { id: code, code, name: `Room ${code}`, joined: true };
    setRoom(newRoom);
    setIsHost(false);
    setUsers([{ name: userName, avatar: '🎵', isHost: false }]);
    saveToStorage('currentRoom', newRoom);
    initChannel(code, false, newRoom);
    
    // Request sync
    setTimeout(() => {
      broadcastToSupabaseRoom(channelRef.current, 'request_sync', { user: userName });
    }, 1000);
  }, [userName]);

  const leaveRoom = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setRoom(null); setMessages([]); setUsers([]); setIsHost(false);
    saveToStorage('currentRoom', null);
  }, []);

  function initChannel(code, amIHost, currentRoom) {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
    }
    
    channelRef.current = joinSupabaseRoomChannel(code, userName, {
      onSync: (msg) => {
        if (amIHost) return;
        
        // Update host name if missing
        setRoom(prev => prev && !prev.host ? { ...prev, host: msg.hostName } : prev);

        // Allow some drift (1.5s) to avoid micro-stutters
        if (Math.abs(player.currentTime - msg.currentTime) > 1.5) {
          player.seek(msg.currentTime);
        }
        if (msg.isPlaying !== player.isPlaying) {
          player.dispatch({ type: 'SET_PLAYING', payload: msg.isPlaying });
        }
        // If we missed a song change but received a sync
        if (msg.song && (!player.currentSong || player.currentSong.id !== msg.song.id)) {
          player.playSong(msg.song);
        }
      },
      onSongChange: (msg) => {
        if (!amIHost && msg.song) {
          player.playSong(msg.song);
        }
      },
      onChat: (msg) => {
        setMessages(prev => [...prev, msg]);
      },
      onReaction: (msg) => {
        setMessages(prev => [...prev, msg]);
      },
      onPresenceSync: (state) => {
        const connectedUsers = [];
        for (const id in state) {
          const presences = state[id];
          if (presences && presences.length > 0) {
            const isUserHost = presences[0].user === currentRoom?.host || presences[0].user === (room?.host || userName);
            connectedUsers.push({
              name: presences[0].user,
              avatar: isUserHost ? '🎧' : '🎵',
              isHost: isUserHost
            });
          }
        }
        setUsers(connectedUsers);
      }
    });
    
    // Add custom handler for sync request directly to channel object
    channelRef.current.on('broadcast', { event: 'request_sync' }, () => {
      if (amIHost) syncPlayback();
    });
  }

  const sendChat = useCallback((text) => {
    if (!room) return;
    const msg = { text, sender: userName, ts: Date.now() };
    setMessages(prev => [...prev, msg]);
    broadcastToSupabaseRoom(channelRef.current, 'chat', msg);
  }, [room, userName]);

  const sendReaction = useCallback((emoji) => {
    if (!room) return;
    const msg = { emoji, sender: userName, ts: Date.now(), isReaction: true };
    setMessages(prev => [...prev, msg]);
    broadcastToSupabaseRoom(channelRef.current, 'reaction', msg);
  }, [room, userName]);

  const syncPlayback = useCallback(() => {
    if (!room || !isHost) return;
    broadcastToSupabaseRoom(channelRef.current, 'sync', {
      currentTime: player.currentTime,
      isPlaying: player.isPlaying,
      song: player.currentSong, // sending full song just in case they don't have it
      hostName: userName,
    });
  }, [room, isHost, player.currentTime, player.isPlaying, player.currentSong, userName]);

  const changeSong = useCallback((song) => {
    if (!room) return;
    broadcastToSupabaseRoom(channelRef.current, 'song_change', { song });
    // Also trigger immediate sync
    setTimeout(syncPlayback, 500);
  }, [room, syncPlayback]);

  // Auto sync every 3 seconds if host
  useEffect(() => {
    if (!room || !isHost) return;
    const interval = setInterval(syncPlayback, 3000);
    return () => clearInterval(interval);
  }, [room, isHost, syncPlayback]);

  const value = {
    room, messages, users, isHost, hostControl,
    createRoom, joinRoom, leaveRoom, sendChat, sendReaction,
    syncPlayback, changeSong, setHostControl,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export const useRoom = () => useContext(RoomContext);
