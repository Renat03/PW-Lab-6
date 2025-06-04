import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function WorkoutList({ workouts, setWorkouts, darkMode }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  function addWorkout() {
    if (!name || !date) return alert('Please enter both name and date');
    const newWorkout = {
      id: uuidv4(),
      name,
      date,
      startTime: startTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: endTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rating: rating ? Number(rating) : null,
      comment: comment || '',
      exercises: [],
    };
    setWorkouts([...workouts, newWorkout]);
    setName('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setRating('');
    setComment('');
  }

  function removeWorkout(id) {
    if (!confirm('Remove this workout?')) return;
    setWorkouts(workouts.filter(w => w.id !== id));
  }

  return (
    <div className={`workout-list ${darkMode ? 'dark' : 'light'}`}>
      <div className="header">
        <div className="title-container">
          <h1>Workout Log</h1>
          <p className="subtitle">Track and manage your training sessions</p>
        </div>
      </div>

      <div className="add-workout glass-card">
        <h3 className="panel-title">Add New Workout</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              className="styled-input"
              value={date} 
              onChange={e => setDate(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Workout Name</label>
            <input 
              type="text" 
              className="styled-input"
              placeholder="e.g. Leg Day" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Start Time</label>
            <input 
              type="time" 
              className="styled-input"
              value={startTime} 
              onChange={e => setStartTime(e.target.value)} 
              placeholder="Start Time" 
            />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input 
              type="time" 
              className="styled-input"
              value={endTime} 
              onChange={e => setEndTime(e.target.value)} 
              placeholder="End Time" 
            />
          </div>
          <div className="form-group">
            <label>Rating (1-10)</label>
            <input 
              type="number" 
              className="styled-input"
              value={rating} 
              onChange={e => setRating(e.target.value)} 
              placeholder="1-10" 
              min="1" 
              max="10" 
            />
          </div>
          <div className="form-group">
            <label>Comment</label>
            <input 
              type="text" 
              className="styled-input"
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              placeholder="Optional notes" 
            />
          </div>
        </div>
        <button className="add-button" onClick={addWorkout}>
          + Add Workout
        </button>
      </div>

      <div className="workouts-container glass-card">
        <h3 className="panel-title">Your Workouts</h3>
        {workouts.length === 0 ? (
          <div className="empty-state">
            <p>No workouts yet. Add your first workout above!</p>
          </div>
        ) : (
          <div className="workouts-grid">
            {workouts.map(w => (
              <div key={w.id} className="workout-card">
                <Link to={`/workout/${w.id}`} className="workout-link">
                  <div className="workout-header">
                    <span className="workout-date">{new Date(w.date).toLocaleDateString()}</span>
                    {w.rating && (
                      <span className="workout-rating">
                        {Array.from({ length: w.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </span>
                    )}
                  </div>
                  <h4 className="workout-name">{w.name}</h4>
                  <div className="workout-meta">
                    <span className="workout-time">
                      {w.startTime} - {w.endTime}
                    </span>
                    <span className="workout-exercises">
                      {w.exercises?.length || 0} exercises
                    </span>
                  </div>
                  {w.comment && (
                    <p className="workout-comment">{w.comment}</p>
                  )}
                </Link>
                <button 
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWorkout(w.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .workout-list {
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

        .workout-list.dark {
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

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text);
          font-weight: 500;
          font-size: 0.95rem;
        }

        .styled-input {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--card-bg);
          color: var(--text);
          font-size: 1rem;
          transition: all 0.2s;
        }

        .styled-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(110, 231, 183, 0.2);
        }

        .add-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
        }

        .add-button:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        .workouts-container {
          margin-top: 2rem;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--text-light);
        }

        .workouts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .workout-card {
          position: relative;
          background: var(--card-bg);
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: var(--shadow);
          border-left: 4px solid var(--primary);
          transition: all 0.2s;
        }

        .workout-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }

        .workout-link {
          text-decoration: none;
          color: inherit;
        }

        .workout-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .workout-date {
          font-size: 0.9rem;
          color: var(--text-light);
        }

        .workout-rating {
          color: #fbbf24;
          font-size: 0.9rem;
        }

        .workout-name {
          margin: 0 0 0.75rem 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text);
        }

        .workout-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-light);
          margin-bottom: 0.5rem;
        }

        .workout-comment {
          margin: 0.5rem 0 0 0;
          font-size: 0.9rem;
          color: var(--text-light);
          font-style: italic;
        }

        .delete-button {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: none;
          border: none;
          color: var(--text-light);
          font-size: 1.2rem;
          cursor: pointer;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .delete-button:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        @media (max-width: 768px) {
          .workout-list {
            padding: 1rem;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .workouts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}