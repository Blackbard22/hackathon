import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavFooter from './NavFooter';
import './SequenceGame.css';

function SequenceGame() {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [errors, setErrors] = useState(0);
  
  // Game metrics
  const [correctSequences, setCorrectSequences] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [sequenceTimes, setSequenceTimes] = useState([]);
  
  // UI state
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [disableInput, setDisableInput] = useState(true);
  const [currentHighlight, setCurrentHighlight] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [gameProgress, setGameProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  // Refs
  const timerRef = useRef(null);
  const sequenceTimerRef = useRef(null);
  const levelTimerRef = useRef(null);
  
  const navigate = useNavigate();
  
  // Reduced max level for easier gameplay
  const MAX_LEVEL = 5;
  
  // Clear all timers on component unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(sequenceTimerRef.current);
      clearTimeout(levelTimerRef.current);
    };
  }, []);
  
  // Generate a sequence based on the current level
  const generateSequence = useCallback(() => {
    // Shorter sequences for easier gameplay
    const length = Math.min(2 + Math.floor(level / 2), 5);
    let sequence = [];
    
    // Simpler patterns
    if (level <= 2) {
      // Very simple pattern - just 1,2,3
      for (let i = 0; i < length; i++) {
        sequence.push(i % 4 + 1);
      }
    } else if (level <= 4) {
      // Simple pattern - repeating pairs
      const num1 = Math.floor(Math.random() * 4) + 1;
      const num2 = ((num1 + 1) % 4) + 1; // Adjacent number for easier pattern recognition
      for (let i = 0; i < length; i++) {
        sequence.push(i % 2 === 0 ? num1 : num2);
      }
    } else {
      // Slightly more complex but still predictable
      const startNumber = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < length; i++) {
        sequence.push(((startNumber + i) % 4) + 1);
      }
    }
    
    return sequence;
  }, [level]);
  
  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setLevel(1);
    setScore(0);
    setErrors(0);
    setCorrectSequences(0);
    setTotalTime(0);
    setSequenceTimes([]);
    setGameProgress(0);
    
    // Start the game timer
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
    
    startLevel();
  };
  
  // Show hint function
  const displayHint = () => {
    setShowHint(true);
    setTimeout(() => {
      setShowHint(false);
    }, 2000);
  };
  
  // Start a new level
  const startLevel = useCallback(() => {
    const newSequence = generateSequence();
    setCurrentSequence(newSequence);
    setUserSequence([]);
    setIsShowingSequence(true);
    setDisableInput(true);
    setFeedbackMessage(`Level ${level}: Watch the sequence...`);
    
    // Show the sequence to the user
    let i = 0;
    const showSequence = () => {
      if (i < newSequence.length) {
        setCurrentHighlight(newSequence[i]);
        
        sequenceTimerRef.current = setTimeout(() => {
          setCurrentHighlight(null);
          
          sequenceTimerRef.current = setTimeout(() => {
            i++;
            showSequence();
          }, 500); // Longer pause between highlights
        }, 1000); // Longer duration of highlight
      } else {
        // Sequence finished showing
        setIsShowingSequence(false);
        setDisableInput(false);
        setFeedbackMessage("Now repeat the sequence!");
        
        // Start timing this sequence attempt
        setTime(0);
      }
    };
    
    showSequence();
  }, [generateSequence, level]);
  
  // Check if the user's input matches the sequence
  useEffect(() => {
    if (!gameStarted || isShowingSequence || userSequence.length === 0) return;
    
    const lastInputIndex = userSequence.length - 1;
    
    if (userSequence[lastInputIndex] !== currentSequence[lastInputIndex]) {
      // Incorrect input
      setErrors(prev => prev + 1);
      setFeedbackMessage('Incorrect! Try again.');
      
      // Reset sequence after a delay
      levelTimerRef.current = setTimeout(() => {
        setUserSequence([]);
        startLevel();
      }, 2000);
      
      return;
    }
    
    // If the sequence is complete and correct
    if (userSequence.length === currentSequence.length) {
      setCorrectSequences(prev => prev + 1);
      setScore(prev => prev + currentSequence.length * 10);
      setSequenceTimes(prev => [...prev, time]);
      setTotalTime(prev => prev + time);
      setFeedbackMessage('Correct! Well done!');
      
      // Update progress
      setGameProgress(level / MAX_LEVEL * 100);
      
      // Move to next level or end game
      levelTimerRef.current = setTimeout(() => {
        if (level < MAX_LEVEL) {
          setLevel(prev => prev + 1);
          startLevel();
        } else {
          endGame();
        }
      }, 2000);
    }
  }, [userSequence, currentSequence, isShowingSequence, gameStarted, level, time, startLevel]);
  
  // Handle tile click
  const handleTileClick = (number) => {
    if (disableInput || isShowingSequence) return;
    
    setUserSequence(prev => [...prev, number]);
  };
  
  // End the game and save metrics
  const endGame = () => {
    clearInterval(timerRef.current);
    setGameCompleted(true);
    
    const avgTimePerSequence = sequenceTimes.length > 0 
      ? sequenceTimes.reduce((a, b) => a + b, 0) / sequenceTimes.length 
      : 0;
    
    // Save metrics to localStorage
    const gameMetrics = {
      date: new Date().toISOString(),
      correctSequences,
      errors,
      avgTimePerSequence,
      level
    };
    
    const savedMetrics = JSON.parse(localStorage.getItem('sequenceGameMetrics')) || [];
    localStorage.setItem('sequenceGameMetrics', JSON.stringify([...savedMetrics, gameMetrics]));
  };
  
  // Navigate back to home
  const goHome = () => {
    navigate('/');
  };
  
  // Play again
  const playAgain = () => {
    setGameStarted(false);
    setGameCompleted(false);
    startGame();
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Render sequence board tiles
  const renderTiles = () => {
    // Reduced to only 4 tiles for easier play
    const tiles = [];
    for (let i = 1; i <= 4; i++) {
      const isInNextSequence = showHint && currentSequence.length > userSequence.length && 
                               currentSequence[userSequence.length] === i;
      
      tiles.push(
        <div 
          key={i}
          className={`sequence-tile ${
            currentHighlight === i ? 'highlight' : ''
          } ${
            userSequence.length > 0 && userSequence[userSequence.length - 1] === i 
              ? userSequence[userSequence.length - 1] !== currentSequence[userSequence.length - 1] 
                ? 'error' 
                : 'clicked' 
              : ''
          } ${isInNextSequence ? 'hint' : ''} ${disableInput ? 'disabled' : ''}`}
          onClick={() => handleTileClick(i)}
        >
          {i}
        </div>
      );
    }
    return tiles;
  };
  
  // Render preview tiles for the game intro
  const renderPreviewTiles = () => {
    const tiles = [];
    for (let i = 1; i <= 4; i++) {
      const isHighlighted = [1, 3].includes(i);
      tiles.push(
        <div 
          key={i}
          className={`sequence-tile-preview ${isHighlighted ? 'highlight' : ''}`}
        >
          {i}
        </div>
      );
    }
    return tiles;
  };
  
  return (
    <div className="sequence-game-container">
      <div className="content-area">
        <h1>Sequence Pattern Game</h1>
        
        {!gameStarted && !gameCompleted && (
          <div className="sequence-intro">
            <p>Memorize and repeat the tile patterns. The patterns get longer and more complex as you progress.</p>
            <div className="sequence-board-preview">
              {renderPreviewTiles()}
            </div>
            <div className="button-group">
              <button className="start-button" onClick={startGame}>Start Game</button>
              <button className="back-button" onClick={goHome}>Back to Home</button>
            </div>
          </div>
        )}
        
        {gameStarted && !gameCompleted && (
          <div className="active-sequence-game">
            <div className="sequence-metrics">
              <div>Level: {level}/{MAX_LEVEL}</div>
              <div>Score: {score}</div>
              <div>Time: {formatTime(time)}</div>
            </div>
            
            <div className="sequence-play-area">
              <div className="feedback-message">
                {feedbackMessage}
              </div>
              
              <div className="sequence-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${gameProgress}%` }}
                  ></div>
                </div>
                <div className="progress-label">Progress: {Math.round(gameProgress)}%</div>
              </div>
              
              <button 
                className="hint-button" 
                onClick={displayHint} 
                disabled={isShowingSequence || showHint}
              >
                Show Hint
              </button>
              
              <div className="sequence-board">
                {renderTiles()}
              </div>
            </div>
          </div>
        )}
        
        {gameCompleted && (
          <div className="completion-message">
            <h2>Game Completed!</h2>
            <p>You completed all levels!</p>
            <p>Final Score: {score}</p>
            <p>Correct Sequences: {correctSequences}</p>
            <p>Errors: {errors}</p>
            <p>Average Time per Sequence: {formatTime(totalTime / correctSequences)}</p>
            <div className="button-group">
              <button className="play-again-button" onClick={playAgain}>Play Again</button>
              <button className="back-button" onClick={goHome}>Back to Home</button>
            </div>
          </div>
        )}
      </div>
      <NavFooter activePage="sequence" />
    </div>
  );
}

export default SequenceGame; 