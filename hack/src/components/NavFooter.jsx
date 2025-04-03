import { useNavigate } from 'react-router-dom';
import './NavFooter.css';

function NavFooter({ activePage = 'none' }) {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  const goToSettings = () => {
    navigate('/settings');
  };

  return (
    <footer className="simple-footer">
      <button 
        className={`nav-button ${activePage === 'home' ? 'active' : ''}`} 
        aria-label="Home" 
        onClick={goHome}
      >
        <svg viewBox="0 0 24 24" width="32" height="32" strokeWidth="2" fill="none" stroke="currentColor">
          <path d="M6 12h4m4 0h4" />
          <path d="M8 9v6" />
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="18" cy="12" r="1" fill="currentColor" />
          <circle cx="16" cy="14" r="1" fill="currentColor" />
        </svg>
      </button>

      <button 
        className={`nav-button ${activePage === 'settings' ? 'active' : ''}`} 
        aria-label="Settings" 
        onClick={goToSettings}
      >
        <svg viewBox="0 0 24 24" width="32" height="32" strokeWidth="2" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </footer>
  );
}

export default NavFooter; 