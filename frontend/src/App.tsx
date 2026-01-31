import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Event from './pages/Event';
import Contribute from './pages/Contribute';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Layout from './components/ui/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:eventId" element={<Event />} />
        <Route path="/contribute/:eventId" element={<Contribute />} />
        <Route path="/profile/:address" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Layout>
  );
}

export default App;
