import { useState, useEffect } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import './index.css';
import NiftyIslandCalculator from './NiftyIslandCalculator';

function MainLandingPage() {
  // Set default theme to dark
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div>
      <header className="header">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <h1>P2E Calculator</h1>
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>

      <Routes>
        <Route path="/" element={
          <>
           <div className="main-content">
              <div className="bento-grid">
                <Link to="/nifty-island-calculator" className="grid-item relative">
                  <img 
                    src="./nifty-island-logo.svg" 
                    alt="Nifty Island Logo" 
                    className="w-32 h-32 object-contain"
                  />
                  <img 
                    src="./overlay.jpeg" 
                    alt="Overlay" 
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                  <h2 className="text-xl font-bold">Calculator</h2>
                </Link>
                <div className="grid-item">
                  <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Coming Soon</h3>
                </div>
                <div className="grid-item">
                  <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Coming Soon</h3>
                </div>
                <div className="grid-item">
                  <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Coming Soon</h3>
                </div>
              </div>
              
              <div className="sidebar">
                <h2 className="text-xl font-bold mb-4">Join Our Community</h2>
                <a 
                  href="https://discord.gg/A4hB9AD49N" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block mb-4 text-[#5865F2] hover:underline"
                >
                  Join Discord
                </a>
                <iframe 
                  src="https://discord.com/widget?id=521986124743311360&theme=dark" 
                  width="100%" 
                  height="500" 
                  allowTransparency={true} 
                  frameBorder="0" 
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
            <footer className="footer">
              <a 
                href="https://x.com/rjarivi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-400 transition-colors"
              >
                Made with ❤️ by @rjarivi
              </a>
            </footer>
          </>
        } />
        <Route path="/nifty-island-calculator" element={<NiftyIslandCalculator />} />
      </Routes>
    </div>
  );
}

export default MainLandingPage;
