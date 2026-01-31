import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Event from './pages/Event';
import Contribute from './pages/Contribute';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Layout from './components/ui/Layout';
import ToastContainer from './components/ui/ToastContainer';
import DemoMode from './components/ui/DemoMode';
import { useToast } from './hooks/useToast';

function App() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/:eventId" element={<Event />} />
          <Route path="/contribute/:eventId" element={<Contribute />} />
          <Route path="/profile/:address" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <DemoMode />
    </>
  );
}

export default App;
