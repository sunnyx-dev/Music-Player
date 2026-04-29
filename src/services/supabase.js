import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Auth Functions ---
export const signUp = async (email, password, username) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  
  if (data.user) {
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: data.user.id, username }]);
    if (profileError) throw profileError;
  }
  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return { ...user, profile };
};

// --- Room Functions ---
export const createRoom = async (name, userId) => {
  const { data, error } = await supabase
    .from('rooms')
    .insert([{ name, created_by: userId }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getRooms = async () => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*, profiles(username, avatar_url)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const updateRoomState = async (roomId, nowPlayingId) => {
  const { data, error } = await supabase
    .from('rooms')
    .update({ now_playing_id: nowPlayingId })
    .eq('id', roomId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// --- Message Functions ---
export const sendMessage = async (roomId, userId, content) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ room_id: roomId, user_id: userId, content }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getMessages = async (roomId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles(username, avatar_url)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

// --- Realtime Subscriptions ---
export const subscribeToRoomMessages = (roomId, onMessageCallback) => {
  return supabase
    .channel(`messages:room_id=eq.${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        onMessageCallback(payload.new);
      }
    )
    .subscribe();
};

export const subscribeToRoomState = (roomId, onStateChangeCallback) => {
  return supabase
    .channel(`rooms:id=eq.${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        onStateChangeCallback(payload.new);
      }
    )
    .subscribe();
};

export const joinSupabaseRoomChannel = (roomId, userName, handlers) => {
  const channel = supabase.channel(`room:${roomId}`, {
    config: {
      broadcast: { self: false },
      presence: { key: userName },
    },
  });

  channel
    .on('broadcast', { event: 'sync' }, (payload) => handlers.onSync && handlers.onSync(payload.payload))
    .on('broadcast', { event: 'song_change' }, (payload) => handlers.onSongChange && handlers.onSongChange(payload.payload))
    .on('broadcast', { event: 'chat' }, (payload) => handlers.onChat && handlers.onChat(payload.payload))
    .on('broadcast', { event: 'reaction' }, (payload) => handlers.onReaction && handlers.onReaction(payload.payload))
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      handlers.onPresenceSync && handlers.onPresenceSync(state);
    });

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user: userName, joined_at: new Date().toISOString() });
    }
  });

  return channel;
};

export const broadcastToSupabaseRoom = (channel, event, payload) => {
  if (!channel) return;
  return channel.send({
    type: 'broadcast',
    event: event,
    payload: payload,
  });
};
