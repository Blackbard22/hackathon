import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './GamesSummary.css';

function GamesSummary() {
  const [puzzleMetrics, setPuzzleMetrics] = useState([]);
  const [sequenceMetrics, setSequenceMetrics] = useState([]);
  const [colorMatchMetrics, setColorMatchMetrics] = useState([]);
  const [verbalFluencyMetrics, setVerbalFluencyMetrics] = useState([]);
  const [spotDifferenceMetrics, setSpotDifferenceMetrics] = useState([]);
  
  useEffect(() => {
    // Load metrics from localStorage
    const savedPuzzleMetrics = JSON.parse(localStorage.getItem('gameMetrics')) || [];
    const savedSequenceMetrics = JSON.parse(localStorage.getItem('sequenceGameMetrics')) || [];
    const savedColorMatchMetrics = JSON.parse(localStorage.getItem('colorMatchMetrics')) || [];
    const savedVerbalFluencyMetrics = JSON.parse(localStorage.getItem('verbalFluencyMetrics')) || [];
    const savedSpotDifferenceMetrics = JSON.parse(localStorage.getItem('spotDifferenceMetrics')) || [];
    
    setPuzzleMetrics(savedPuzzleMetrics.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setSequenceMetrics(savedSequenceMetrics.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setColorMatchMetrics(savedColorMatchMetrics.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setVerbalFluencyMetrics(savedVerbalFluencyMetrics.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setSpotDifferenceMetrics(savedSpotDifferenceMetrics.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, []);
  
  // Helper functions for data summary
  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds && timeInSeconds !== 0) return '-';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const calculatePuzzleTrend = () => {
    if (puzzleMetrics.length < 2) return null;
    
    // Just compare last game to average of previous games
    const lastGame = puzzleMetrics[0];
    const previousGames = puzzleMetrics.slice(1);
    const avgTime = previousGames.reduce((sum, game) => sum + game.time, 0) / previousGames.length;
    const avgMoves = previousGames.reduce((sum, game) => sum + game.moves, 0) / previousGames.length;
    
    return {
      time: (lastGame.time - avgTime) / avgTime * 100,
      moves: (lastGame.moves - avgMoves) / avgMoves * 100
    };
  };
  
  const calculateSequenceTrend = () => {
    if (sequenceMetrics.length < 2) return null;
    
    // Just compare last game to average of previous games
    const lastGame = sequenceMetrics[0];
    const previousGames = sequenceMetrics.slice(1);
    const avgCorrect = previousGames.reduce((sum, game) => sum + game.correctSequences, 0) / previousGames.length;
    const avgErrors = previousGames.reduce((sum, game) => sum + game.errors, 0) / previousGames.length;
    
    return {
      correctSequences: (lastGame.correctSequences - avgCorrect) / avgCorrect * 100,
      errors: (lastGame.errors - avgErrors) / avgErrors * 100
    };
  };
  
  const calculateColorMatchTrend = () => {
    if (colorMatchMetrics.length < 2) return null;
    
    // Just compare last game to average of previous games
    const lastGame = colorMatchMetrics[0];
    const previousGames = colorMatchMetrics.slice(1);
    const avgScore = previousGames.reduce((sum, game) => sum + game.score, 0) / previousGames.length;
    const avgReactionTime = previousGames.reduce((sum, game) => sum + game.avgReactionTime, 0) / previousGames.length;
    
    return {
      score: (lastGame.score - avgScore) / avgScore * 100,
      reactionTime: (lastGame.avgReactionTime - avgReactionTime) / avgReactionTime * 100
    };
  };
  
  const calculateVerbalFluencyTrend = () => {
    if (verbalFluencyMetrics.length < 2) return null;
    
    // Just compare last game to average of previous games
    const lastGame = verbalFluencyMetrics[0];
    const previousGames = verbalFluencyMetrics.slice(1);
    const avgWords = previousGames.reduce((sum, game) => sum + game.uniqueWords, 0) / previousGames.length;
    const avgResponseTime = previousGames.reduce((sum, game) => sum + game.avgResponseTime, 0) / previousGames.length;
    
    return {
      words: (lastGame.uniqueWords - avgWords) / avgWords * 100,
      responsTime: (lastGame.avgResponseTime - avgResponseTime) / avgResponseTime * 100
    };
  };
  
  const calculateSpotDifferenceTrend = () => {
    if (spotDifferenceMetrics.length < 2) return null;
    
    // Just compare last game to average of previous games
    const lastGame = spotDifferenceMetrics[0];
    const previousGames = spotDifferenceMetrics.slice(1);
    const avgScore = previousGames.reduce((sum, game) => sum + game.score, 0) / previousGames.length;
    const avgFoundDifferences = previousGames.reduce((sum, game) => sum + game.foundDifferencesCount, 0) / previousGames.length;
    const avgHintsUsed = previousGames.reduce((sum, game) => sum + game.hintsUsed, 0) / previousGames.length;
    
    return {
      score: (lastGame.score - avgScore) / avgScore * 100,
      foundDifferences: (lastGame.foundDifferencesCount - avgFoundDifferences) / avgFoundDifferences * 100,
      hintsUsed: (lastGame.hintsUsed - avgHintsUsed) / avgHintsUsed * 100
    };
  };
  
  const puzzleTrend = calculatePuzzleTrend();
  const sequenceTrend = calculateSequenceTrend();
  const colorMatchTrend = calculateColorMatchTrend();
  const verbalFluencyTrend = calculateVerbalFluencyTrend();
  const spotDifferenceTrend = calculateSpotDifferenceTrend();
  
  const getLastPlayedDate = (metricsArray) => {
    if (metricsArray.length === 0) return 'Never played';
    const lastGame = metricsArray[0];
    const date = new Date(lastGame.date);
    return date.toLocaleDateString();
  };
  
  const getTotalGamesPlayed = () => {
    return puzzleMetrics.length + sequenceMetrics.length + colorMatchMetrics.length + verbalFluencyMetrics.length + spotDifferenceMetrics.length;
  };
  
  const getMostPlayedGame = () => {
    const counts = {
      puzzle: puzzleMetrics.length,
      sequence: sequenceMetrics.length,
      colorMatch: colorMatchMetrics.length,
      verbalFluency: verbalFluencyMetrics.length,
      spotDifference: spotDifferenceMetrics.length
    };
    
    if (counts.puzzle === 0 && counts.sequence === 0 && counts.colorMatch === 0 && counts.verbalFluency === 0 && counts.spotDifference === 0) {
      return 'None played yet';
    }
    
    let maxCount = 0;
    let maxGame = '';
    
    for (const [game, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxGame = game;
      }
    }
    
    switch (maxGame) {
      case 'puzzle': return 'Puzzle Game';
      case 'sequence': return 'Sequence Game';
      case 'colorMatch': return 'Color Match Game';
      case 'verbalFluency': return 'Verbal Fluency Game';
      case 'spotDifference': return 'Spot the Difference Game';
      default: return 'None played yet';
    }
  };
  
  return (
    <div className="games-summary">
      <h2>Your Cognitive Training Summary</h2>
      
      {getTotalGamesPlayed() === 0 ? (
        <div className="no-games-message">
          <p>You haven't played any games yet. Start playing to see your performance summary!</p>
        </div>
      ) : (
        <>
          <div className="overall-stats">
            <div className="stat-card">
              <h3>Total Games Played</h3>
              <p className="stat-value">{getTotalGamesPlayed()}</p>
            </div>
            <div className="stat-card">
              <h3>Most Played Game</h3>
              <p className="stat-value">{getMostPlayedGame()}</p>
            </div>
            <div className="stat-card">
              <h3>Last Training Session</h3>
              <p className="stat-value">
                {Math.max(
                  puzzleMetrics.length ? new Date(puzzleMetrics[0].date).getTime() : 0,
                  sequenceMetrics.length ? new Date(sequenceMetrics[0].date).getTime() : 0,
                  colorMatchMetrics.length ? new Date(colorMatchMetrics[0].date).getTime() : 0,
                  verbalFluencyMetrics.length ? new Date(verbalFluencyMetrics[0].date).getTime() : 0,
                  spotDifferenceMetrics.length ? new Date(spotDifferenceMetrics[0].date).getTime() : 0
                ) === 0 
                  ? 'Never played' 
                  : new Date(Math.max(
                      puzzleMetrics.length ? new Date(puzzleMetrics[0].date).getTime() : 0,
                      sequenceMetrics.length ? new Date(sequenceMetrics[0].date).getTime() : 0,
                      colorMatchMetrics.length ? new Date(colorMatchMetrics[0].date).getTime() : 0,
                      verbalFluencyMetrics.length ? new Date(verbalFluencyMetrics[0].date).getTime() : 0,
                      spotDifferenceMetrics.length ? new Date(spotDifferenceMetrics[0].date).getTime() : 0
                    )).toLocaleDateString()
                }
              </p>
            </div>
          </div>
          
          <div className="games-grid">
            {/* Puzzle Game Summary */}
            <div className="game-summary-card">
              <h3>Puzzle Game</h3>
              <div className="game-metrics">
                <div className="game-metric">
                  <span className="metric-label">Games Played:</span>
                  <span className="metric-value">{puzzleMetrics.length}</span>
                </div>
                <div className="game-metric">
                  <span className="metric-label">Last Played:</span>
                  <span className="metric-value">{getLastPlayedDate(puzzleMetrics)}</span>
                </div>
                {puzzleMetrics.length > 0 && (
                  <>
                    <div className="game-metric">
                      <span className="metric-label">Best Time:</span>
                      <span className="metric-value">
                        {formatTime(Math.min(...puzzleMetrics.map(m => m.time)))}
                      </span>
                    </div>
                    <div className="game-metric">
                      <span className="metric-label">Best Moves:</span>
                      <span className="metric-value">
                        {Math.min(...puzzleMetrics.map(m => m.moves))}
                      </span>
                    </div>
                    {puzzleTrend && (
                      <div className="trend-indicators">
                        <div className={`trend ${puzzleTrend.time < 0 ? 'positive' : 'negative'}`}>
                          Time: {puzzleTrend.time < 0 ? '▼' : '▲'} {Math.abs(puzzleTrend.time).toFixed(1)}%
                        </div>
                        <div className={`trend ${puzzleTrend.moves < 0 ? 'positive' : 'negative'}`}>
                          Moves: {puzzleTrend.moves < 0 ? '▼' : '▲'} {Math.abs(puzzleTrend.moves).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Sequence Game Summary */}
            <div className="game-summary-card">
              <h3>Sequence Game</h3>
              <div className="game-metrics">
                <div className="game-metric">
                  <span className="metric-label">Games Played:</span>
                  <span className="metric-value">{sequenceMetrics.length}</span>
                </div>
                <div className="game-metric">
                  <span className="metric-label">Last Played:</span>
                  <span className="metric-value">{getLastPlayedDate(sequenceMetrics)}</span>
                </div>
                {sequenceMetrics.length > 0 && (
                  <>
                    <div className="game-metric">
                      <span className="metric-label">Best Score:</span>
                      <span className="metric-value">
                        {Math.max(...sequenceMetrics.map(m => m.correctSequences))} correct
                      </span>
                    </div>
                    <div className="game-metric">
                      <span className="metric-label">Fewest Errors:</span>
                      <span className="metric-value">
                        {Math.min(...sequenceMetrics.map(m => m.errors))}
                      </span>
                    </div>
                    {sequenceTrend && (
                      <div className="trend-indicators">
                        <div className={`trend ${sequenceTrend.correctSequences > 0 ? 'positive' : 'negative'}`}>
                          Correct: {sequenceTrend.correctSequences > 0 ? '▲' : '▼'} {Math.abs(sequenceTrend.correctSequences).toFixed(1)}%
                        </div>
                        <div className={`trend ${sequenceTrend.errors < 0 ? 'positive' : 'negative'}`}>
                          Errors: {sequenceTrend.errors < 0 ? '▼' : '▲'} {Math.abs(sequenceTrend.errors).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Color Match Game Summary */}
            <div className="game-summary-card">
              <h3>Color Match Game</h3>
              <div className="game-metrics">
                <div className="game-metric">
                  <span className="metric-label">Games Played:</span>
                  <span className="metric-value">{colorMatchMetrics.length}</span>
                </div>
                <div className="game-metric">
                  <span className="metric-label">Last Played:</span>
                  <span className="metric-value">{getLastPlayedDate(colorMatchMetrics)}</span>
                </div>
                {colorMatchMetrics.length > 0 && (
                  <>
                    <div className="game-metric">
                      <span className="metric-label">Best Score:</span>
                      <span className="metric-value">
                        {Math.max(...colorMatchMetrics.map(m => m.score))}
                      </span>
                    </div>
                    <div className="game-metric">
                      <span className="metric-label">Best Reaction Time:</span>
                      <span className="metric-value">
                        {Math.min(...colorMatchMetrics.map(m => m.avgReactionTime)).toFixed(2)}s
                      </span>
                    </div>
                    {colorMatchTrend && (
                      <div className="trend-indicators">
                        <div className={`trend ${colorMatchTrend.score > 0 ? 'positive' : 'negative'}`}>
                          Score: {colorMatchTrend.score > 0 ? '▲' : '▼'} {Math.abs(colorMatchTrend.score).toFixed(1)}%
                        </div>
                        <div className={`trend ${colorMatchTrend.reactionTime < 0 ? 'positive' : 'negative'}`}>
                          Speed: {colorMatchTrend.reactionTime < 0 ? '▼' : '▲'} {Math.abs(colorMatchTrend.reactionTime).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Verbal Fluency Game Summary */}
            <div className="game-summary-card">
              <h3>Verbal Fluency Game</h3>
              <div className="game-metrics">
                <div className="game-metric">
                  <span className="metric-label">Games Played:</span>
                  <span className="metric-value">{verbalFluencyMetrics.length}</span>
                </div>
                <div className="game-metric">
                  <span className="metric-label">Last Played:</span>
                  <span className="metric-value">{getLastPlayedDate(verbalFluencyMetrics)}</span>
                </div>
                {verbalFluencyMetrics.length > 0 && (
                  <>
                    <div className="game-metric">
                      <span className="metric-label">Best Words Count:</span>
                      <span className="metric-value">
                        {Math.max(...verbalFluencyMetrics.map(m => m.uniqueWords))}
                      </span>
                    </div>
                    <div className="game-metric">
                      <span className="metric-label">Best Words/Min:</span>
                      <span className="metric-value">
                        {Math.max(...verbalFluencyMetrics.map(m => m.totalWordsPerMinute)).toFixed(1)}
                      </span>
                    </div>
                    {verbalFluencyTrend && (
                      <div className="trend-indicators">
                        <div className={`trend ${verbalFluencyTrend.words > 0 ? 'positive' : 'negative'}`}>
                          Words: {verbalFluencyTrend.words > 0 ? '▲' : '▼'} {Math.abs(verbalFluencyTrend.words).toFixed(1)}%
                        </div>
                        <div className={`trend ${verbalFluencyTrend.responsTime < 0 ? 'positive' : 'negative'}`}>
                          Speed: {verbalFluencyTrend.responsTime < 0 ? '▼' : '▲'} {Math.abs(verbalFluencyTrend.responsTime).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Spot the Difference Game Summary */}
            <div className="game-summary-card">
              <h3>Spot the Difference Game</h3>
              <div className="game-metrics">
                <div className="game-metric">
                  <span className="metric-label">Games Played:</span>
                  <span className="metric-value">{spotDifferenceMetrics.length}</span>
                </div>
                <div className="game-metric">
                  <span className="metric-label">Last Played:</span>
                  <span className="metric-value">{getLastPlayedDate(spotDifferenceMetrics)}</span>
                </div>
                {spotDifferenceMetrics.length > 0 && (
                  <>
                    <div className="game-metric">
                      <span className="metric-label">Best Score:</span>
                      <span className="metric-value">
                        {Math.max(...spotDifferenceMetrics.map(m => m.score))}
                      </span>
                    </div>
                    <div className="game-metric">
                      <span className="metric-label">Most Differences Found:</span>
                      <span className="metric-value">
                        {Math.max(...spotDifferenceMetrics.map(m => m.foundDifferencesCount))}
                      </span>
                    </div>
                    {spotDifferenceTrend && (
                      <div className="trend-indicators">
                        <div className={`trend ${spotDifferenceTrend.score > 0 ? 'positive' : 'negative'}`}>
                          Score: {spotDifferenceTrend.score > 0 ? '▲' : '▼'} {Math.abs(spotDifferenceTrend.score).toFixed(1)}%
                        </div>
                        <div className={`trend ${spotDifferenceTrend.hintsUsed < 0 ? 'positive' : 'negative'}`}>
                          Hints: {spotDifferenceTrend.hintsUsed < 0 ? '▼' : '▲'} {Math.abs(spotDifferenceTrend.hintsUsed).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="view-detailed-metrics">
            <Link to="/metrics" className="metrics-link">View Detailed Metrics</Link>
          </div>
        </>
      )}
    </div>
  );
}

export default GamesSummary; 