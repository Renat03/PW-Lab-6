import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function ExerciseAnalytics({ workouts, darkMode: appDarkMode }) { 
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [selectedWeight, setSelectedWeight] = useState('');
  const [sortBy, setSortBy] = useState('reps');
  const [sortDescending, setSortDescending] = useState(true);
  const [minReps, setMinReps] = useState('');
  const [maxReps, setMaxReps] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showProgression, setShowProgression] = useState(false);
  const [progressionMode, setProgressionMode] = useState('repsForWeight');


  const capitalizeWords = str => str.replace(/\b\w/g, c => c.toUpperCase()).trim();

  const categoryMap = useMemo(() => {
    const map = {};
    workouts.forEach(w => {
      w.exercises?.forEach(e => {
        const cat = capitalizeWords(e.category || 'Uncategorized');
        const name = capitalizeWords(e.name);
        if (!map[cat]) map[cat] = new Set();
        map[cat].add(name);
      });
    });
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, Array.from(v)]));
  }, [workouts]);

  const filteredSets = useMemo(() => {
    if (!selectedExercise) return [];

    return workouts.flatMap(w => {
      const date = new Date(w.date);
      if (startDate && date < new Date(startDate)) return [];
      if (endDate && date > new Date(endDate)) return [];

      return w.exercises
        .filter(e => capitalizeWords(e.name) === selectedExercise)
        .flatMap(e =>
          e.sets
            .filter(s => {
              if (selectedWeight && s.weight !== Number(selectedWeight)) return false;
              if (minReps && s.reps < Number(minReps)) return false;
              if (maxReps && s.reps > Number(maxReps)) return false;
              return true;
            })
            .map(s => ({
              date: w.date,
              reps: s.reps,
              weight: s.weight,
            }))
        );
    }).sort((a, b) => {
      if (sortBy === 'date') return sortDescending ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date);
      return sortDescending ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy];
    });
  }, [workouts, selectedExercise, selectedWeight, minReps, maxReps, startDate, endDate, sortBy, sortDescending]);

  const progressionData = useMemo(() => {
    if (!selectedExercise) return [];

    return workouts
      .map(w => {
        const dateObj = new Date(w.date);
        if (startDate && dateObj < new Date(startDate)) return null;
        if (endDate && dateObj > new Date(endDate)) return null;

        const ex = w.exercises.find(e => capitalizeWords(e.name) === selectedExercise);
        if (!ex) return null;

        let targetValue = null;

        if (progressionMode === 'repsForWeight' && selectedWeight) {
          const matching = ex.sets.filter(s => s.weight === Number(selectedWeight));
          if (matching.length > 0) {
            targetValue = Math.max(...matching.map(s => s.reps));
          }
        } else if (progressionMode === 'weightForReps' && minReps) {
          const matching = ex.sets.filter(s => s.reps === Number(minReps));
          if (matching.length > 0) {
            targetValue = Math.max(...matching.map(s => s.weight));
          }
        }

        return targetValue !== null ? { date: w.date, value: targetValue } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [workouts, selectedExercise, selectedWeight, minReps, progressionMode, startDate, endDate]);
  
  return (
    <div className={`exercise-analytics ${appDarkMode ? 'dark' : 'light'}`}>
      <div className="header">
        <div className="title-container">
          <h1>Exercise Analytics</h1>
          <p className="subtitle">Track your workout progress</p>
        </div>
        {/* The theme toggle button is in App.jsx, not here */}
      </div>

      <div className="control-panel glass-card">
        <div className="form-group">
          <label>
            Category
            <select 
              className="styled-select"
              value={selectedCategory} 
              onChange={e => {
                setSelectedCategory(e.target.value);
                setSelectedExercise('');
              }}
            >
              <option value="">-- Choose Category --</option>
              {Object.keys(categoryMap).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
        </div>

        {selectedCategory && (
          <div className="form-group">
            <label>
              Exercise
              <select 
                className="styled-select"
                value={selectedExercise} 
                onChange={e => setSelectedExercise(e.target.value)}
              >
                <option value="">-- Choose Exercise --</option>
                {categoryMap[selectedCategory].map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      {selectedExercise && (
  <div className="filters-panel glass-card">
    <h3 className="panel-title">Filters</h3>
    
    <div className="filter-grid" style={{ gap: '1rem' }}> 
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Weight (kg)</label>
        <input 
          type="number" 
          className="styled-input"
          value={selectedWeight} 
          onChange={e => setSelectedWeight(e.target.value)}
          placeholder="Any"
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}> 
        <label>Reps Range</label>
        <div className="range-group" style={{ gap: '0.5rem' }}> 
          <input
            type="number"
            className="styled-input range-input"
            placeholder="Min"
            value={minReps}
            onChange={e => setMinReps(e.target.value)}
          />
          <span className="range-separator">to</span>
          <input
            type="number"
            className="styled-input range-input"
            placeholder="Max"
            value={maxReps}
            onChange={e => setMaxReps(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}> 
        <label>Date Range</label>
        <div className="range-group" style={{ gap: '0.5rem' }}> 
          <input 
            type="date" 
            className="styled-input date-input"
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
          />
          <span className="range-separator">to</span>
          <input 
            type="date" 
            className="styled-input date-input"
            value={endDate} 
            onChange={e => setEndDate(e.target.value)} 
          />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}> 
        <label>Sort By</label>
        <div className="sort-controls" style={{ gap: '0.75rem' }}> 
          <select 
            className="styled-select"
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="reps">Reps</option>
            <option value="weight">Weight</option>
            <option value="date">Date</option>
          </select>
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={sortDescending}
              onChange={() => setSortDescending(prev => !prev)}
            />
            <span className="checkmark"></span>
            Descending
          </label>
        </div>
      </div>
    </div>

    <button 
      className={`toggle-button ${showProgression ? 'active' : ''}`}
      onClick={() => setShowProgression(prev => !prev)}
      style={{ marginTop: '1.5rem' }}> 
      {showProgression ? 'Hide Progression Chart' : 'Show Progression Chart'}
    </button>

    {showProgression && (
      <div className="chart-container" style={{ marginTop: '1.5rem' }}> 
        <div className="form-group">
          <label>Progression Mode</label>
          <select 
            className="styled-select"
            value={progressionMode} 
            onChange={e => setProgressionMode(e.target.value)}
          >
            <option value="repsForWeight">Max Reps @ Fixed Weight</option>
            <option value="weightForReps">Max Weight @ Fixed Reps</option>
          </select>
        </div>

        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressionData}>
              {/* Use appDarkMode prop for chart elements */}
              <CartesianGrid strokeDasharray="3 3" stroke={appDarkMode ? '#444' : '#eee'} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: appDarkMode ? '#ccc' : '#666' }}
              />
              <YAxis 
                tick={{ fill: appDarkMode ? '#ccc' : '#666' }}
              />
              <Tooltip 
                contentStyle={{
                  background: appDarkMode ? '#2a2a2a' : '#fff',
                  border: appDarkMode ? '1px solid #444' : '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6ee7b7"
                strokeWidth={3}
                dot={{ fill: '#6ee7b7', r: 5 }}
                activeDot={{ r: 8, stroke: '#6ee7b7', strokeWidth: 2 }}
                name={progressionMode === 'repsForWeight' ? 'Reps' : 'Weight (kg)'}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )}
  </div>
)}

      {filteredSets.length > 0 && (
        <div className="results-panel glass-card">
          <div className="panel-header">
            <h3>Filtered Sets</h3>
            <span className="results-count">{filteredSets.length} sets</span>
          </div>
          <div className="sets-grid">
            {filteredSets.map((s, idx) => (
              <div key={idx} className="set-card">
                <div className="set-date">{new Date(s.date).toLocaleDateString()}</div>
                <div className="set-details">
                  <span className="set-reps">{s.reps} reps</span>
                  <span className="set-separator">@</span>
                  <span className="set-weight">{s.weight} kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .exercise-analytics {
          --primary: #6ee7b7;
          --primary-dark: #10b981;
          --text: #1f2937;
          --text-light: #6b7280;
          --bg: #f9fafb;
          --card-bg: #ffffff;
          --border: #e5e7eb;
          --shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          --glass: rgba(255, 255, 255, 0.8);
          padding: 2rem;
          min-height: 100vh;
          transition: all 0.3s ease;
        }

        .exercise-analytics.dark {
          --primary: #6ee7b7;
          --primary-dark: #10b981;
          --text: #f3f4f6;
          --text-light: #9ca3af;
          --bg: #111827;
          --card-bg: #1f2937;
          --border: #374151;
          --shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
          --glass: rgba(31, 41, 55, 0.8);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .title-container h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(90deg, var(--primary), var(--primary-dark));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .subtitle {
          color: var(--text-light);
          margin-top: 0.5rem;
          font-size: 1.1rem;
        }

        /* REMOVED: This style is not needed here as the toggle is in App.jsx
        .theme-toggle {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .theme-toggle:hover {
           background: ${appDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}; // This would also need to use appDarkMode if kept
        }
        */

        .glass-card {
          background: var(--glass);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
        }

        .panel-title {
          color: var(--text);
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text);
          font-weight: 500;
          font-size: 0.95rem;
        }

        .styled-select, .styled-input {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--card-bg);
          color: var(--text);
          font-size: 1rem;
          transition: all 0.2s;
        }

        .styled-select:focus, .styled-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(110, 231, 183, 0.2);
        }

        .range-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .range-input {
          flex: 1;
        }

        .date-input {
          flex: 1;
        }

        .range-separator {
          color: var(--text-light);
          font-size: 0.9rem;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-light);
        }

        .checkbox-container input {
          opacity: 0;
          position: absolute;
        }

        .checkmark {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid var(--border);
          border-radius: 4px;
          position: relative;
        }

        .checkbox-container input:checked ~ .checkmark {
          background-color: var(--primary);
          border-color: var(--primary);
        }

        .checkbox-container input:checked ~ .checkmark::after {
          content: '';
          position: absolute;
          left: 5px;
          top: 1px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .toggle-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background: var(--card-bg);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }

        .toggle-button:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .toggle-button.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .chart-container {
          margin-top: 2rem;
        }

        .chart-wrapper {
          margin-top: 1rem;
          border-radius: 8px;
          overflow: hidden;
        }

        .results-panel {
          margin-top: 2rem;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .results-count {
          color: var(--text-light);
          font-size: 0.9rem;
        }

        .sets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .set-card {
          background: var(--card-bg);
          border-radius: 8px;
          padding: 1rem;
          border-left: 4px solid var(--primary);
          box-shadow: var(--shadow);
        }

        .set-date {
          font-size: 0.8rem;
          color: var(--text-light);
          margin-bottom: 0.5rem;
        }

        .set-details {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .set-reps {
          color: var(--primary);
        }

        .set-weight {
          color: var(--primary-dark);
        }

        .set-separator {
          color: var(--text-light);
        }

        @media (max-width: 768px) {
          .exercise-analytics {
            padding: 1rem;
          }
          
          .filter-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}