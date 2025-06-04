import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WorkoutList from './pages/WorkoutList.jsx';
import WorkoutDetail from './pages/WorkoutDetail.jsx';
import ExerciseAnalytics from './pages/ExerciseAnalytics.jsx';

export default function App() {
  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem('workouts');
    return saved ? JSON.parse(saved) : [];
  });
  const [darkMode, setDarkMode] = useState(() => {
    // Ensure localStorage value is explicitly 'true' for dark mode
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    // Apply the theme to the html element
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <Router>
      <nav className="app-nav">
        <div className="nav-content">
          <div className="nav-links">
            <Link to="/" className="nav-link">Workouts</Link>
            <Link to="/analytics" className="nav-link">Analytics</Link>
          </div>
          <button
            className={`theme-toggle ${darkMode ? 'dark-mode' : 'light-mode'}`}
            onClick={() => setDarkMode(!darkMode)}
            aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            <span className="toggle-icon-container">
              <span className="icon sun-icon">☀️</span>
              <span className="icon moon-icon">🌙</span>
            </span>
          </button>
        </div>
      </nav>

      <main className="app-container">
        <Routes>
          <Route path="/" element={<WorkoutList workouts={workouts} setWorkouts={setWorkouts} darkMode={darkMode} />} />
          <Route path="/workout/:id" element={<WorkoutDetail workouts={workouts} setWorkouts={setWorkouts} darkMode={darkMode} />} />
          <Route path="/analytics" element={<ExerciseAnalytics workouts={workouts} darkMode={darkMode} />} />
        </Routes>
      </main>

      {/*
        NOTE: In Next.js <style jsx global> is preferred.
        For standard React with Create React App, you'd put these global styles
        in a separate App.css or index.css file and import it.
        Since the original code used <style jsx>, I'll adapt it.
        The key is defining CSS variables and applying them.
      */}
      <style jsx global>{`
        :root {
          --bg: #f9fafb;
          --text: #1f2937;
          --primary: #6ee7b7; /* A nice minty green */
          --primary-dark: #10b981;
          --border: #e5e7eb;
          --card-bg: #ffffff;
          --nav-bg: var(--card-bg); /* Use card-bg for nav initially */
          --nav-text: var(--text);
          --nav-link-text: var(--text-light);
          --icon-color-sun: #facc15; /* Yellow for sun */
          --icon-color-moon: #93c5fd; /* Light blue for moon */
          --toggle-bg: #e5e7eb;
          --toggle-hover-bg: #d1d5db;
          --text-light: #6b7280;
          --shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
          --glass-light: rgba(255, 255, 255, 0.7);
          --glass-dark: rgba(31, 41, 55, 0.6);
        }

        html.dark {
          --bg: #111827; /* Dark gray */
          --text: #f3f4f6; /* Light gray for text */
          --border: #374151; /* Darker border */
          --card-bg: #1f2937; /* Darker card background */
          --nav-bg: var(--card-bg);
          --nav-text: var(--text);
          --nav-link-text: #9ca3af; /* Lighter gray for inactive links */
          --toggle-bg: #374151;
          --toggle-hover-bg: #4b5563;
          --text-light: #9ca3af;
          --shadow: 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
        }

        body {
          background-color: var(--bg);
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          margin: 0;
          padding: 0;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .app-nav {
          background-color: var(--nav-bg);
          color: var(--nav-text);
          padding: 0.75rem 2rem; /* Reduced padding a bit */
          border-bottom: 1px solid var(--border);
          box-shadow: var(--shadow);
          position: sticky;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(10px); /* Glassmorphism for nav */
          background-color: var(--bg) == #111827 ? var(--glass-dark) : var(--glass-light);
        }
        html.dark .app-nav {
            background-color: var(--glass-dark);
        }
        html.light .app-nav {
            background-color: var(--glass-light);
        }


        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .nav-links {
          display: flex;
          gap: 1.5rem; /* Increased gap */
        }

        .nav-link {
          color: var(--nav-link-text);
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 0;
          position: relative;
          transition: color 0.3s ease;
        }

        .nav-link:hover {
          color: var(--primary);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--primary);
          transition: width 0.3s ease;
        }

        .nav-link:hover::after {
          width: 100%;
        }
        
        .theme-toggle {
          background-color: var(--toggle-bg);
          border: none;
          border-radius: 20px; /* Pill shape */
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-around; /* For icon positioning */
          width: 50px; /* Fixed width for the pill */
          height: 26px; /* Fixed height for the pill */
          padding: 3px;
          position: relative;
          outline: none;
          transition: background-color 0.3s ease;
        }

        .theme-toggle:hover {
          background-color: var(--toggle-hover-bg);
        }

        .toggle-icon-container {
          display: flex;
          position: relative;
          width: 100%;
          height: 100%;
          align-items: center;
        }

        .theme-toggle .icon {
          font-size: 0.9rem; /* Slightly smaller icons */
          line-height: 1;
          position: absolute;
          transition: transform 0.3s ease, opacity 0.3s ease;
          display: flex; /* For centering if needed */
          align-items: center; /* For centering if needed */
          justify-content: center; /* For centering if needed */
        }

        .theme-toggle .sun-icon {
          color: var(--icon-color-sun);
          transform: translateX(0%) scale(1); /* Start position for sun */
          opacity: 1;
        }

        .theme-toggle .moon-icon {
          color: var(--icon-color-moon);
          transform: translateX(100%) scale(0); /* Start position for moon (off-screen right, scaled down) */
          opacity: 0;
        }

        /* Dark mode active: sun moves out, moon moves in */
        .theme-toggle.dark-mode .sun-icon {
          transform: translateX(-100%) scale(0);
          opacity: 0;
        }

        .theme-toggle.dark-mode .moon-icon {
          transform: translateX(0%) scale(1);
          opacity: 1;
        }
        
        /* To position the icons within the toggle button based on light/dark mode */
        /* Sun is on the left in light mode, Moon is on the right in dark mode */
        .theme-toggle.light-mode .sun-icon {
            left: 4px; /* Adjust as needed for padding */
        }
        .theme-toggle.light-mode .moon-icon {
            right: 4px; /* Adjust as needed */
            transform: translateX(100%) scale(0); /* Ensure it's hidden */
            opacity: 0;
        }
        .theme-toggle.dark-mode .moon-icon {
            right: 4px; /* Adjust as needed */
        }
        .theme-toggle.dark-mode .sun-icon {
            left: 4px; /* Adjust as needed */
            transform: translateX(-100%) scale(0); /* Ensure it's hidden */
            opacity: 0;
        }


        .app-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 2rem auto; /* Add some margin from the nav */
        }

        /* General Card Styling (can be used by other components if they use .glass-card) */
        .glass-card {
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
        }
        html.light .glass-card {
          background: var(--glass-light);
        }
        html.dark .glass-card {
          background: var(--glass-dark);
        }

        /* Ensure ExerciseAnalytics uses these variables if it doesn't define its own for .dark */
        .exercise-analytics {
          /* ... its specific styles ... */
          background-color: var(--bg); /* Ensures it follows theme */
        }
        .exercise-analytics.dark {
          /* All variables are already handled by html.dark */
        }
        .exercise-analytics.light {
          /* All variables are already handled by :root (default light) */
        }

      `}</style>
    </Router>
  );
}