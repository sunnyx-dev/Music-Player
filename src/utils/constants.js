export const API_BASE = 'https://saavn.dev/api';

export const MOODS = [
  { id: 'romantic', label: 'Romantic', emoji: '💕', color: '#ff3b7f', query: 'romantic hindi songs' },
  { id: 'sad', label: 'Sad', emoji: '😢', color: '#5b7fff', query: 'sad hindi songs' },
  { id: 'gym', label: 'Workout', emoji: '💪', color: '#ff6b35', query: 'gym workout hindi' },
  { id: 'chill', label: 'Chill', emoji: '😌', color: '#00d4ff', query: 'chill vibes hindi' },
  { id: 'party', label: 'Party', emoji: '🎉', color: '#ffb800', query: 'party songs hindi' },
  { id: 'lofi', label: 'Lo-Fi', emoji: '🌙', color: '#9b59b6', query: 'lofi hindi' },
  { id: 'devotional', label: 'Devotional', emoji: '🙏', color: '#f39c12', query: 'devotional hindi' },
  { id: 'retro', label: 'Retro', emoji: '🎵', color: '#e74c3c', query: 'old hindi classic songs' },
];

export const PUBLIC_ROOMS = [
  { id: 'lofi-chill', name: 'LoFi Chill', emoji: '🌙', color: '#9b59b6', users: 42, mood: 'lofi' },
  { id: 'sad-night', name: 'Sad Night', emoji: '😢', color: '#5b7fff', users: 28, mood: 'sad' },
  { id: 'workout-mode', name: 'Workout Mode', emoji: '💪', color: '#ff6b35', users: 15, mood: 'gym' },
  { id: 'bollywood-party', name: 'Bollywood Party', emoji: '🎉', color: '#ffb800', users: 67, mood: 'party' },
  { id: 'romantic-vibes', name: 'Romantic Vibes', emoji: '💕', color: '#ff3b7f', users: 33, mood: 'romantic' },
];

export const BADGES = [
  { id: 'music-lover', name: 'Music Lover', icon: '🎵', desc: 'Listened to 100+ songs', requirement: 100 },
  { id: 'night-owl', name: 'Night Listener', icon: '🦉', desc: 'Listened after midnight 10 times', requirement: 10 },
  { id: 'streak-master', name: 'Streak Master', icon: '🔥', desc: '7-day listening streak', requirement: 7 },
  { id: 'social-butterfly', name: 'Social Butterfly', icon: '🦋', desc: 'Joined 5 listening rooms', requirement: 5 },
  { id: 'playlist-pro', name: 'Playlist Pro', icon: '📋', desc: 'Created 10 playlists', requirement: 10 },
  { id: 'explorer', name: 'Explorer', icon: '🧭', desc: 'Listened to 20 different artists', requirement: 20 },
];

export const MOCK_FRIENDS = [
  { id: 'f1', name: 'Aarav', avatar: '🧑', online: true, listening: { song: 'Tum Hi Ho', artist: 'Arijit Singh' } },
  { id: 'f2', name: 'Priya', avatar: '👩', online: true, listening: { song: 'Kesariya', artist: 'Arijit Singh' } },
  { id: 'f3', name: 'Rahul', avatar: '👨', online: false, listening: null },
  { id: 'f4', name: 'Sneha', avatar: '👧', online: true, listening: { song: 'Apna Bana Le', artist: 'Arijit Singh' } },
  { id: 'f5', name: 'Vikram', avatar: '🧔', online: false, listening: null },
  { id: 'f6', name: 'Ananya', avatar: '👩‍🦰', online: true, listening: { song: 'Chaleya', artist: 'Arijit Singh' } },
];
