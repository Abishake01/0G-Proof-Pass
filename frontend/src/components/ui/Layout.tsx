import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import ConnectWallet from '../wallet/ConnectWallet';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border bg-bg-secondary">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-accent-primary">
            <Wallet className="w-6 h-6" />
            <span>0G ProofPass</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors">
              Events
            </Link>
            <Link to="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">
              Dashboard
            </Link>
            <ConnectWallet />
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

