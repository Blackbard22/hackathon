import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavFooter from './NavFooter';
import './VerbalFluency.css';

function VerbalFluency() {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds game
  const [currentCategory, setCurrentCategory] = useState('');
  const [userInput, setUserInput] = useState('');
  const [submittedWords, setSubmittedWords] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [score, setScore] = useState(0);
  const [uniqueWordsCount, setUniqueWordsCount] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [lastWordTime, setLastWordTime] = useState(null);
  const [responseTimes, setResponseTimes] = useState([]);
  
  // Refs
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  
  // Navigation
  const navigate = useNavigate();
  
  // Categories for the game
  const categories = [
    'Animals',
    'Fruits',
    'Vegetables',
    'Countries',
    'Sports',
    'Occupations',
    'Clothing items',
    'Household objects',
    'Transportation modes',
    'Colors'
  ];
  
  // Common words in each category to check against
  const categoryWords = {
    'Animals': ['dog', 'cat', 'lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'bear', 'wolf', 
                'fox', 'rabbit', 'deer', 'squirrel', 'mouse', 'rat', 'horse', 'cow', 'pig', 'sheep', 
                'goat', 'chicken', 'duck', 'goose', 'fish', 'shark', 'dolphin', 'whale', 'snake', 'lizard', 
                'frog', 'turtle', 'crocodile', 'alligator', 'eagle', 'hawk', 'owl', 'penguin', 'ostrich'],
    'Fruits': ['apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry', 'blackberry', 
              'watermelon', 'melon', 'pineapple', 'mango', 'peach', 'pear', 'plum', 'kiwi', 'cherry', 
              'lemon', 'lime', 'coconut', 'fig', 'date', 'apricot', 'avocado', 'papaya', 'guava', 'lychee'],
    'Vegetables': ['carrot', 'potato', 'tomato', 'onion', 'garlic', 'lettuce', 'spinach', 'cabbage', 
                  'broccoli', 'cauliflower', 'cucumber', 'celery', 'bell pepper', 'eggplant', 'zucchini', 
                  'pumpkin', 'squash', 'radish', 'turnip', 'beetroot', 'corn', 'pea', 'bean', 'asparagus'],
    'Countries': ['usa', 'canada', 'mexico', 'brazil', 'argentina', 'colombia', 'peru', 'chile', 'uk', 
                 'france', 'germany', 'italy', 'spain', 'portugal', 'greece', 'russia', 'china', 'japan', 
                 'india', 'australia', 'egypt', 'nigeria', 'kenya', 'south africa', 'morocco'],
    'Sports': ['soccer', 'football', 'basketball', 'baseball', 'tennis', 'golf', 'hockey', 'volleyball', 
              'swimming', 'cycling', 'running', 'skiing', 'snowboarding', 'surfing', 'boxing', 'wrestling', 
              'karate', 'judo', 'gymnastics', 'rowing', 'sailing', 'climbing', 'skateboarding'],
    'Occupations': ['doctor', 'nurse', 'teacher', 'engineer', 'programmer', 'lawyer', 'judge', 'pilot', 
                   'chef', 'waiter', 'police officer', 'firefighter', 'soldier', 'artist', 'musician', 
                   'actor', 'director', 'writer', 'journalist', 'accountant', 'architect', 'scientist'],
    'Clothing items': ['shirt', 'pants', 'jeans', 'shorts', 'skirt', 'dress', 'jacket', 'coat', 'sweater', 
                      'hoodie', 'hat', 'cap', 'scarf', 'gloves', 'socks', 'shoes', 'boots', 'sandals', 
                      'suit', 'tie', 'belt', 'watch', 'underwear', 'pajamas', 'swimsuit', 'vest'],
    'Household objects': ['table', 'chair', 'sofa', 'bed', 'lamp', 'light', 'clock', 'fan', 'television', 
                         'computer', 'phone', 'refrigerator', 'stove', 'oven', 'microwave', 'blender', 
                         'toaster', 'plate', 'bowl', 'cup', 'glass', 'knife', 'fork', 'spoon', 'pan', 'pot'],
    'Transportation modes': ['car', 'truck', 'bus', 'train', 'subway', 'motorcycle', 'bicycle', 'scooter', 
                            'boat', 'ship', 'ferry', 'airplane', 'helicopter', 'hot air balloon', 'taxi', 
                            'tram', 'van', 'ambulance', 'firetruck'],
    'Colors': ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'brown', 'black', 'white', 
              'gray', 'gold', 'silver', 'bronze', 'navy', 'teal', 'cyan', 'magenta', 'turquoise', 'beige', 
              'maroon', 'indigo', 'violet']
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);
  
  // Start the game
  const startGame = () => {
    // Choose a random category
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    setCurrentCategory(randomCategory);
    
    // Reset game state
    setGameStarted(true);
    setGameCompleted(false);
    setTimeLeft(60);
    setSubmittedWords([]);
    setErrorMessage('');
    setScore(0);
    setUniqueWordsCount(0);
    setAvgResponseTime(0);
    setLastWordTime(Date.now());
    setResponseTimes([]);
    
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
    
    // Focus the input field
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };
  
  // Handle user input
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    setErrorMessage('');
  };
  
  // Submit a word
  const submitWord = (e) => {
    e.preventDefault();
    
    const word = userInput.trim().toLowerCase();
    
    // Check if input is empty
    if (word === '') {
      setErrorMessage('Please enter a word');
      return;
    }
    
    // Check if the word is already submitted
    if (submittedWords.includes(word)) {
      setErrorMessage('You already entered this word');
      return;
    }
    
    // Calculate response time
    const currentTime = Date.now();
    const responseTime = (currentTime - lastWordTime) / 1000; // in seconds
    
    // Add word to submitted words
    setSubmittedWords(prev => [...prev, word]);
    
    // Update metrics
    setUniqueWordsCount(prev => prev + 1);
    
    // Check if the word is in our common words list for the category
    const isCommonWord = categoryWords[currentCategory]?.includes(word);
    const pointsForWord = isCommonWord ? 1 : 2; // 2 points for less common words
    
    setScore(prev => prev + pointsForWord);
    
    // Update response times
    setResponseTimes(prev => [...prev, responseTime]);
    
    // Calculate new average response time
    const newResponseTimes = [...responseTimes, responseTime];
    const avgTime = newResponseTimes.reduce((sum, time) => sum + time, 0) / newResponseTimes.length;
    setAvgResponseTime(avgTime);
    
    // Reset input and lastWordTime
    setUserInput('');
    setLastWordTime(currentTime);
  };
  
  // End the game
  const endGame = () => {
    clearInterval(timerRef.current);
    setGameCompleted(true);
    
    // Calculate final metrics
    const finalAvgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
    
    // Save metrics to localStorage
    const gameMetrics = {
      date: new Date().toISOString(),
      category: currentCategory,
      uniqueWords: uniqueWordsCount,
      score: score,
      avgResponseTime: finalAvgResponseTime,
      totalWordsPerMinute: (uniqueWordsCount / 60) * 60 // Normalized to per minute
    };
    
    const savedMetrics = JSON.parse(localStorage.getItem('verbalFluencyMetrics')) || [];
    localStorage.setItem('verbalFluencyMetrics', JSON.stringify([...savedMetrics, gameMetrics]));
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
    <div className="verbal-fluency-container">
      <div className="content-area">
        <h1>Verbal Fluency Game</h1>
        
        {!gameStarted && !gameCompleted && (
          <div className="verbal-fluency-intro">
            <div className="verbal-fluency-info">
              <h2>Test Your Language Skills</h2>
              <p>This game measures your ability to generate words from a specific category as quickly as possible.</p>
              <ul>
                <li>You'll be given a random category (e.g., Animals, Fruits, etc.)</li>
                <li>Your task is to enter as many unique words in that category as you can think of</li>
                <li>You have 60 seconds to enter as many words as possible</li>
                <li>More unique or less common words earn extra points!</li>
              </ul>
              
              <div className="button-group">
                <button className="start-button" onClick={startGame}>Start Game</button>
                <button className="back-button" onClick={goHome}>Back to Home</button>
              </div>
            </div>
          </div>
        )}
        
        {gameStarted && !gameCompleted && (
          <div className="active-verbal-fluency-game">
            <div className="verbal-fluency-metrics">
              <div>Time Left: {timeLeft}s</div>
              <div>Score: {score}</div>
              <div>Words: {uniqueWordsCount}</div>
            </div>
            
            <div className="verbal-fluency-play-area">
              <div className="category-display">
                Category: <span>{currentCategory}</span>
              </div>
              
              <form className="word-input-form" onSubmit={submitWord}>
                <input
                  type="text"
                  ref={inputRef}
                  className="word-input"
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder={`Enter a ${currentCategory.toLowerCase()}...`}
                  autoComplete="off"
                />
                <button type="submit" className="submit-word-button">
                  Submit
                </button>
              </form>
              
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
              
              {submittedWords.length > 0 && (
                <div className="submitted-words-container">
                  <h3>Words Submitted ({submittedWords.length})</h3>
                  <div className="words-list">
                    {submittedWords.map((word, index) => (
                      <div key={index} className="submitted-word">
                        {word}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {gameCompleted && (
          <div className="completion-message">
            <h2>Game Completed!</h2>
            <p>Category: {currentCategory}</p>
            <p>Total Words: {uniqueWordsCount}</p>
            <p>Final Score: {score}</p>
            <p>Words Per Minute: {Math.round((uniqueWordsCount / 60) * 60)}</p>
            <p>Average Response Time: {avgResponseTime.toFixed(2)}s</p>
            
            <div className="words-summary">
              <h3>Words You Submitted:</h3>
              <div className="words-list">
                {submittedWords.map((word, index) => (
                  <div key={index} className="submitted-word">
                    {word}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="button-group">
              <button className="play-again-button" onClick={playAgain}>Play Again</button>
              <button className="back-button" onClick={goHome}>Back to Home</button>
            </div>
          </div>
        )}
      </div>
      <NavFooter activePage="verbal" />
    </div>
  );
}

export default VerbalFluency; 