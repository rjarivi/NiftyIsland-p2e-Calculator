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
          <h1 className="flex items-center text-2xl font-bold">
            <i className="fas fa-gamepad mr-2"></i> P2E Calculator
          </h1>
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors link-button glow-effect"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>

      <Routes>
        <Route path="/" element={
          <>
            <div className="main-content flex flex-row-reverse">
              <div className="bento-grid">
                <Link to="/nifty-island-calculator" className="grid-item relative overflow-hidden group">
                  <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                    <img 
                      src="/images/nifty-island-logo.svg" 
                      alt="Nifty Island Logo" 
                      className="w-full h-auto object-contain"
                    />
                    <Link to="/nifty-island-calculator" className="mt-4 inline-block w-full px-6 py-2 rounded-lg text-white font-bold text-lg transition-all bg-gradient-to-r from-[#ffe500] via-[#cf68fb] to-[#4fffbc] shadow-lg hover:shadow-xl link-button glow-effect">
                      Calculate your earnings
                    </Link>
                  </div>
                  <img 
                    src="/images/overlay.jpg" 
                    alt="Background Overlay" 
                    className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-300 group-hover:scale-110"
                  />
                </Link>
                <div className="grid-item text-center">
                  <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Coming Soon</h3>
                  <p className="text-sm text-gray-400">Suggest which P2E Calculator Should we do via our discord</p>
                </div>
              </div>
              <aside className="w-80 p-4 bg-[#16171D] text-white rounded-xl border border-[#262933] ml-[-50px]">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Join Our Community</h3>
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
              </aside>
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
