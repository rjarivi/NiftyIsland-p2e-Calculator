import { Link } from 'react-router-dom';
import './index.css';

function LandingPage() {
  return (
    <div className="bento-grid">
      <div className="grid-item">
        <Link to="/nifty-island-calculator">Nifty Island Calculator</Link>
      </div>
      <div className="grid-item">Coming Soon</div>
      <div className="grid-item">Coming Soon</div>
      <div className="grid-item">Coming Soon</div>
    </div>
  );
}

export default LandingPage;
