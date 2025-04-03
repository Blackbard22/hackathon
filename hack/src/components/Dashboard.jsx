import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [metrics, setMetrics] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('cognitive');
  const [patientInfo, setPatientInfo] = useState({
    name: "John Doe",
    age: 65,
    id: "PT-12345",
    startDate: "2023-12-15",
    gender: "Male",
    primaryDoctor: "Dr. Sarah Johnson",
    emergencyContact: "Jane Doe (Wife) - (555) 123-4567"
  });
  
  const [medicalHistory, setMedicalHistory] = useState({
    conditions: [
      { condition: "Hypertension", diagnosedDate: "2018-05-12", status: "Controlled with medication" },
      { condition: "Type 2 Diabetes", diagnosedDate: "2019-03-22", status: "Diet controlled" },
      { condition: "Mild Cognitive Impairment", diagnosedDate: "2022-11-08", status: "Ongoing monitoring" }
    ],
    medications: [
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", startDate: "2018-05-15" },
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily", startDate: "2019-03-25" },
      { name: "Donepezil", dosage: "5mg", frequency: "Once daily at bedtime", startDate: "2022-11-10" }
    ],
    familyHistory: [
      { relationship: "Father", condition: "Alzheimer's Disease", onsetAge: 72 },
      { relationship: "Mother", condition: "Hypertension", onsetAge: 65 }
    ],
    allergies: ["Penicillin", "Sulfa drugs"]
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated via session storage
    const auth = sessionStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadMetricsData();
    }
  }, []);

  const loadMetricsData = () => {
    // Load metrics from localStorage
    const savedMetrics = JSON.parse(localStorage.getItem('gameMetrics')) || [];
    setMetrics(savedMetrics.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple authentication (in a real app, this would be more secure)
    if (username === 'admin' && password === 'password') {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAuthenticated', 'true');
      loadMetricsData();
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    setUsername('');
    setPassword('');
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const calculateAverage = (property) => {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + metric[property], 0);
    return (sum / metrics.length).toFixed(2);
  };

  const getPerformanceTrend = () => {
    if (metrics.length < 4) return "Insufficient data for trend analysis";
    
    // Sort by date in ascending order (oldest first)
    const sortedMetrics = [...metrics].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Split into quarters
    const quarterSize = Math.ceil(sortedMetrics.length / 4);
    const quarters = [];
    for (let i = 0; i < 4; i++) {
      const start = i * quarterSize;
      const end = Math.min(start + quarterSize, sortedMetrics.length);
      if (start < sortedMetrics.length) {
        quarters.push(sortedMetrics.slice(start, end));
      }
    }
    
    // Calculate average time and moves for each quarter
    const quarterStats = quarters.map(quarter => {
      const avgTime = quarter.reduce((sum, game) => sum + game.time, 0) / quarter.length;
      const avgMoves = quarter.reduce((sum, game) => sum + game.moves, 0) / quarter.length;
      return { avgTime, avgMoves };
    });
    
    return quarterStats;
  };

  const getConsistencyScore = () => {
    if (metrics.length < 3) return "N/A";
    
    // Calculate standard deviation for time and moves
    const avgTime = parseFloat(calculateAverage('time'));
    const avgMoves = parseFloat(calculateAverage('moves'));
    
    const timeVariance = metrics.reduce((sum, game) => sum + Math.pow(game.time - avgTime, 2), 0) / metrics.length;
    const movesVariance = metrics.reduce((sum, game) => sum + Math.pow(game.moves - avgMoves, 2), 0) / metrics.length;
    
    const timeStdDev = Math.sqrt(timeVariance);
    const movesStdDev = Math.sqrt(movesVariance);
    
    // Calculate coefficient of variation (lower is more consistent)
    const timeCV = timeStdDev / avgTime;
    const movesCV = movesStdDev / avgMoves;
    
    // Calculate consistency score (100 - average CV as percentage, higher is better)
    const consistencyScore = 100 - ((timeCV + movesCV) / 2 * 100);
    return consistencyScore.toFixed(0);
  };

  const getPerformanceByTimeOfDay = () => {
    if (metrics.length < 5) return null;
    
    // Define time periods
    const periods = {
      morning: { start: 5, end: 12, games: [], avgTime: 0, avgMoves: 0 },
      afternoon: { start: 12, end: 17, games: [], avgTime: 0, avgMoves: 0 },
      evening: { start: 17, end: 21, games: [], avgTime: 0, avgMoves: 0 },
      night: { start: 21, end: 5, games: [], avgTime: 0, avgMoves: 0 }
    };
    
    // Sort games into time periods
    metrics.forEach(game => {
      const hour = new Date(game.date).getHours();
      
      if (hour >= periods.morning.start && hour < periods.morning.end) {
        periods.morning.games.push(game);
      } else if (hour >= periods.afternoon.start && hour < periods.afternoon.end) {
        periods.afternoon.games.push(game);
      } else if (hour >= periods.evening.start && hour < periods.evening.end) {
        periods.evening.games.push(game);
      } else {
        periods.night.games.push(game);
      }
    });
    
    // Calculate averages for each period
    Object.keys(periods).forEach(key => {
      const period = periods[key];
      if (period.games.length > 0) {
        period.avgTime = period.games.reduce((sum, game) => sum + game.time, 0) / period.games.length;
        period.avgMoves = period.games.reduce((sum, game) => sum + game.moves, 0) / period.games.length;
      }
    });
    
    return periods;
  };

  const calculateDementiaRisk = () => {
    if (metrics.length < 5) return { score: "Insufficient data", level: "unknown", factors: [] };
    
    // Base risk factors
    let riskFactors = [];
    let riskScore = 0;
    
    // Age factor
    if (patientInfo.age >= 65) {
      riskScore += 10;
      riskFactors.push("Age over 65");
    }
    if (patientInfo.age >= 75) {
      riskScore += 15;
      riskFactors.push("Age over 75");
    }
    
    // Family history factor
    const familyAlzheimers = medicalHistory.familyHistory.some(
      history => history.condition.toLowerCase().includes("alzheimer") || 
                history.condition.toLowerCase().includes("dementia")
    );
    if (familyAlzheimers) {
      riskScore += 25;
      riskFactors.push("Family history of dementia/Alzheimer's");
    }
    
    // Medical conditions
    const hasMCI = medicalHistory.conditions.some(
      condition => condition.condition.toLowerCase().includes("cognitive impairment")
    );
    if (hasMCI) {
      riskScore += 30;
      riskFactors.push("Diagnosed with Mild Cognitive Impairment");
    }
    
    const hasDiabetes = medicalHistory.conditions.some(
      condition => condition.condition.toLowerCase().includes("diabetes")
    );
    if (hasDiabetes) {
      riskScore += 10;
      riskFactors.push("Type 2 Diabetes");
    }
    
    const hasHypertension = medicalHistory.conditions.some(
      condition => condition.condition.toLowerCase().includes("hypertension")
    );
    if (hasHypertension) {
      riskScore += 10;
      riskFactors.push("Hypertension");
    }
    
    // Performance factors
    const avgTime = parseFloat(calculateAverage('time'));
    if (avgTime > 120) { // If average time is over 2 minutes
      riskScore += 15;
      riskFactors.push("Prolonged puzzle completion time");
    }
    
    const consistencyVal = parseFloat(getConsistencyScore());
    if (consistencyVal !== "N/A" && consistencyVal < 60) {
      riskScore += 20;
      riskFactors.push("Poor performance consistency");
    }
    
    // Trend analysis
    if (Array.isArray(performanceTrend)) {
      const firstTime = performanceTrend[0].avgTime;
      const lastTime = performanceTrend[performanceTrend.length - 1].avgTime;
      
      if (lastTime > firstTime * 1.25) {
        riskScore += 25;
        riskFactors.push("Declining completion speed over time");
      }
    }
    
    // Determine risk level
    let riskLevel = "Low";
    if (riskScore >= 30 && riskScore < 60) {
      riskLevel = "Moderate";
    } else if (riskScore >= 60 && riskScore < 90) {
      riskLevel = "High";
    } else if (riskScore >= 90) {
      riskLevel = "Very High";
    }
    
    return {
      score: riskScore,
      level: riskLevel,
      factors: riskFactors
    };
  };

  const performanceTrend = getPerformanceTrend();
  const consistencyScore = getConsistencyScore();
  const timeOfDayPerformance = getPerformanceByTimeOfDay();
  const dementiaRisk = calculateDementiaRisk();

  const getTrendDirection = (firstVal, lastVal) => {
    if (lastVal < firstVal * 0.9) return "significant-improvement";
    if (lastVal < firstVal) return "improvement";
    if (lastVal > firstVal * 1.1) return "significant-decline";
    if (lastVal > firstVal) return "decline";
    return "stable";
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Clinical Dashboard Login</h1>
          <form onSubmit={handleLogin}>
            {loginError && <div className="login-error">{loginError}</div>}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-top">
          <h1>Clinical Dashboard</h1>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
        <div className="patient-info">
          <h2>Patient Information</h2>
          <div className="patient-details">
            <div className="patient-detail">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{patientInfo.name}</span>
            </div>
            <div className="patient-detail">
              <span className="detail-label">Patient ID:</span>
              <span className="detail-value">{patientInfo.id}</span>
            </div>
            <div className="patient-detail">
              <span className="detail-label">Age:</span>
              <span className="detail-value">{patientInfo.age}</span>
            </div>
            <div className="patient-detail">
              <span className="detail-label">Gender:</span>
              <span className="detail-value">{patientInfo.gender}</span>
            </div>
            <div className="patient-detail">
              <span className="detail-label">Primary Doctor:</span>
              <span className="detail-value">{patientInfo.primaryDoctor}</span>
            </div>
            <div className="patient-detail">
              <span className="detail-label">Assessment Start:</span>
              <span className="detail-value">{patientInfo.startDate}</span>
            </div>
            <div className="patient-detail">
              <span className="detail-label">Emergency Contact:</span>
              <span className="detail-value">{patientInfo.emergencyContact}</span>
            </div>
          </div>
        </div>
      </div>

      {metrics.length === 0 ? (
        <div className="no-metrics">
          <h2>No Data Available</h2>
          <p>No game metrics available for this patient yet.</p>
        </div>
      ) : (
        <div className="dashboard-content">
          <div className="dashboard-tabs">
            <button 
              className={`tab-button ${activeTab === 'cognitive' ? 'active' : ''}`}
              onClick={() => setActiveTab('cognitive')}
            >
              Cognitive Assessment
            </button>
            <button 
              className={`tab-button ${activeTab === 'medical' ? 'active' : ''}`}
              onClick={() => setActiveTab('medical')}
            >
              Medical History
            </button>
            <button 
              className={`tab-button ${activeTab === 'risk' ? 'active' : ''}`}
              onClick={() => setActiveTab('risk')}
            >
              Risk Assessment
            </button>
          </div>
          
          {activeTab === 'cognitive' && (
            <>
              <section className="dashboard-section summary-section">
                <h2>Performance Summary</h2>
                <div className="metrics-summary">
                  <div className="metric-card">
                    <h3>Total Sessions</h3>
                    <p className="metric-value">{metrics.length}</p>
                  </div>
                  <div className="metric-card">
                    <h3>Average Completion Time</h3>
                    <p className="metric-value">{formatTime(calculateAverage('time'))}</p>
                  </div>
                  <div className="metric-card">
                    <h3>Average Moves</h3>
                    <p className="metric-value">{calculateAverage('moves')}</p>
                  </div>
                  <div className="metric-card">
                    <h3>Consistency Score</h3>
                    <p className="metric-value">{consistencyScore}%</p>
                  </div>
                </div>
              </section>

              <section className="dashboard-section trend-section">
                <h2>Performance Trends</h2>
                {Array.isArray(performanceTrend) ? (
                  <div className="performance-trends">
                    <div className="trend-card">
                      <h3>Time Performance Trend</h3>
                      <div className="trend-chart">
                        {performanceTrend.map((quarter, index) => (
                          <div 
                            key={`time-${index}`} 
                            className="trend-bar-container"
                          >
                            <div 
                              className="trend-bar" 
                              style={{ 
                                height: `${Math.min(200, quarter.avgTime / 2)}px`,
                              }}
                            >
                              <span className="trend-value">{formatTime(quarter.avgTime)}</span>
                            </div>
                            <span className="trend-label">Q{index + 1}</span>
                          </div>
                        ))}
                      </div>
                      <p className={`trend-analysis ${getTrendDirection(performanceTrend[0].avgTime, performanceTrend[performanceTrend.length - 1].avgTime)}`}>
                        {getTrendDirection(performanceTrend[0].avgTime, performanceTrend[performanceTrend.length - 1].avgTime).replace(/-/g, ' ')}
                      </p>
                    </div>

                    <div className="trend-card">
                      <h3>Move Efficiency Trend</h3>
                      <div className="trend-chart">
                        {performanceTrend.map((quarter, index) => (
                          <div 
                            key={`moves-${index}`} 
                            className="trend-bar-container"
                          >
                            <div 
                              className="trend-bar" 
                              style={{ 
                                height: `${Math.min(200, quarter.avgMoves * 5)}px` 
                              }}
                            >
                              <span className="trend-value">{quarter.avgMoves.toFixed(1)}</span>
                            </div>
                            <span className="trend-label">Q{index + 1}</span>
                          </div>
                        ))}
                      </div>
                      <p className={`trend-analysis ${getTrendDirection(performanceTrend[0].avgMoves, performanceTrend[performanceTrend.length - 1].avgMoves)}`}>
                        {getTrendDirection(performanceTrend[0].avgMoves, performanceTrend[performanceTrend.length - 1].avgMoves).replace(/-/g, ' ')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="insufficient-data">{performanceTrend}</p>
                )}
              </section>

              {timeOfDayPerformance && (
                <section className="dashboard-section time-of-day-section">
                  <h2>Performance by Time of Day</h2>
                  <div className="time-of-day-grid">
                    {Object.entries(timeOfDayPerformance).map(([period, data]) => (
                      <div key={period} className="time-period-card">
                        <h3>{period.charAt(0).toUpperCase() + period.slice(1)}</h3>
                        <p>Games played: {data.games.length}</p>
                        {data.games.length > 0 ? (
                          <>
                            <p>Avg. time: {formatTime(data.avgTime)}</p>
                            <p>Avg. moves: {data.avgMoves.toFixed(1)}</p>
                          </>
                        ) : (
                          <p className="no-data">No data available</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="dashboard-section history-section">
                <h2>Detailed Game History</h2>
                <div className="metrics-history">
                  <table className="metrics-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Time of Day</th>
                        <th>Moves</th>
                        <th>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((metric, index) => {
                        const date = new Date(metric.date);
                        const avgTime = parseFloat(calculateAverage('time'));
                        const avgMoves = parseFloat(calculateAverage('moves'));
                        let performance = 'average';
                        
                        if (metric.time < avgTime * 0.85 && metric.moves < avgMoves * 0.85) {
                          performance = 'excellent';
                        } else if (metric.time < avgTime * 0.9 && metric.moves < avgMoves * 0.9) {
                          performance = 'good';
                        } else if (metric.time > avgTime * 1.15 && metric.moves > avgMoves * 1.15) {
                          performance = 'poor';
                        } else if (metric.time > avgTime * 1.1 && metric.moves > avgMoves * 1.1) {
                          performance = 'below-average';
                        }
                        
                        return (
                          <tr key={index} className={performance}>
                            <td>{formatDate(metric.date)}</td>
                            <td>{formatTime(metric.time)}</td>
                            <td>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>{metric.moves}</td>
                            <td className={`performance ${performance}`}>
                              {performance.replace('-', ' ')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
          
          {activeTab === 'medical' && (
            <section className="dashboard-section medical-history-section">
              <h2>Medical History</h2>
              
              <div className="medical-subsection">
                <h3>Diagnosed Conditions</h3>
                <table className="medical-table">
                  <thead>
                    <tr>
                      <th>Condition</th>
                      <th>Diagnosed Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalHistory.conditions.map((condition, index) => (
                      <tr key={index}>
                        <td>{condition.condition}</td>
                        <td>{formatDate(condition.diagnosedDate)}</td>
                        <td>{condition.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="medical-subsection">
                <h3>Current Medications</h3>
                <table className="medical-table">
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Start Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalHistory.medications.map((medication, index) => (
                      <tr key={index}>
                        <td>{medication.name}</td>
                        <td>{medication.dosage}</td>
                        <td>{medication.frequency}</td>
                        <td>{formatDate(medication.startDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="medical-subsection">
                <h3>Family History</h3>
                <table className="medical-table">
                  <thead>
                    <tr>
                      <th>Relationship</th>
                      <th>Condition</th>
                      <th>Age of Onset</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalHistory.familyHistory.map((history, index) => (
                      <tr key={index}>
                        <td>{history.relationship}</td>
                        <td>{history.condition}</td>
                        <td>{history.onsetAge}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="medical-subsection">
                <h3>Allergies</h3>
                <div className="allergies-list">
                  {medicalHistory.allergies.length > 0 ? (
                    medicalHistory.allergies.map((allergy, index) => (
                      <span key={index} className="allergy-tag">{allergy}</span>
                    ))
                  ) : (
                    <p>No known allergies</p>
                  )}
                </div>
              </div>
            </section>
          )}
          
          {activeTab === 'risk' && (
            <section className="dashboard-section risk-assessment-section">
              <h2>Dementia Risk Assessment</h2>
              
              <div className="risk-overview">
                <div className={`risk-indicator ${dementiaRisk.level.toLowerCase().replace(' ', '-')}`}>
                  <h3>Risk Level</h3>
                  <p className="risk-level">{dementiaRisk.level}</p>
                  {typeof dementiaRisk.score === 'number' && (
                    <div className="risk-score-container">
                      <div className="risk-score-bar">
                        <div 
                          className="risk-score-fill" 
                          style={{ width: `${Math.min(100, dementiaRisk.score)}%` }}
                        ></div>
                      </div>
                      <p className="risk-score-value">Score: {dementiaRisk.score}/100</p>
                    </div>
                  )}
                </div>
                
                <div className="risk-summary">
                  <h3>Assessment Summary</h3>
                  <p>This risk assessment is based on a combination of cognitive performance metrics, medical history, and established risk factors for dementia.</p>
                  {typeof dementiaRisk.score !== 'number' && (
                    <p className="insufficient-data">{dementiaRisk.score}</p>
                  )}
                </div>
              </div>
              
              {dementiaRisk.factors.length > 0 && (
                <div className="risk-factors">
                  <h3>Identified Risk Factors</h3>
                  <ul className="factors-list">
                    {dementiaRisk.factors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="risk-recommendations">
                <h3>Recommendations</h3>
                {dementiaRisk.level === "Low" && (
                  <ul>
                    <li>Continue regular cognitive assessments every 6 months</li>
                    <li>Maintain physical activity levels and cognitive engagement</li>
                    <li>Follow a healthy diet rich in omega-3 fatty acids and antioxidants</li>
                  </ul>
                )}
                {dementiaRisk.level === "Moderate" && (
                  <ul>
                    <li>Increase cognitive assessment frequency to every 3 months</li>
                    <li>Consider additional neuropsychological testing</li>
                    <li>Optimize management of existing medical conditions, especially cardiovascular factors</li>
                    <li>Encourage social engagement and cognitively stimulating activities</li>
                  </ul>
                )}
                {dementiaRisk.level === "High" || dementiaRisk.level === "Very High" && (
                  <ul>
                    <li>Schedule comprehensive neurological evaluation</li>
                    <li>Monthly cognitive assessments to track progression</li>
                    <li>MRI brain imaging may be indicated</li>
                    <li>Consider memory clinic referral for specialized evaluation</li>
                    <li>Discuss care planning and support resources with patient and family</li>
                  </ul>
                )}
                {dementiaRisk.level === "unknown" && (
                  <p>Insufficient data to provide recommendations. Continue assessments to establish baseline.</p>
                )}
              </div>
            </section>
          )}

          <section className="dashboard-section notes-section">
            <h2>Clinical Notes</h2>
            <div className="clinical-notes">
              <textarea 
                placeholder="Enter clinical notes about patient performance here..."
                rows="4"
              ></textarea>
              <button className="save-notes-button">Save Notes</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 