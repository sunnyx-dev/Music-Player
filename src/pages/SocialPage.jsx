import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../contexts/PlayerContext';
import { MOCK_FRIENDS } from '../utils/constants';
import { Users, Search, UserPlus, Play } from 'lucide-react';

export default function SocialPage() {
  const { playSong } = usePlayer();
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    // Simulate loading friends
    setTimeout(() => setFriends(MOCK_FRIENDS), 500);
  }, []);

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 28 }}>👥 Social</motion.h1>
        <button className="btn-ghost"><UserPlus size={18} /> Add Friend</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
        <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
          <div className="section-title" style={{ fontSize: 16 }}>Activity Feed</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {friends.filter(f => f.listening).map(friend => (
              <div key={friend.id} className="friend-item" style={{ background: 'var(--surface2)' }}>
                <div className="friend-avatar">
                  {friend.avatar}
                  <div className={`friend-status ${friend.online ? 'online' : ''}`} />
                </div>
                <div className="friend-info">
                  <div className="friend-name">{friend.name} <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 'normal' }}>is listening to</span></div>
                  <div className="friend-listening">
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{friend.listening.song}</span> • {friend.listening.artist}
                  </div>
                </div>
                <div className="music-bars" style={{ marginRight: 16 }}>
                  <span/><span/><span/>
                </div>
                <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} 
                  onClick={() => playSong({ id: Math.random().toString(), name: friend.listening.song, artist: friend.listening.artist })}>
                  <Play size={12} /> Join
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <div className="section-title" style={{ fontSize: 16 }}>Online Friends ({friends.filter(f => f.online).length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {friends.filter(f => f.online).map(friend => (
              <div key={friend.id} className="friend-item">
                <div className="friend-avatar">{friend.avatar}<div className="friend-status online" /></div>
                <div className="friend-info">
                  <div className="friend-name">{friend.name}</div>
                  <div className="friend-listening" style={{ color: 'var(--primary)' }}>Online</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <div className="section-title" style={{ fontSize: 16 }}>Offline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {friends.filter(f => !f.online).map(friend => (
              <div key={friend.id} className="friend-item" style={{ opacity: 0.6 }}>
                <div className="friend-avatar">{friend.avatar}<div className="friend-status" /></div>
                <div className="friend-info">
                  <div className="friend-name">{friend.name}</div>
                  <div className="friend-listening">Offline</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
