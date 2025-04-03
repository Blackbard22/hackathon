import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavFooter from './NavFooter';
import './Settings.css';

function Settings() {
  const [userProfile, setUserProfile] = useState({
    name: '',
    age: '',
    gender: ''
  });

  const navigate = useNavigate();

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <div className="content-area">
        <div className="settings-container">
          <h1>Settings</h1>

          <div className="settings-grid">
            {/* User Profile Section */}
            <div className="settings-section profile-section">
              <div className="profile-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" />
                </svg>
              </div>
              <div className="profile-fields">
                <div className="input-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={userProfile.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="age">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={userProfile.age}
                    onChange={handleProfileChange}
                    placeholder="Enter your age"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={userProfile.gender}
                    onChange={handleProfileChange}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Personalization Section */}
            <div className="settings-section personalization-section">
              <h2>Personalization</h2>
              <div className="settings-options">
                <div className="option-group">
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                  <span>Dark Mode</span>
                </div>
                <div className="option-group">
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                  <span>High Contrast</span>
                </div>
                <div className="option-group">
                  <label>Text Size</label>
                  <input type="range" min="12" max="24" defaultValue="16" />
                </div>
              </div>
            </div>

            {/* Accessibility Section */}
            <div className="settings-section accessibility-section">
              <h2>Accessibility</h2>
              <div className="settings-options">
                <div className="option-group">
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                  <span>Screen Reader Support</span>
                </div>
                <div className="option-group">
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                  <span>Motion Reduction</span>
                </div>
                <div className="option-group">
                  <label>Voice Control</label>
                  <select>
                    <option value="off">Off</option>
                    <option value="basic">Basic</option>
                    <option value="full">Full Control</option>
                  </select>
                </div>
              </div>
            </div>

            {/* NHS Connection Section */}
            <div className="settings-section nhs-section">
              <h2>Connect to the NHS</h2>
              <div className="nhs-connection">
                <p>Link your NHS account to sync your health data and receive personalized recommendations.</p>
                <button className="nhs-connect-button">
                  Connect NHS Account
                </button>
                <div className="nhs-status">
                  <span className="status-indicator"></span>
                  Not Connected
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NavFooter activePage="settings" />
    </>
  );
}

export default Settings; 