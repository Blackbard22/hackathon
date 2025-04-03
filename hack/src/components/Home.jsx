import { useNavigate } from 'react-router-dom';
import NavFooter from './NavFooter';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const goToPuzzleGame = () => {
    navigate('/game');
  };

  const goToSequenceGame = () => {
    navigate('/sequence-game');
  };

  const goToColorMatchGame = () => {
    navigate('/color-match');
  };

  const goToVerbalFluencyGame = () => {
    navigate('/verbal-fluency');
  };

  const goToSpotDifferenceGame = () => {
    navigate('/spot-difference');
  };

  const goToMetrics = () => {
    navigate('/metrics');
  };
  
  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="simple-home-container">
      <header className="simple-header">
        <h1>Cognitive Games</h1>
      </header>
      
      <div className="game-grid">
        <button 
          className="game-card" 
          onClick={goToPuzzleGame}
        >
          <span className="game-title">Face the Pieces</span>
        </button>
        
        <button 
          className="game-card" 
          onClick={goToSequenceGame}
        >
          <span className="game-title">Mind Match</span>
        </button>
        
        <button 
          className="game-card" 
          onClick={goToColorMatchGame}
        >
          <span className="game-title">Hue Rush</span>
        </button>
        
        <button 
          className="game-card" 
          onClick={goToVerbalFluencyGame}
        >
          <span className="game-title">Word Sprint</span>
        </button>
        
        <button 
          className="game-card" 
          onClick={goToSpotDifferenceGame}
        >
          <span className="game-title">Spot It</span>
        </button>
      </div>
      
      <NavFooter activePage="home" />
    </div>
  );
}

export default Home; 