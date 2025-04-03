import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SpotDifference.css';
import NavFooter from './NavFooter';

function SpotDifference() {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes per round
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [totalDifferences, setTotalDifferences] = useState(0);
  const [foundDifferences, setFoundDifferences] = useState([]);
  const [differencesData, setDifferencesData] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  const [hintCoordinates, setHintCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userEntry, setUserEntry] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackClass, setFeedbackClass] = useState('');
  
  // Refs
  const timerRef = useRef(null);
  const image1Ref = useRef(null);
  const image2Ref = useRef(null);
  const canvasRef = useRef(null);
  
  // Navigation
  const navigate = useNavigate();
  
  // Placeholder images using solid colors and simple shapes
  // These data URLs represent simple colored rectangles with basic shapes
  const placeholderImages = {
    // Preview images
    previewOriginal: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f9ff'/%3E%3Ccircle cx='100' cy='80' r='40' fill='%23bfdbfe'/%3E%3Crect x='180' y='60' width='80' height='40' fill='%2393c5fd'/%3E%3Ctext x='150' y='160' font-family='Arial' font-size='14' text-anchor='middle' fill='%234b5563'%3EOriginal Image%3C/text%3E%3C/svg%3E",
    previewModified: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f9ff'/%3E%3Ccircle cx='100' cy='80' r='40' fill='%23bfdbfe'/%3E%3Crect x='180' y='60' width='80' height='40' fill='%2393c5fd'/%3E%3Ctext x='150' y='160' font-family='Arial' font-size='14' text-anchor='middle' fill='%234b5563'%3EModified Image%3C/text%3E%3Ccircle cx='240' cy='40' r='15' fill='%23fb7185'/%3E%3C/svg%3E",
    
    // Living room
    livingRoom1: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='400' viewBox='0 0 500 400'%3E%3Crect width='500' height='400' fill='%23f8fafc'/%3E%3Crect x='50' y='250' width='400' height='100' fill='%2360a5fa'/%3E%3Crect x='100' y='200' width='80' height='50' fill='%23c084fc'/%3E%3Crect x='350' y='150' width='100' height='100' fill='%238b5cf6'/%3E%3Crect x='150' y='50' width='200' height='100' fill='%23a78bfa'/%3E%3Ctext x='250' y='380' font-family='Arial' font-size='16' text-anchor='middle' fill='%23000000'%3ELiving Room%3C/text%3E%3C/svg%3E",
    livingRoom2: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='400' viewBox='0 0 500 400'%3E%3Crect width='500' height='400' fill='%23f8fafc'/%3E%3Crect x='50' y='250' width='400' height='100' fill='%2360a5fa'/%3E%3Crect x='100' y='200' width='80' height='50' fill='%23c084fc'/%3E%3Crect x='350' y='150' width='100' height='100' fill='%2334d399'/%3E%3Crect x='150' y='50' width='200' height='100' fill='%23a78bfa'/%3E%3Ccircle cx='200' cy='300' r='20' fill='%23f87171'/%3E%3Ctext x='250' y='380' font-family='Arial' font-size='16' text-anchor='middle' fill='%23000000'%3ELiving Room%3C/text%3E%3C/svg%3E",
    
    // Kitchen
    kitchen1: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='400' viewBox='0 0 500 400'%3E%3Crect width='500' height='400' fill='%23f0fdfa'/%3E%3Crect x='50' y='150' width='400' height='150' fill='%236ee7b7'/%3E%3Crect x='100' y='100' width='300' height='50' fill='%2310b981'/%3E%3Crect x='150' y='200' width='50' height='50' fill='%23a7f3d0'/%3E%3Crect x='300' y='200' width='50' height='50' fill='%23a7f3d0'/%3E%3Ctext x='250' y='350' font-family='Arial' font-size='16' text-anchor='middle' fill='%23000000'%3EKitchen%3C/text%3E%3C/svg%3E",
    kitchen2: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='400' viewBox='0 0 500 400'%3E%3Crect width='500' height='400' fill='%23f0fdfa'/%3E%3Crect x='50' y='150' width='400' height='150' fill='%236ee7b7'/%3E%3Crect x='100' y='100' width='300' height='50' fill='%2310b981'/%3E%3Crect x='150' y='200' width='50' height='100' fill='%23a7f3d0'/%3E%3Crect x='300' y='200' width='50' height='50' fill='%23a7f3d0'/%3E%3Ccircle cx='400' cy='80' r='30' fill='%23fde68a'/%3E%3Ctext x='250' y='350' font-family='Arial' font-size='16' text-anchor='middle' fill='%23000000'%3EKitchen%3C/text%3E%3C/svg%3E",
    
    // Park
    park1: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='400' viewBox='0 0 500 400'%3E%3Crect width='500' height='400' fill='%23ecfdf5'/%3E%3Crect x='0' y='250' width='500' height='150' fill='%2334d399'/%3E%3Ccircle cx='100' cy='200' r='50' fill='%2365a30d'/%3E%3Ccircle cx='300' cy='180' r='70' fill='%2365a30d'/%3E%3Crect x='200' y='270' width='100' height='30' fill='%23a16207'/%3E%3Ctext x='250' y='350' font-family='Arial' font-size='16' text-anchor='middle' fill='%23000000'%3EPark%3C/text%3E%3C/svg%3E",
    park2: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='400' viewBox='0 0 500 400'%3E%3Crect width='500' height='400' fill='%23ecfdf5'/%3E%3Crect x='0' y='250' width='500' height='150' fill='%2334d399'/%3E%3Ccircle cx='100' cy='200' r='50' fill='%2365a30d'/%3E%3Ccircle cx='300' cy='180' r='70' fill='%2365a30d'/%3E%3Crect x='200' y='270' width='100' height='30' fill='%23a16207'/%3E%3Ccircle cx='400' cy='100' r='25' fill='%23fcd34d'/%3E%3Ctext x='250' y='350' font-family='Arial' font-size='16' text-anchor='middle' fill='%23000000'%3EPark%3C/text%3E%3Ccircle cx='150' cy='300' r='15' fill='%23fb7185'/%3E%3C/svg%3E"
  };
  
  // Sample image data using the placeholder images
  const sampleImagePairs = [
    {
      originalImage: placeholderImages.park1,
      modifiedImage: placeholderImages.park2,
      prompt: 'A peaceful park with trees and a bench',
      differences: [
        { x: 400, y: 100, description: 'Sun added to the sky' },
        { x: 150, y: 300, description: 'Person added near the bench' },
        { x: 50, y: 180, description: 'Bird on the left tree' },
        { x: 350, y: 230, description: 'Flower added in the grass' },
        { x: 250, y: 150, description: 'Different cloud shape' }
      ]
    },
    {
      originalImage: placeholderImages.livingRoom1,
      modifiedImage: placeholderImages.livingRoom2,
      prompt: 'A living room with furniture and decorations',
      differences: [
        { x: 350, y: 200, description: 'Green cabinet instead of purple' },
        { x: 200, y: 300, description: 'Red ball added to the couch' },
        { x: 250, y: 80, description: 'Picture frame is different' },
        { x: 120, y: 220, description: 'Lamp is a different shape' },
        { x: 400, y: 270, description: 'Extra cushion added' }
      ]
    },
    {
      originalImage: placeholderImages.kitchen1,
      modifiedImage: placeholderImages.kitchen2,
      prompt: 'A kitchen with appliances and countertops',
      differences: [
        { x: 400, y: 80, description: 'Sun visible through window' },
        { x: 175, y: 250, description: 'Cabinet door is longer' },
        { x: 320, y: 200, description: 'Different sink fixture' },
        { x: 100, y: 120, description: 'Extra shelf added' },
        { x: 250, y: 200, description: 'Fruit bowl is missing' }
      ]
    }
  ];
  
  // Constants
  const MAX_ROUNDS = 3;
  const POINTS_PER_DIFFERENCE = 10;
  const HINT_PENALTY = 5;
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);
  
  // Function to simulate AI image generation - in a real implementation, this would call an AI API
  const generateImageDifferences = (prompt) => {
    // Simulate API call delay
    setLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, we'll use the pre-defined sample data
        const randomIndex = Math.floor(Math.random() * sampleImagePairs.length);
        resolve(sampleImagePairs[randomIndex]);
        setLoading(false);
      }, 2000); // Simulate 2-second delay for "AI generation"
    });
  };
  
  // Start the game
  const startGame = async () => {
    setGameStarted(true);
    setGameCompleted(false);
    setCurrentRound(1);
    setScore(0);
    setFoundDifferences([]);
    
    // Start with first round
    await startRound(1);
  };
  
  // Start a specific round
  const startRound = async (roundNumber) => {
    setCurrentRound(roundNumber);
    setFoundDifferences([]);
    setHintUsed(false);
    setHintCoordinates(null);
    setTimeLeft(180); // Reset timer to 3 minutes
    
    // Start the timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          completeRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Generate or select a prompt for this round
    const prompt = `Round ${roundNumber} - Try to find all the differences!`;
    setCurrentPrompt(prompt);
    
    // Generate or get the images with differences
    const imageData = await generateImageDifferences(prompt);
    setDifferencesData(imageData);
    setTotalDifferences(imageData.differences.length);
  };
  
  // Handle clicks on images
  const handleImageClick = (e, imageNum) => {
    if (foundDifferences.length === totalDifferences) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is near any of the differences
    const clickedDifference = differencesData.differences.find((diff, index) => {
      // Don't check already found differences
      if (foundDifferences.includes(index)) return false;
      
      // Calculate distance from click to difference center
      const distance = Math.sqrt(Math.pow(x - diff.x, 2) + Math.pow(y - diff.y, 2));
      return distance < 30; // 30px radius for detection
    });
    
    if (clickedDifference) {
      const diffIndex = differencesData.differences.indexOf(clickedDifference);
      
      // Mark as found
      setFoundDifferences(prev => [...prev, diffIndex]);
      
      // Update score
      setScore(prev => prev + POINTS_PER_DIFFERENCE);
      
      // Show feedback
      setFeedbackMessage(`Good job! You found: ${clickedDifference.description}`);
      setFeedbackClass('correct');
      
      // Clear feedback after 2 seconds
      setTimeout(() => {
        setFeedbackMessage('');
      }, 2000);
      
      // Draw circle around the found difference
      drawCircle(imageNum, clickedDifference.x, clickedDifference.y);
      
      // Check if all differences found
      if (foundDifferences.length + 1 === totalDifferences) {
        setTimeout(() => {
          completeRound();
        }, 1000);
      }
    }
  };
  
  // Draw a circle on the image to highlight a difference
  const drawCircle = (imageNum, x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw circles for all found differences
    differencesData.differences.forEach((diff, index) => {
      if (foundDifferences.includes(index) || (x === diff.x && y === diff.y)) {
        ctx.beginPath();
        ctx.arc(diff.x, diff.y, 20, 0, 2 * Math.PI);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });
  };
  
  // Use a hint
  const useHint = () => {
    if (hintUsed || foundDifferences.length === totalDifferences) return;
    
    // Find a difference that hasn't been found yet
    const remainingDiffs = differencesData.differences.filter((_, index) => 
      !foundDifferences.includes(index)
    );
    
    if (remainingDiffs.length > 0) {
      const randomDiff = remainingDiffs[Math.floor(Math.random() * remainingDiffs.length)];
      setHintCoordinates({ x: randomDiff.x, y: randomDiff.y });
      setHintUsed(true);
      
      // Apply score penalty
      setScore(prev => Math.max(0, prev - HINT_PENALTY));
      
      // Draw hint circle
      drawCircle(1, randomDiff.x, randomDiff.y);
      
      // Show feedback
      setFeedbackMessage(`Hint used! Look around here. -${HINT_PENALTY} points`);
      setFeedbackClass('hint');
      
      // Clear feedback after 3 seconds
      setTimeout(() => {
        setFeedbackMessage('');
      }, 3000);
    }
  };
  
  // Handle text-based difference submission
  const handleDifferenceSubmit = (e) => {
    e.preventDefault();
    
    if (userEntry.trim() === '') {
      setFeedbackMessage('Please enter a description of the difference');
      setFeedbackClass('error');
      setTimeout(() => {
        setFeedbackMessage('');
      }, 2000);
      return;
    }
    
    // Check if the entered text matches any of the difference descriptions
    const matchedDiffIndex = differencesData.differences.findIndex((diff, index) => {
      if (foundDifferences.includes(index)) return false;
      
      // Case-insensitive simple matching - in a real app, would use more sophisticated matching
      return diff.description.toLowerCase().includes(userEntry.toLowerCase()) ||
             userEntry.toLowerCase().includes(diff.description.toLowerCase());
    });
    
    if (matchedDiffIndex !== -1) {
      // Mark as found
      setFoundDifferences(prev => [...prev, matchedDiffIndex]);
      
      // Update score
      setScore(prev => prev + POINTS_PER_DIFFERENCE);
      
      // Show feedback
      setFeedbackMessage(`Good job! You correctly identified: ${differencesData.differences[matchedDiffIndex].description}`);
      setFeedbackClass('correct');
      
      // Clear input
      setUserEntry('');
      
      // Draw circle around the found difference
      drawCircle(1, differencesData.differences[matchedDiffIndex].x, differencesData.differences[matchedDiffIndex].y);
      
      // Check if all differences found
      if (foundDifferences.length + 1 === totalDifferences) {
        setTimeout(() => {
          completeRound();
        }, 1000);
      }
    } else {
      // Not a match
      setFeedbackMessage('That doesn\'t match any of the remaining differences. Try again!');
      setFeedbackClass('error');
      
      // Clear feedback after 2 seconds
      setTimeout(() => {
        setFeedbackMessage('');
      }, 2000);
    }
  };
  
  // Complete the current round
  const completeRound = () => {
    clearInterval(timerRef.current);
    
    // Calculate bonus points for time left
    const timeBonus = timeLeft > 0 ? Math.floor(timeLeft / 10) : 0;
    setScore(prev => prev + timeBonus);
    
    if (currentRound < MAX_ROUNDS) {
      // Prepare for next round
      setTimeout(() => {
        startRound(currentRound + 1);
      }, 3000);
      
      // Show round completion message
      setFeedbackMessage(`Round ${currentRound} complete! ${foundDifferences.length} of ${totalDifferences} differences found. +${timeBonus} time bonus. Next round starting...`);
      setFeedbackClass('info');
    } else {
      // Game over
      endGame();
    }
  };
  
  // End the game
  const endGame = () => {
    setGameCompleted(true);
    
    // Calculate the total differences found across all rounds
    const totalDifferencesFound = foundDifferences.length;
    const totalPossibleDifferences = totalDifferences * MAX_ROUNDS;
    const hintsUsedCount = hintUsed ? 1 : 0;
    const totalTimeSpent = MAX_ROUNDS * 180 - timeLeft;
    
    // Save metrics to localStorage
    const gameMetrics = {
      date: new Date().toISOString(),
      score: score,
      foundDifferencesCount: totalDifferencesFound,
      totalDifferences: totalPossibleDifferences,
      hintsUsed: hintsUsedCount,
      totalTime: totalTimeSpent,
      accuracy: totalDifferencesFound > 0 ? ((totalDifferencesFound / totalPossibleDifferences) * 100).toFixed(1) : 0
    };
    
    const savedMetrics = JSON.parse(localStorage.getItem('spotDifferenceMetrics')) || [];
    localStorage.setItem('spotDifferenceMetrics', JSON.stringify([gameMetrics, ...savedMetrics]));
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
  
  // Calculate how many differences remain
  const remainingDifferences = totalDifferences - foundDifferences.length;
  
  return (
    <>
      <div className="content-area">
        <div className="spot-difference-container">
          {!gameStarted && !gameCompleted ? (
            <div className="spot-difference-intro">
              <h1>Spot the Difference</h1>
              
              <div className="spot-difference-intro-content">
                <div className="spot-difference-info">
                  <h2>Test Your Visual Perception</h2>
                  <p>This game tests your attention to detail and visual analysis skills.</p>
                  <ul>
                    <li>You'll be presented with two nearly identical images</li>
                    <li>Find and click on the differences between the images</li>
                    <li>Or type a description of the difference you notice</li>
                    <li>Each round has 5 differences to find</li>
                    <li>You have 3 minutes per round to find as many as you can</li>
                    <li>Use hints if you're stuck, but they'll cost you points!</li>
                  </ul>
                  
                  <div className="button-group">
                    <button className="start-button" onClick={startGame}>Start Game</button>
                    <button className="back-button" onClick={goHome}>Back to Home</button>
                  </div>
                </div>
                
                <div className="spot-difference-preview">
                  <h3>Game Preview</h3>
                  <div className="preview-images">
                    <img src={placeholderImages.previewOriginal} alt="Original image preview" />
                    <img src={placeholderImages.previewModified} alt="Modified image preview" />
                  </div>
                  <p className="preview-explanation">Find the differences between these two images!</p>
                </div>
              </div>
            </div>
          ) : gameCompleted ? (
            <div className="completion-message">
              <h2>Game Completed!</h2>
              <p>Great job! Here's how you did:</p>
              <p>Final Score: <strong>{score}</strong></p>
              <p>Differences Found: <strong>{foundDifferences.length} of {totalDifferences * MAX_ROUNDS}</strong></p>
              <p>Accuracy Rate: <strong>{Math.round((foundDifferences.length / (totalDifferences * MAX_ROUNDS)) * 100)}%</strong></p>
              
              <div className="button-group">
                <button className="play-again-button" onClick={playAgain}>Play Again</button>
                <button className="back-button" onClick={goHome}>Back to Home</button>
              </div>
            </div>
          ) : (
            <div className="active-spot-difference-game">
              <div className="spot-difference-header">
                <div className="spot-difference-metrics">
                  <div className="round-info">Round {currentRound}/{MAX_ROUNDS}</div>
                  <div className="time-left">Time: {formatTime(timeLeft)}</div>
                  <div className="current-score">Score: {score}</div>
                  <div className="differences-left">Differences: {foundDifferences.length}/{totalDifferences}</div>
                </div>
              </div>
              
              {loading ? (
                <div className="loading-container">
                  <h3>Generating images with AI...</h3>
                  <div className="loading-spinner"></div>
                  <p>Creating a challenging comparison for you!</p>
                </div>
              ) : differencesData ? (
                <div className="spot-difference-play-area">
                  <h2 className="round-title">{currentPrompt}</h2>
                  
                  {feedbackMessage && (
                    <div className={`feedback-message ${feedbackClass}`}>
                      {feedbackMessage}
                    </div>
                  )}
                  
                  <div className="images-container">
                    <div className="image-wrapper">
                      <h3>Image 1</h3>
                      <div className="image-with-canvas">
                        <img 
                          ref={image1Ref}
                          src={differencesData.originalImage} 
                          alt="Original image" 
                          onClick={(e) => handleImageClick(e, 1)}
                        />
                        <canvas 
                          ref={canvasRef} 
                          width="500" 
                          height="400" 
                          className="difference-canvas"
                        />
                      </div>
                    </div>
                    
                    <div className="image-wrapper">
                      <h3>Image 2</h3>
                      <img 
                        ref={image2Ref}
                        src={differencesData.modifiedImage} 
                        alt="Modified image" 
                        onClick={(e) => handleImageClick(e, 2)}
                      />
                    </div>
                  </div>
                  
                  <div className="game-controls">
                    <button 
                      className={`hint-button ${hintUsed ? 'used' : ''}`} 
                      onClick={useHint}
                      disabled={hintUsed || foundDifferences.length === totalDifferences}
                    >
                      Use Hint ({HINT_PENALTY} point penalty)
                    </button>
                    
                    <form onSubmit={handleDifferenceSubmit} className="difference-form">
                      <input
                        type="text"
                        value={userEntry}
                        onChange={(e) => setUserEntry(e.target.value)}
                        placeholder="Describe a difference you see..."
                        className="difference-input"
                      />
                      <button type="submit" className="submit-difference-button">
                        Submit
                      </button>
                    </form>
                  </div>
                  
                  <div className="found-differences-container">
                    <h3>Found Differences:</h3>
                    {foundDifferences.length > 0 ? (
                      <ul className="found-differences-list">
                        {foundDifferences.map(index => (
                          <li key={index} className="found-difference-item">
                            {differencesData.differences[index].description}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No differences found yet. Keep looking!</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      <NavFooter activePage="spotdifference" />
    </>
  );
}

export default SpotDifference; 