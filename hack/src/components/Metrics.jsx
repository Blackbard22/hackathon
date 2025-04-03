import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavFooter from './NavFooter';
import './Metrics.css';

function Metrics() {
  const [metrics, setMetrics] = useState([]);
  const [sequenceMetrics, setSequenceMetrics] = useState([]);
  const [colorMatchMetrics, setColorMatchMetrics] = useState([]);
  const [verbalFluencyMetrics, setVerbalFluencyMetrics] = useState([]);
  const [spotDifferenceMetrics, setSpotDifferenceMetrics] = useState([]);
  const [activeTab, setActiveTab] = useState('puzzle');
  const navigate = useNavigate();

  useEffect(() => {
    const savedPuzzleMetrics = JSON.parse(localStorage.getItem('gameMetrics')) || [];
    const savedSequenceMetrics = JSON.parse(localStorage.getItem('sequenceGameMetrics')) || [];
    const savedColorMatchMetrics = JSON.parse(localStorage.getItem('colorMatchMetrics')) || [];
    const savedVerbalFluencyMetrics = JSON.parse(localStorage.getItem('verbalFluencyMetrics')) || [];
    const savedSpotDifferenceMetrics = JSON.parse(localStorage.getItem('spotDifferenceMetrics')) || [];
    
    setMetrics(savedPuzzleMetrics.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setSequenceMetrics(savedSequenceMetrics.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setColorMatchMetrics(savedColorMatchMetrics.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setVerbalFluencyMetrics(savedVerbalFluencyMetrics.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setSpotDifferenceMetrics(savedSpotDifferenceMetrics.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, []);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const goHome = () => {
    navigate('/');
  };

  const calculatePuzzleAverage = (property) => {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + metric[property], 0);
    return (sum / metrics.length).toFixed(2);
  };

  const calculateSequenceAverage = (property) => {
    if (sequenceMetrics.length === 0) return 0;
    const sum = sequenceMetrics.reduce((acc, metric) => acc + metric[property], 0);
    return (sum / sequenceMetrics.length).toFixed(2);
  };
  
  const calculateColorMatchAverage = (property) => {
    if (colorMatchMetrics.length === 0) return 0;
    const sum = colorMatchMetrics.reduce((acc, metric) => acc + metric[property], 0);
    return (sum / colorMatchMetrics.length).toFixed(2);
  };

  const calculateVerbalFluencyAverage = (property) => {
    if (verbalFluencyMetrics.length === 0) return 0;
    const sum = verbalFluencyMetrics.reduce((acc, metric) => acc + metric[property], 0);
    return (sum / verbalFluencyMetrics.length).toFixed(2);
  };

  const calculateSpotDifferenceAverage = (property) => {
    if (spotDifferenceMetrics.length === 0) return 0;
    const sum = spotDifferenceMetrics.reduce((acc, metric) => acc + metric[property], 0);
    return (sum / spotDifferenceMetrics.length).toFixed(2);
  };

  const calculatePuzzleImprovement = () => {
    if (metrics.length < 2) return null;
    
    // Sort by date in ascending order (oldest first)
    const sortedMetrics = [...metrics].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get first 3 and last 3 games, or fewer if not enough games
    const firstGames = sortedMetrics.slice(0, Math.min(3, sortedMetrics.length));
    const lastGames = sortedMetrics.slice(Math.max(0, sortedMetrics.length - 3));
    
    // Calculate averages
    const firstAvgTime = firstGames.reduce((acc, game) => acc + game.time, 0) / firstGames.length;
    const lastAvgTime = lastGames.reduce((acc, game) => acc + game.time, 0) / lastGames.length;
    
    const firstAvgMoves = firstGames.reduce((acc, game) => acc + game.moves, 0) / firstGames.length;
    const lastAvgMoves = lastGames.reduce((acc, game) => acc + game.moves, 0) / lastGames.length;
    
    // Calculate improvement percentage (negative means improvement)
    const timeImprovement = ((lastAvgTime - firstAvgTime) / firstAvgTime) * 100;
    const movesImprovement = ((lastAvgMoves - firstAvgMoves) / firstAvgMoves) * 100;
    
    return {
      time: timeImprovement,
      moves: movesImprovement
    };
  };
  
  const calculateSequenceImprovement = () => {
    if (sequenceMetrics.length < 2) return null;
    
    // Sort by date in ascending order (oldest first)
    const sortedMetrics = [...sequenceMetrics].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get first 3 and last 3 games, or fewer if not enough games
    const firstGames = sortedMetrics.slice(0, Math.min(3, sortedMetrics.length));
    const lastGames = sortedMetrics.slice(Math.max(0, sortedMetrics.length - 3));
    
    // Calculate averages
    const firstAvgCorrect = firstGames.reduce((acc, game) => acc + game.correctSequences, 0) / firstGames.length;
    const lastAvgCorrect = lastGames.reduce((acc, game) => acc + game.correctSequences, 0) / lastGames.length;
    
    const firstAvgErrors = firstGames.reduce((acc, game) => acc + game.errors, 0) / firstGames.length;
    const lastAvgErrors = lastGames.reduce((acc, game) => acc + game.errors, 0) / lastGames.length;
    
    const firstAvgTime = firstGames.reduce((acc, game) => acc + game.avgTimePerSequence, 0) / firstGames.length;
    const lastAvgTime = lastGames.reduce((acc, game) => acc + game.avgTimePerSequence, 0) / lastGames.length;
    
    // Calculate improvement percentage
    const correctImprovement = ((lastAvgCorrect - firstAvgCorrect) / firstAvgCorrect) * 100;
    const errorsImprovement = ((lastAvgErrors - firstAvgErrors) / firstAvgErrors) * 100;
    const timeImprovement = ((lastAvgTime - firstAvgTime) / firstAvgTime) * 100;
    
    return {
      correctSequences: correctImprovement,
      errors: errorsImprovement,
      time: timeImprovement
    };
  };
  
  const calculateColorMatchImprovement = () => {
    if (colorMatchMetrics.length < 2) return null;
    
    // Sort by date in ascending order (oldest first)
    const sortedMetrics = [...colorMatchMetrics].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get first 3 and last 3 games, or fewer if not enough games
    const firstGames = sortedMetrics.slice(0, Math.min(3, sortedMetrics.length));
    const lastGames = sortedMetrics.slice(Math.max(0, sortedMetrics.length - 3));
    
    // Calculate averages
    const firstAvgScore = firstGames.reduce((acc, game) => acc + game.score, 0) / firstGames.length;
    const lastAvgScore = lastGames.reduce((acc, game) => acc + game.score, 0) / lastGames.length;
    
    const firstAvgCorrect = firstGames.reduce((acc, game) => acc + game.correctAnswers, 0) / firstGames.length;
    const lastAvgCorrect = lastGames.reduce((acc, game) => acc + game.correctAnswers, 0) / lastGames.length;
    
    const firstAvgTime = firstGames.reduce((acc, game) => acc + game.avgReactionTime, 0) / firstGames.length;
    const lastAvgTime = lastGames.reduce((acc, game) => acc + game.avgReactionTime, 0) / lastGames.length;
    
    // Calculate improvement percentage
    const scoreImprovement = ((lastAvgScore - firstAvgScore) / firstAvgScore) * 100;
    const correctImprovement = ((lastAvgCorrect - firstAvgCorrect) / firstAvgCorrect) * 100;
    const timeImprovement = ((lastAvgTime - firstAvgTime) / firstAvgTime) * 100;
    
    return {
      score: scoreImprovement,
      correctAnswers: correctImprovement,
      time: timeImprovement
    };
  };

  const calculateVerbalFluencyImprovement = () => {
    if (verbalFluencyMetrics.length < 2) return null;
    
    // Sort by date in ascending order (oldest first)
    const sortedMetrics = [...verbalFluencyMetrics].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get first 3 and last 3 games, or fewer if not enough games
    const firstGames = sortedMetrics.slice(0, Math.min(3, sortedMetrics.length));
    const lastGames = sortedMetrics.slice(Math.max(0, sortedMetrics.length - 3));
    
    // Calculate averages
    const firstAvgScore = firstGames.reduce((acc, game) => acc + game.score, 0) / firstGames.length;
    const lastAvgScore = lastGames.reduce((acc, game) => acc + game.score, 0) / lastGames.length;
    
    const firstAvgWords = firstGames.reduce((acc, game) => acc + game.uniqueWords, 0) / firstGames.length;
    const lastAvgWords = lastGames.reduce((acc, game) => acc + game.uniqueWords, 0) / lastGames.length;
    
    const firstAvgTime = firstGames.reduce((acc, game) => acc + game.avgResponseTime, 0) / firstGames.length;
    const lastAvgTime = lastGames.reduce((acc, game) => acc + game.avgResponseTime, 0) / lastGames.length;
    
    // Calculate improvement percentage
    const scoreImprovement = ((lastAvgScore - firstAvgScore) / firstAvgScore) * 100;
    const wordsImprovement = ((lastAvgWords - firstAvgWords) / firstAvgWords) * 100;
    const timeImprovement = ((lastAvgTime - firstAvgTime) / firstAvgTime) * 100;
    
    return {
      score: scoreImprovement,
      words: wordsImprovement,
      time: timeImprovement
    };
  };

  const calculateSpotDifferenceImprovement = () => {
    if (spotDifferenceMetrics.length < 2) return null;
    
    // Sort by date in ascending order (oldest first)
    const sortedMetrics = [...spotDifferenceMetrics].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get first 3 and last 3 games, or fewer if not enough games
    const firstGames = sortedMetrics.slice(0, Math.min(3, sortedMetrics.length));
    const lastGames = sortedMetrics.slice(Math.max(0, sortedMetrics.length - 3));
    
    // Calculate averages
    const firstAvgScore = firstGames.reduce((acc, game) => acc + game.score, 0) / firstGames.length;
    const lastAvgScore = lastGames.reduce((acc, game) => acc + game.score, 0) / lastGames.length;
    
    const firstAvgFound = firstGames.reduce((acc, game) => acc + game.foundDifferencesCount, 0) / firstGames.length;
    const lastAvgFound = lastGames.reduce((acc, game) => acc + game.foundDifferencesCount, 0) / lastGames.length;
    
    const firstAvgHints = firstGames.reduce((acc, game) => acc + game.hintsUsed, 0) / firstGames.length;
    const lastAvgHints = lastGames.reduce((acc, game) => acc + game.hintsUsed, 0) / lastGames.length;
    
    // Calculate improvement percentage
    const scoreImprovement = ((lastAvgScore - firstAvgScore) / firstAvgScore) * 100;
    const foundImprovement = ((lastAvgFound - firstAvgFound) / firstAvgFound) * 100;
    const hintsImprovement = ((lastAvgHints - firstAvgHints) / firstAvgHints) * 100;
    
    return {
      score: scoreImprovement,
      foundDifferences: foundImprovement,
      hints: hintsImprovement
    };
  };

  const puzzleImprovement = calculatePuzzleImprovement();
  const sequenceImprovement = calculateSequenceImprovement();
  const colorMatchImprovement = calculateColorMatchImprovement();
  const verbalFluencyImprovement = calculateVerbalFluencyImprovement();
  const spotDifferenceImprovement = calculateSpotDifferenceImprovement();

  // Calculate time trend by comparing recent games to average
  const calculateTimeTrend = () => {
    if (metrics.length < 2) {
      return { improving: false, difference: 0 };
    }
    
    const allGames = [...metrics];
    const recentGames = [...metrics]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, Math.max(1, Math.floor(metrics.length / 3)));
    
    const overallAvg = allGames.reduce((sum, m) => sum + m.time, 0) / allGames.length;
    const recentAvg = recentGames.reduce((sum, m) => sum + m.time, 0) / recentGames.length;
    
    return {
      improving: recentAvg < overallAvg,
      difference: overallAvg - recentAvg
    };
  };

  // Calculate moves trend by comparing recent games to average
  const calculateMovesTrend = () => {
    if (metrics.length < 2) {
      return { improving: false, difference: 0 };
    }
    
    const allGames = [...metrics];
    const recentGames = [...metrics]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, Math.max(1, Math.floor(metrics.length / 3)));
    
    const overallAvg = allGames.reduce((sum, m) => sum + m.moves, 0) / allGames.length;
    const recentAvg = recentGames.reduce((sum, m) => sum + m.moves, 0) / recentGames.length;
    
    return {
      improving: recentAvg < overallAvg,
      difference: overallAvg - recentAvg
    };
  };

  const renderPuzzleMetrics = () => {
    if (metrics.length === 0) {
      return (
        <div className="no-metrics">
          <h2>No Puzzle Game Data</h2>
          <p>You haven't played any puzzle games yet. Complete a game to see your metrics!</p>
        </div>
      );
    }

    // Calculate averages
    const avgTime = metrics.reduce((sum, m) => sum + m.time, 0) / metrics.length;
    const avgMoves = metrics.reduce((sum, m) => sum + m.moves, 0) / metrics.length;
    
    // Get best records
    const bestTime = Math.min(...metrics.map(m => m.time));
    const bestMoves = Math.min(...metrics.map(m => m.moves));
    
    // Last 5 games for trend calculation
    const recentGames = [...metrics].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    // Calculate trends
    const timeTrend = calculateTimeTrend();
    const movesTrend = calculateMovesTrend();

    return (
      <div className="metrics-section">
        <h2>Puzzle Game Performance</h2>
        
        <div className="metrics-summary">
          <div className="metric-card">
            <h3>Games Completed</h3>
            <div className="metric-value">{metrics.length}</div>
          </div>
          
          <div className="metric-card">
            <h3>Average Time</h3>
            <div className="metric-value">{formatTime(avgTime)}</div>
          </div>
          
          <div className="metric-card">
            <h3>Average Moves</h3>
            <div className="metric-value">{Math.round(avgMoves)}</div>
          </div>
          
          <div className="metric-card">
            <h3>Games Today</h3>
            <div className="metric-value">{metrics.filter(m => {
              const today = new Date();
              const gameDate = new Date(m.date);
              return gameDate.getDate() === today.getDate() && 
                     gameDate.getMonth() === today.getMonth() &&
                     gameDate.getFullYear() === today.getFullYear();
            }).length}</div>
          </div>
        </div>
        
        <div className="improvement-section">
          <p>Your performance is {timeTrend.improving ? 'improving' : 'changing'} compared to your average:</p>
          
          <div className="improvement-metrics">
            <div className="improvement-item">
              <h3>Time Trend</h3>
              <p className={timeTrend.improving ? 'positive' : 'negative'}>
                {timeTrend.improving ? '↓' : '↑'} {formatTime(Math.abs(timeTrend.difference))}
                <span>
                  {timeTrend.improving 
                    ? 'Faster than your average' 
                    : 'Slower than your average'}
                </span>
              </p>
            </div>
            
            <div className="improvement-item">
              <h3>Best Time</h3>
              <p className="positive">
                {formatTime(bestTime)}
                <span>Your best completion time</span>
              </p>
            </div>
            
            <div className="improvement-item">
              <h3>Moves Trend</h3>
              <p className={movesTrend.improving ? 'positive' : 'negative'}>
                {movesTrend.improving ? '↓' : '↑'} {Math.abs(movesTrend.difference).toFixed(0)}
                <span>
                  {movesTrend.improving 
                    ? 'Fewer moves than average' 
                    : 'More moves than average'}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="metrics-content-grid">
          <div className="recent-games">
            <h3>Recent Games</h3>
            <div className="game-list">
              {recentGames.map((game, index) => (
                <div key={index} className="game-item">
                  <div className="game-item-header">
                    <h4>Puzzle Game</h4>
                    <span className="game-date">{formatDate(game.date)}</span>
                  </div>
                  <div className="game-stats">
                    <div className="game-stat">
                      <span className="stat-label">Time</span>
                      <span className="stat-value">{formatTime(game.time)}</span>
                    </div>
                    <div className="game-stat">
                      <span className="stat-label">Moves</span>
                      <span className="stat-value">{game.moves}</span>
                    </div>
                    <div className="game-stat">
                      <span className="stat-label">Performance</span>
                      <span className="stat-value">
                        {game.time < avgTime && game.moves < avgMoves
                          ? 'Excellent'
                          : game.time < avgTime || game.moves < avgMoves
                          ? 'Good'
                          : 'Average'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentGames.length === 0 && (
                <p>No recent games found.</p>
              )}
            </div>
          </div>
          
          <div className="performance-chart">
            <h3>Performance Trends</h3>
            <div className="chart-container">
              <p>Time and moves trend visualization would appear here.</p>
              <p>Your times are trending {timeTrend.improving ? 'down' : 'up'}, which is {timeTrend.improving ? 'good' : 'an area for improvement'}.</p>
              <p>Your moves are trending {movesTrend.improving ? 'down' : 'up'}, which is {movesTrend.improving ? 'good' : 'an area for improvement'}.</p>
            </div>
          </div>
        </div>

        <div className="metrics-history">
          <h3>Game History</h3>
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Moves</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {[...metrics].sort((a, b) => new Date(b.date) - new Date(a.date)).map((metric, index) => (
                <tr key={index}>
                  <td>{formatDate(metric.date)}</td>
                  <td>{formatTime(metric.time)}</td>
                  <td>{metric.moves}</td>
                  <td>{metric.completed ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSequenceMetrics = () => {
    if (sequenceMetrics.length === 0) {
      return (
        <div className="no-metrics">
          <h2>No Sequence Game Data</h2>
          <p>You haven't played any sequence pattern games yet. Complete a game to see your metrics!</p>
        </div>
      );
    }
    
    // Calculate averages and get recent games
    const avgCorrect = sequenceMetrics.reduce((sum, m) => sum + m.correctSequences, 0) / sequenceMetrics.length;
    const avgErrors = sequenceMetrics.reduce((sum, m) => sum + m.errors, 0) / sequenceMetrics.length;
    const avgTime = sequenceMetrics.reduce((sum, m) => sum + m.avgTimePerSequence, 0) / sequenceMetrics.length;
    
    // Last 5 games for trend calculation
    const recentGames = [...sequenceMetrics]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    // Calculate improvement
    const improvement = sequenceImprovement || {
      correctSequences: 0,
      errors: 0,
      time: 0
    };
    
    return (
      <div className="metrics-section">
        <h2>Sequence Game Performance</h2>
        
        <div className="metrics-summary">
          <div className="metric-card">
            <h3>Games Completed</h3>
            <div className="metric-value">{sequenceMetrics.length}</div>
          </div>
          
          <div className="metric-card">
            <h3>Avg. Correct Sequences</h3>
            <div className="metric-value">{avgCorrect.toFixed(1)}</div>
          </div>
          
          <div className="metric-card">
            <h3>Avg. Errors</h3>
            <div className="metric-value">{avgErrors.toFixed(1)}</div>
          </div>
          
          <div className="metric-card">
            <h3>Avg. Time Per Sequence</h3>
            <div className="metric-value">{formatTime(avgTime)}</div>
          </div>
        </div>
        
        <div className="improvement-section">
          <p>Your performance compared to when you started:</p>
          
          <div className="improvement-metrics">
            <div className="improvement-item">
              <h3>Correct Sequences</h3>
              <p className={improvement.correctSequences > 0 ? 'positive' : 'negative'}>
                {improvement.correctSequences > 0 ? '↑' : '↓'} {Math.abs(improvement.correctSequences).toFixed(1)}%
                <span>
                  {improvement.correctSequences > 0 
                    ? 'More correct sequences' 
                    : 'Fewer correct sequences'}
                </span>
              </p>
            </div>
            
            <div className="improvement-item">
              <h3>Error Rate</h3>
              <p className={improvement.errors < 0 ? 'positive' : 'negative'}>
                {improvement.errors < 0 ? '↓' : '↑'} {Math.abs(improvement.errors).toFixed(1)}%
                <span>
                  {improvement.errors < 0 
                    ? 'Fewer errors' 
                    : 'More errors'}
                </span>
              </p>
            </div>
            
            <div className="improvement-item">
              <h3>Time Per Sequence</h3>
              <p className={improvement.time < 0 ? 'positive' : 'negative'}>
                {improvement.time < 0 ? '↓' : '↑'} {Math.abs(improvement.time).toFixed(1)}%
                <span>
                  {improvement.time < 0 
                    ? 'Faster responses' 
                    : 'Slower responses'}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="metrics-content-grid">
          <div className="recent-games">
            <h3>Recent Games</h3>
            <div className="game-list">
              {recentGames.map((game, index) => (
                <div key={index} className="game-item">
                  <div className="game-item-header">
                    <h4>Sequence Game</h4>
                    <span className="game-date">{formatDate(game.date)}</span>
                  </div>
                  <div className="game-stats">
                    <div className="game-stat">
                      <span className="stat-label">Correct</span>
                      <span className="stat-value">{game.correctSequences}</span>
                    </div>
                    <div className="game-stat">
                      <span className="stat-label">Errors</span>
                      <span className="stat-value">{game.errors}</span>
                    </div>
                    <div className="game-stat">
                      <span className="stat-label">Time/Seq</span>
                      <span className="stat-value">{formatTime(game.avgTimePerSequence)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentGames.length === 0 && (
                <p>No recent games found.</p>
              )}
            </div>
          </div>
          
          <div className="performance-chart">
            <h3>Performance Trends</h3>
            <div className="chart-container">
              <p>Correct sequences trend: {improvement.correctSequences > 0 ? 'Improving' : 'Declining'}</p>
              <p>Error rate trend: {improvement.errors < 0 ? 'Improving' : 'Increasing'}</p>
              <p>Response time trend: {improvement.time < 0 ? 'Getting faster' : 'Getting slower'}</p>
            </div>
          </div>
        </div>

        <div className="metrics-history">
          <h3>Game History</h3>
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Correct Sequences</th>
                <th>Errors</th>
                <th>Avg. Time/Sequence</th>
              </tr>
            </thead>
            <tbody>
              {[...sequenceMetrics].sort((a, b) => new Date(b.date) - new Date(a.date)).map((metric, index) => (
                <tr key={index}>
                  <td>{formatDate(metric.date)}</td>
                  <td>{metric.correctSequences}</td>
                  <td>{metric.errors}</td>
                  <td>{formatTime(metric.avgTimePerSequence)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  const renderColorMatchMetrics = () => {
    if (colorMatchMetrics.length === 0) {
      return (
        <div className="no-metrics">
          <h2>No Color Match Game Data</h2>
          <p>You haven't played any color matching games yet. Complete a game to see your metrics!</p>
        </div>
      );
    }
    
    // Calculate averages and get recent games
    const avgScore = colorMatchMetrics.reduce((sum, m) => sum + m.score, 0) / colorMatchMetrics.length;
    const avgCorrect = colorMatchMetrics.reduce((sum, m) => sum + m.correctAnswers, 0) / colorMatchMetrics.length;
    const avgReactionTime = colorMatchMetrics.reduce((sum, m) => sum + m.avgReactionTime, 0) / colorMatchMetrics.length;
    
    // Last 5 games for display
    const recentGames = [...colorMatchMetrics]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    // Calculate improvement
    const improvement = colorMatchImprovement || {
      score: 0,
      correctAnswers: 0,
      time: 0
    };
    
    return (
      <div className="metrics-section">
        <h2>Color Match Performance</h2>
        
        <div className="metrics-summary">
          <div className="metric-card">
            <h3>Games Completed</h3>
            <div className="metric-value">{colorMatchMetrics.length}</div>
          </div>
          
          <div className="metric-card">
            <h3>Avg. Score</h3>
            <div className="metric-value">{avgScore.toFixed(1)}</div>
          </div>
          
          <div className="metric-card">
            <h3>Avg. Correct Answers</h3>
            <div className="metric-value">{avgCorrect.toFixed(1)}</div>
          </div>
          
          <div className="metric-card">
            <h3>Avg. Reaction Time</h3>
            <div className="metric-value">{avgReactionTime.toFixed(2)}s</div>
          </div>
        </div>
        
        <div className="improvement-section">
          <p>Your performance compared to when you started:</p>
          
          <div className="improvement-metrics">
            <div className="improvement-item">
              <h3>Score</h3>
              <p className={improvement.score > 0 ? 'positive' : 'negative'}>
                {improvement.score > 0 ? '↑' : '↓'} {Math.abs(improvement.score).toFixed(1)}%
                <span>
                  {improvement.score > 0 
                    ? 'Higher scores' 
                    : 'Lower scores'}
                </span>
              </p>
            </div>
            
            <div className="improvement-item">
              <h3>Correct Answers</h3>
              <p className={improvement.correctAnswers > 0 ? 'positive' : 'negative'}>
                {improvement.correctAnswers > 0 ? '↑' : '↓'} {Math.abs(improvement.correctAnswers).toFixed(1)}%
                <span>
                  {improvement.correctAnswers > 0 
                    ? 'More correct answers' 
                    : 'Fewer correct answers'}
                </span>
              </p>
            </div>
            
            <div className="improvement-item">
              <h3>Reaction Time</h3>
              <p className={improvement.time < 0 ? 'positive' : 'negative'}>
                {improvement.time < 0 ? '↓' : '↑'} {Math.abs(improvement.time).toFixed(1)}%
                <span>
                  {improvement.time < 0 
                    ? 'Faster reactions' 
                    : 'Slower reactions'}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="metrics-content-grid">
          <div className="recent-games">
            <h3>Recent Games</h3>
            <div className="game-list">
              {recentGames.map((game, index) => (
                <div key={index} className="game-item">
                  <div className="game-item-header">
                    <h4>Color Match Game</h4>
                    <span className="game-date">{formatDate(game.date)}</span>
                  </div>
                  <div className="game-stats">
                    <div className="game-stat">
                      <span className="stat-label">Score</span>
                      <span className="stat-value">{game.score}</span>
                    </div>
                    <div className="game-stat">
                      <span className="stat-label">Correct</span>
                      <span className="stat-value">{game.correctAnswers}</span>
                    </div>
                    <div className="game-stat">
                      <span className="stat-label">React Time</span>
                      <span className="stat-value">{game.avgReactionTime.toFixed(2)}s</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentGames.length === 0 && (
                <p>No recent games found.</p>
              )}
            </div>
          </div>
          
          <div className="performance-chart">
            <h3>Performance Trends</h3>
            <div className="chart-container">
              <p>Score trend: {improvement.score > 0 ? 'Improving' : 'Declining'}</p>
              <p>Accuracy trend: {improvement.correctAnswers > 0 ? 'Improving' : 'Declining'}</p>
              <p>Reaction time trend: {improvement.time < 0 ? 'Getting faster' : 'Getting slower'}</p>
            </div>
          </div>
        </div>

        <div className="metrics-history">
          <h3>Game History</h3>
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Score</th>
                <th>Correct</th>
                <th>Incorrect</th>
                <th>Reaction Time</th>
              </tr>
            </thead>
            <tbody>
              {[...colorMatchMetrics].sort((a, b) => new Date(b.date) - new Date(a.date)).map((metric, index) => (
                <tr key={index}>
                  <td>{formatDate(metric.date)}</td>
                  <td>{metric.score}</td>
                  <td>{metric.correctAnswers}</td>
                  <td>{metric.incorrectAnswers}</td>
                  <td>{metric.avgReactionTime.toFixed(2)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderVerbalFluencyMetrics = () => {
    if (verbalFluencyMetrics.length === 0) {
      return (
        <div className="no-metrics">
          <h2>No Verbal Fluency Game Data</h2>
          <p>You haven't played any verbal fluency games yet. Complete a game to see your metrics!</p>
        </div>
      );
    }
    
    // Calculate averages and get recent games
    const avgScore = verbalFluencyMetrics.reduce((sum, m) => sum + m.score, 0) / verbalFluencyMetrics.length;
    const avgWords = verbalFluencyMetrics.reduce((sum, m) => sum + m.uniqueWords, 0) / verbalFluencyMetrics.length;
    const avgWordsPerMin = verbalFluencyMetrics.reduce((sum, m) => sum + m.totalWordsPerMinute, 0) / verbalFluencyMetrics.length;
    
    // Last 5 games for display
    const recentGames = [...verbalFluencyMetrics]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    // Calculate improvement
    const improvement = verbalFluencyImprovement || {
      score: 0,
      words: 0,
      time: 0
    };
    
    return (
      <div className="metrics-section">
        <h2>Verbal Fluency Performance</h2>
        
        <div className="metrics-summary">
          <div className="metric-card">
            <h3>Games Completed</h3>
            <div className="metric-value">{verbalFluencyMetrics.length}</div>
          </div>
          
          <div className="metric-card">
            <h3>Avg. Score</h3>
            <div className="metric-value">{avgScore.toFixed(1)}</div>
          </div>
          
          <div className="metric-card">
            <h3>Avg. Words</h3>
            <div className="metric-value">{avgWords.toFixed(1)}</div>
          </div>
          
          <div className="metric-card">
            <h3>Avg. Words/Min</h3>
            <div className="metric-value">{avgWordsPerMin.toFixed(1)}</div>
          </div>
        </div>
        
        <div className="improvement-section">
          <p>Your performance compared to when you started:</p>
          
          <div className="improvement-metrics">
            <div className="improvement-item">
              <h3>Score</h3>
              <p className={improvement.score > 0 ? 'positive' : 'negative'}>
                {improvement.score > 0 ? '↑' : '↓'} {Math.abs(improvement.score).toFixed(1)}%
                <span>
                  {improvement.score > 0 
                    ? 'Higher scores' 
                    : 'Lower scores'}
                </span>
              </p>
            </div>
            
            <div className="improvement-item">
              <h3>Words Generated</h3>
              <p className={improvement.words > 0 ? 'positive' : 'negative'}>
                {improvement.words > 0 ? '↑' : '↓'} {Math.abs(improvement.words).toFixed(1)}%
                <span>
                  {improvement.words > 0 
                    ? 'More words' 
                    : 'Fewer words'}
                </span>
              </p>
            </div>
            
            <div className="improvement-item">
              <h3>Response Time</h3>
              <p className={improvement.time < 0 ? 'positive' : 'negative'}>
                {improvement.time < 0 ? '↓' : '↑'} {Math.abs(improvement.time).toFixed(1)}%
                <span>
                  {improvement.time < 0 
                    ? 'Faster responses' 
                    : 'Slower responses'}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="metrics-content-grid">
          <div className="recent-games">
            <h3>Recent Games</h3>
            <div className="game-list">
              {recentGames.map((game, index) => (
                <div key={index} className="game-item">
                  <div className="game-item-header">
                    <h4>Category: {game.category}</h4>
                    <span className="game-date">{formatDate(game.date)}</span>
                  </div>
                  <div className="game-stats">
                    <div className="game-stat">
                      <span className="stat-label">Words</span>
                      <span className="stat-value">{game.uniqueWords}</span>
                    </div>
                    <div className="game-stat">
                      <span className="stat-label">Words/Min</span>
                      <span className="stat-value">{game.totalWordsPerMinute.toFixed(1)}</span>
                    </div>
                    <div className="game-stat">
                      <span className="stat-label">Score</span>
                      <span className="stat-value">{game.score}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentGames.length === 0 && (
                <p>No recent games found.</p>
              )}
            </div>
          </div>
          
          <div className="performance-chart">
            <h3>Performance Trends</h3>
            <div className="chart-container">
              <p>Score trend: {improvement.score > 0 ? 'Improving' : 'Declining'}</p>
              <p>Word generation trend: {improvement.words > 0 ? 'Increasing' : 'Decreasing'}</p>
              <p>Response speed trend: {improvement.time < 0 ? 'Getting faster' : 'Getting slower'}</p>
            </div>
          </div>
        </div>

        <div className="metrics-history">
          <h3>Game History</h3>
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Words</th>
                <th>Score</th>
                <th>Words/Min</th>
                <th>Avg. Response</th>
              </tr>
            </thead>
            <tbody>
              {[...verbalFluencyMetrics].sort((a, b) => new Date(b.date) - new Date(a.date)).map((metric, index) => (
                <tr key={index}>
                  <td>{formatDate(metric.date)}</td>
                  <td>{metric.category}</td>
                  <td>{metric.uniqueWords}</td>
                  <td>{metric.score}</td>
                  <td>{metric.totalWordsPerMinute.toFixed(1)}</td>
                  <td>{metric.avgResponseTime.toFixed(2)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSpotDifferenceMetrics = () => {
    if (spotDifferenceMetrics.length === 0) {
      return (
        <div className="no-metrics">
          <h2>No Spot the Difference Game Data</h2>
          <p>You haven't played any spot the difference games yet. Complete a game to see your metrics!</p>
        </div>
      );
    }
    
    // Calculate averages and get recent games
    const avgScore = spotDifferenceMetrics.reduce((sum, m) => sum + m.score, 0) / spotDifferenceMetrics.length;
    const avgFound = spotDifferenceMetrics.reduce((sum, m) => sum + m.foundDifferencesCount, 0) / spotDifferenceMetrics.length;
    const avgHints = spotDifferenceMetrics.reduce((sum, m) => sum + m.hintsUsed, 0) / spotDifferenceMetrics.length;
    
    // Last 5 games for display
    const recentGames = [...spotDifferenceMetrics]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    // Calculate improvement
    const improvement = spotDifferenceImprovement || {
      score: 0,
      foundDifferences: 0,
      hints: 0
    };
    
    return (
      <div className="metrics-section">
        <h2>Spot the Difference Performance</h2>
        
        <div className="metrics-summary">
          <div className="metric-card">
            <h3>Games Completed</h3>
            <div className="metric-value">{spotDifferenceMetrics.length}</div>
          </div>
          
          <div className="metric-card">
            <h3>Avg. Score</h3>
            <div className="metric-value">{avgScore.toFixed(1)}</div>
          </div>
          
          <div className="metric-card">
            <h3>Avg. Differences Found</h3>
            <div className="metric-value">{avgFound.toFixed(1)}</div>
          </div>
          
          <div className="metric-card">
            <h3>Avg. Hints Used</h3>
            <div className="metric-value">{avgHints.toFixed(1)}</div>
          </div>
        </div>
        
        <div className="improvement-section">
          <p>Your performance compared to when you started:</p>
          
          <div className="improvement-metrics">
            <div className="improvement-item">
              <h3>Score</h3>
              <p className={improvement.score > 0 ? 'positive' : 'negative'}>
                {improvement.score > 0 ? '↑' : '↓'} {Math.abs(improvement.score).toFixed(1)}%
                <span>
                  {improvement.score > 0 
                    ? 'Higher scores' 
                    : 'Lower scores'}
                </span>
              </p>
            </div>
            
            <div className="improvement-item">
              <h3>Differences Found</h3>
              <p className={improvement.foundDifferences > 0 ? 'positive' : 'negative'}>
                {improvement.foundDifferences > 0 ? '↑' : '↓'} {Math.abs(improvement.foundDifferences).toFixed(1)}%
                <span>
                  {improvement.foundDifferences > 0 
                    ? 'Finding more differences' 
                    : 'Finding fewer differences'}
                </span>
              </p>
            </div>
            
            <div className="improvement-item">
              <h3>Hints Used</h3>
              <p className={improvement.hints < 0 ? 'positive' : 'negative'}>
                {improvement.hints < 0 ? '↓' : '↑'} {Math.abs(improvement.hints).toFixed(1)}%
                <span>
                  {improvement.hints < 0 
                    ? 'Using fewer hints' 
                    : 'Using more hints'}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="metrics-content-grid">
          <div className="recent-games">
            <h3>Recent Games</h3>
            <div className="game-list">
              {recentGames.map((game, index) => (
                <div key={index} className="game-item">
                  <div className="game-item-header">
                    <h4>Spot the Difference</h4>
                    <span className="game-date">{formatDate(game.date)}</span>
                  </div>
                  <div className="game-stats">
                    <div className="game-stat">
                      <span className="stat-label">Score</span>
                      <span className="stat-value">{game.score}</span>
                    </div>
                    <div className="game-stat">
                      <span className="stat-label">Found</span>
                      <span className="stat-value">{game.foundDifferencesCount}/{game.totalDifferences}</span>
                    </div>
                    <div className="game-stat">
                      <span className="stat-label">Hints</span>
                      <span className="stat-value">{game.hintsUsed}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentGames.length === 0 && (
                <p>No recent games found.</p>
              )}
            </div>
          </div>
          
          <div className="performance-chart">
            <h3>Performance Trends</h3>
            <div className="chart-container">
              <p>Score trend: {improvement.score > 0 ? 'Improving' : 'Declining'}</p>
              <p>Difference finding: {improvement.foundDifferences > 0 ? 'Finding more' : 'Finding fewer'}</p>
              <p>Hint usage: {improvement.hints < 0 ? 'Using fewer hints' : 'Using more hints'}</p>
            </div>
          </div>
        </div>

        <div className="metrics-history">
          <h3>Game History</h3>
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Score</th>
                <th>Found</th>
                <th>Total</th>
                <th>Hints</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {[...spotDifferenceMetrics].sort((a, b) => new Date(b.date) - new Date(a.date)).map((metric, index) => (
                <tr key={index}>
                  <td>{formatDate(metric.date)}</td>
                  <td>{metric.score}</td>
                  <td>{metric.foundDifferencesCount}</td>
                  <td>{metric.totalDifferences}</td>
                  <td>{metric.hintsUsed}</td>
                  <td>{metric.totalTime}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="metrics-container">
      <h1>Cognitive Performance Metrics</h1>
      
      <div className="metrics-tabs">
        <button 
          className={`tab-button ${activeTab === 'puzzle' ? 'active' : ''}`} 
          onClick={() => setActiveTab('puzzle')}
        >
          Puzzle Game Metrics
        </button>
        <button 
          className={`tab-button ${activeTab === 'sequence' ? 'active' : ''}`} 
          onClick={() => setActiveTab('sequence')}
        >
          Sequence Game Metrics
        </button>
        <button 
          className={`tab-button ${activeTab === 'colormatch' ? 'active' : ''}`} 
          onClick={() => setActiveTab('colormatch')}
        >
          Color Match Metrics
        </button>
        <button 
          className={`tab-button ${activeTab === 'verbalfluency' ? 'active' : ''}`} 
          onClick={() => setActiveTab('verbalfluency')}
        >
          Verbal Fluency Metrics
        </button>
        <button 
          className={`tab-button ${activeTab === 'spotdifference' ? 'active' : ''}`} 
          onClick={() => setActiveTab('spotdifference')}
        >
          Spot the Difference Metrics
        </button>
      </div>
      
      {metrics.length === 0 && sequenceMetrics.length === 0 && colorMatchMetrics.length === 0 && verbalFluencyMetrics.length === 0 && spotDifferenceMetrics.length === 0 ? (
        <div className="no-metrics">
          <h2>No Data Available</h2>
          <p>No game history available yet. Play some games to see your performance metrics!</p>
        </div>
      ) : (
        activeTab === 'puzzle' ? renderPuzzleMetrics() : 
        activeTab === 'sequence' ? renderSequenceMetrics() : 
        activeTab === 'colormatch' ? renderColorMatchMetrics() :
        activeTab === 'verbalfluency' ? renderVerbalFluencyMetrics() :
        renderSpotDifferenceMetrics()
      )}
      
      <NavFooter activePage="metrics" />
    </div>
  );
}

export default Metrics; 