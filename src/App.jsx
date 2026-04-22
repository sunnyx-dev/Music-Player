import { Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './contexts/PlayerContext';
import { PlaylistProvider } from './contexts/PlaylistContext';
import { RoomProvider } from './contexts/RoomContext';
import Sidebar from './components/Layout/Sidebar';
import MusicPlayer from './components/Player/MusicPlayer';
import FullScreenPlayer from './components/Player/FullScreenPlayer';
import QueuePanel from './components/Player/QueuePanel';
import ParticleBackground from './components/Effects/ParticleBackground';
import ToastContainer from './components/UI/Toast';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';
import PlaylistPage from './pages/PlaylistPage';
import SocialPage from './pages/SocialPage';
import RoomsListPage from './pages/RoomsListPage';
import RoomPage from './pages/RoomPage';
import InsightsPage from './pages/InsightsPage';

export default function App() {
  return (
    <PlayerProvider>
      <PlaylistProvider>
        <RoomProvider>
          <div className="app-layout">
            <ParticleBackground />
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/playlist/:id" element={<PlaylistPage />} />
                <Route path="/social" element={<SocialPage />} />
                <Route path="/rooms" element={<RoomsListPage />} />
                <Route path="/room/:id" element={<RoomPage />} />
                <Route path="/insights" element={<InsightsPage />} />
              </Routes>
            </main>
            <QueuePanel />
            <MusicPlayer />
            <FullScreenPlayer />
            <ToastContainer />
          </div>
        </RoomProvider>
      </PlaylistProvider>
    </PlayerProvider>
  );
}
