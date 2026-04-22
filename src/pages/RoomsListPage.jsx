import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRoom } from '../contexts/RoomContext';
import { PUBLIC_ROOMS } from '../utils/constants';
import { Radio, Plus, LogIn, Users } from 'lucide-react';

export default function RoomsListPage() {
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useRoom();
  const [joinCode, setJoinCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState('');

  const handleCreate = () => {
    const code = createRoom(roomName);
    navigate(`/room/${code}`);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    joinRoom(joinCode.trim().toUpperCase());
    navigate(`/room/${joinCode.trim().toUpperCase()}`);
  };

  const joinPublicRoom = (room) => {
    joinRoom(room.id);
    navigate(`/room/${room.id}`);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 28 }}>📻 Listening Rooms</motion.h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={18} /> Create Room</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(108,60,224,0.1), rgba(0,212,255,0.05))' }}>
          <div className="section-title" style={{ fontSize: 18 }}><LogIn size={20} /> Join Private Room</div>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 16 }}>Enter a 6-character room code to join your friends.</p>
          <form onSubmit={handleJoin} style={{ display: 'flex', gap: 12 }}>
            <input placeholder="Enter Room Code (e.g. A1B2C3)" value={joinCode} onChange={e => setJoinCode(e.target.value)}
              style={{ textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'monospace', fontSize: 16 }} maxLength={6} />
            <button type="submit" className="btn-primary" disabled={joinCode.length < 3}>Join</button>
          </form>
        </div>
      </div>

      <div className="section-title">🌍 Public Mood Rooms</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {PUBLIC_ROOMS.map((room, i) => (
          <motion.div key={room.id} className="glass-card" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03 }} onClick={() => joinPublicRoom(room)}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 100, opacity: 0.1 }}>{room.emoji}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ fontSize: 32 }}>{room.emoji}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                {room.users}
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{room.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>Live listening session</div>
          </motion.div>
        ))}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <motion.div className="modal-content" onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="modal-title">Create New Room</div>
            <input placeholder="Room name (optional)" value={roomName} onChange={e => setRoomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()} autoFocus style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate}>Create Room</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
