import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavFooter from './NavFooter';
import './ColorMatch.css';

function ColorMatch() {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds game
  const [currentWord, setCurrentWord] = useState(null);
  const [currentWordColor, setCurrentWordColor] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [feedbackClass, setFeedbackClass] = useState('');
  
  // Refs
  const timerRef = useRef(null);
  const roundStartTimeRef = useRef(null);
  
  // Constants
  const colorWords = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];
  const colorValues = {
    RED: '#ef4444',
    BLUE: '#3b82f6',
    GREEN: '#10b981',
    YELLOW: '#eab308',
    PURPLE: '#8b5cf6',
    ORANGE: '#f97316'
  };
  
  const MAX_ROUNDS = 20;
  
  const navigate = useNavigate();
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);
  
  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setCurrentRound(0);
    setScore(0);
    setTimeLeft(60);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setReactionTimes([]);
    
    // Start the timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    generateNewRound();
  };
  
  // Generate a new round with a random color-word combination
  const generateNewRound = () => {
    // Set the start time for reaction time measurement
    roundStartTimeRef.current = Date.now();
    
    // Choose a random word
    const wordIndex = Math.floor(Math.random() * colorWords.length);
    const word = colorWords[wordIndex];
    
    // Choose a random color (potentially different from the word)
    let colorIndex;
    // 50% chance of the color matching the word (makes the game more challenging)
    if (Math.random() < 0.5) {
      colorIndex = wordIndex;
    } else {
      // Pick a different color
      do {
        colorIndex = Math.floor(Math.random() * colorWords.length);
      } while (colorIndex === wordIndex);
    }
    
    const color = colorWords[colorIndex];
    
    setCurrentWord(word);
    setCurrentWordColor(color);
    setFeedbackMessage(null);
    setFeedbackClass('');
    
    setCurrentRound(prev => prev + 1);
  };
  
  // Handle user answer
  const handleAnswer = (isMatch) => {
    const isActualMatch = currentWord === currentWordColor;
    const isCorrect = isMatch === isActualMatch;
    
    // Calculate reaction time
    const reactionTime = (Date.now() - roundStartTimeRef.current) / 1000;
    setReactionTimes(prev => [...prev, reactionTime]);
    
    if (isCorrect) {
      setScore(prev => prev + Math.max(10 - Math.floor(reactionTime), 1)); // Score based on speed
      setCorrectAnswers(prev => prev + 1);
      setFeedbackMessage('Correct!');
      setFeedbackClass('correct');
    } else {
      setIncorrectAnswers(prev => prev + 1);
      setFeedbackMessage('Incorrect!');
      setFeedbackClass('incorrect');
    }
    
    // Move to next round or end game
    setTimeout(() => {
      if (currentRound < MAX_ROUNDS && timeLeft > 0) {
        generateNewRound();
      } else {
        endGame();
      }
    }, 1000);
  };
  
  // End the game and save metrics
  const endGame = () => {
    clearInterval(timerRef.current);
    setGameCompleted(true);
    
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    
    // Save metrics to localStorage
    const gameMetrics = {
      date: new Date().toISOString(),
      score,
      correctAnswers,
      incorrectAnswers,
      avgReactionTime,
      totalRounds: currentRound
    };
    
    const savedMetrics = JSON.parse(localStorage.getItem('colorMatchMetrics')) || [];
    localStorage.setItem('colorMatchMetrics', JSON.stringify([...savedMetrics, gameMetrics]));
  };
  
  // Navigation functions
  const goHome = () => {
    navigate('/');
  };
  
  const playAgain = () => {
    setGameStarted(false);
    setGameCompleted(false);
    startGame();
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="colormatch-container">
      <div className="content-area">
        <h1>Color Match Game</h1>
        
        {!gameStarted && !gameCompleted && (
          <div className="colormatch-intro">
            <div className="colormatch-info">
              <h2>Test Your Attention & Speed</h2>
              <p>This game tests your ability to quickly identify if a word matches its text color.</p>
              <ul>
                <li>You'll see a word displayed in a specific color</li>
                <li>Your task is to decide if the word matches its text color</li>
                <li>For example, the word "RED" written in red color is a match</li>
                <li>But the word "RED" written in blue color is not a match</li>
                <li>Respond as quickly as possible to score more points</li>
                <li>You have 60 seconds to complete as many rounds as possible</li>
              </ul>
              
              <div className="button-group">
                <button className="start-button" onClick={startGame}>Start Game</button>
                <button className="back-button" onClick={goHome}>Back to Home</button>
              </div>
            </div>
          </div>
        )}
        
        {gameStarted && !gameCompleted && (
          <div className="active-colormatch-game">
            <div className="colormatch-metrics">
              <div>Score: {score}</div>
              <div>Time: {formatTime(timeLeft)}</div>
              <div>Round: {currentRound}/{MAX_ROUNDS}</div>
            </div>
            
            <div className="colormatch-play-area">
              <div 
                className="colormatch-word"
                style={{ color: colorValues[currentWordColor] }}
              >
                {currentWord}
              </div>
              
              <div className="colormatch-question">
                Does the word match its color?
              </div>
              
              <div className="colormatch-buttons">
                <button 
                  className="match-button" 
                  onClick={() => handleAnswer(true)}
                >
                  Match
                </button>
                <button 
                  className="no-match-button" 
                  onClick={() => handleAnswer(false)}
                >
                  No Match
                </button>
              </div>
              
              {feedbackMessage && (
                <div className={`feedback-message ${feedbackClass}`}>
                  {feedbackMessage}
                </div>
              )}
            </div>
          </div>
        )}
        
        {gameCompleted && (
          <div className="completion-message">
            <h2>Game Completed!</h2>
            <p>Final Score: {score}</p>
            <p>Correct Answers: {correctAnswers}</p>
            <p>Incorrect Answers: {incorrectAnswers}</p>
            <p>Accuracy: {Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100)}%</p>
            <p>Average Reaction Time: {(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length).toFixed(2)}s</p>
            
            <div className="button-group">
              <button className="play-again-button" onClick={playAgain}>Play Again</button>
              <button className="back-button" onClick={goHome}>Back to Home</button>
            </div>
          </div>
        )}
      </div>
      <NavFooter activePage="colormatch" />
    </div>
  );
}

export default ColorMatch; 