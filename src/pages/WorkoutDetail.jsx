import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const categories = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs'];

export default function WorkoutDetail({ workouts, setWorkouts, darkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const workout = workouts.find(w => w.id === id);
  if (!workout) {
    return (
      <div className={`not-found ${darkMode ? 'dark' : 'light'}`}>
        <p>Workout not found.</p>
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Workouts
        </button>
      </div>
    );
  }

  const [exerciseName, setExerciseName] = useState('');
  const [exerciseCategory, setExerciseCategory] = useState(categories[0]);
  const [setReps, setSetReps] = useState('');
  const [setWeight, setSetWeight] = useState('');

  function addExercise() {
    if (!exerciseName) return alert('Enter exercise name');
    if (workout.exercises.find(e => e.name === exerciseName)) return alert('Exercise already exists');
    const newExercise = { id: uuidv4(), name: exerciseName, category: exerciseCategory, sets: [] };
    const newWorkouts = workouts.map(w =>
      w.id === id ? { ...w, exercises: [...w.exercises, newExercise] } : w
    );
    setWorkouts(newWorkouts);
    setExerciseName('');
  }

  function addSet(exerciseId) {
    if (!setReps || !setWeight) return alert('Enter reps and weight');
    const newWorkouts = workouts.map(w => {
      if (w.id !== id) return w;
      return {
        ...w,
        exercises: w.exercises.map(e => {
          if (e.id !== exerciseId) return e;
          return {
            ...e,
            sets: [...e.sets, { id: uuidv4(), reps: Number(setReps), weight: Number(setWeight) }]
          };
        })
      };
    });
    setWorkouts(newWorkouts);
    setSetReps('');
    setSetWeight('');
  }

  function removeExercise(exerciseId) {
    if (!confirm('Remove this exercise?')) return;
    const newWorkouts = workouts.map(w =>
      w.id === id ? { ...w, exercises: w.exercises.filter(e => e.id !== exerciseId) } : w
    );
    setWorkouts(newWorkouts);
  }

  function removeSet(exerciseId, setId) {
    if (!confirm('Remove this set?')) return;
    const newWorkouts = workouts.map(w => {
      if (w.id !== id) return w;
      return {
        ...w,
        exercises: w.exercises.map(e => {
          if (e.id !== exerciseId) return e;
          return { ...e, sets: e.sets.filter(s => s.id !== setId) };
        })
      };
    });
    setWorkouts(newWorkouts);
  }

  const totalSets = workout.exercises.reduce((sum, e) => sum + e.sets.length, 0);

  function calculateDuration(start, end) {
    if (!start || !end) return '-';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startDate = new Date(0, 0, 0, sh, sm);
    const endDate = new Date(0, 0, 0, eh, em);
    const diffMs = endDate - startDate;
    if (diffMs < 0) return '-';
    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins} min`;
  }

  return (
    <div className={`workout-detail ${darkMode ? 'dark' : 'light'}`}>
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="workout-header glass-card">
        <div className="header-content">
          <h1>{workout.name}</h1>
          <p className="workout-date">{new Date(workout.date).toLocaleDateString()}</p>
          {workout.rating != null && (
            <div className="workout-rating">
              {Array.from({ length: workout.rating }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
          )}
        </div>

        <div className="workout-meta">
          <div className="meta-item">
            <span className="meta-label">Start</span>
            <span className="meta-value">{workout.startTime || '-'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">End</span>
            <span className="meta-value">{workout.endTime || '-'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Duration</span>
            <span className="meta-value">{calculateDuration(workout.startTime, workout.endTime)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Total Sets</span>
            <span className="meta-value">{totalSets}</span>
          </div>
        </div>

        {workout.comment && (
          <div className="workout-comment">
            <p>{workout.comment}</p>
          </div>
        )}
      </div>

      <div className="add-exercise glass-card">
        <h3 className="panel-title">Add Exercise</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Exercise Name</label>
            <input
              type="text"
              className="styled-input"
              placeholder="e.g. Bench Press"
              value={exerciseName}
              onChange={e => setExerciseName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              className="styled-select"
              value={exerciseCategory}
              onChange={e => setExerciseCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button className="add-button" onClick={addExercise}>
            + Add Exercise
          </button>
        </div>
      </div>

      <div className="exercises-container">
        <h3 className="panel-title">Exercises ({workout.exercises.length})</h3>
        
        {workout.exercises.length === 0 ? (
          <div className="empty-state">
            <p>No exercises added yet. Add your first exercise above!</p>
          </div>
        ) : (
          workout.exercises.map(e => (
            <div key={e.id} className="exercise-card glass-card">
              <div className="exercise-header">
                <h4>
                  {e.name}
                  <span className="exercise-category">{e.category}</span>
                </h4>
                <button
                  className="delete-button"
                  onClick={() => removeExercise(e.id)}
                >
                  ×
                </button>
              </div>

              <div className="add-set-form">
                <h5>Add Set</h5>
                <div className="form-row">
                  <div className="form-group">
                    <label>Reps</label>
                    <input
                      type="number"
                      className="styled-input"
                      placeholder="8"
                      value={setReps}
                      onChange={e => setSetReps(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Weight (kg)</label>
                    <input
                      type="number"
                      className="styled-input"
                      placeholder="50"
                      value={setWeight}
                      onChange={e => setSetWeight(e.target.value)}
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <button
                    className="add-set-button"
                    onClick={() => addSet(e.id)}
                  >
                    + Add Set
                  </button>
                </div>
              </div>

              <div className="sets-list">
                <h5>Sets ({e.sets.length})</h5>
                {e.sets.length === 0 ? (
                  <p className="no-sets">No sets added yet</p>
                ) : (
                  <div className="sets-grid">
                    {e.sets.map(s => (
                      <div key={s.id} className="set-card">
                        <div className="set-details">
                          <span className="set-reps">{s.reps}</span>
                          <span className="set-separator">×</span>
                          <span className="set-weight">{s.weight} kg</span>
                        </div>
                        <button
                          className="delete-set-button"
                          onClick={() => removeSet(e.id, s.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .workout-detail {
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

        .workout-detail.dark {
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

        .back-button {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 1rem;
          padding: 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .back-button:hover {
          color: var(--primary-dark);
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

        .workout-header {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .header-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .workout-header h1 {
          font-size: 2rem;
          margin: 0;
          color: var(--text);
        }

        .workout-date {
          color: var(--text-light);
          font-size: 0.9rem;
        }

        .workout-rating {
          color: #fbbf24;
          font-size: 1rem;
        }

        .workout-meta {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1.5rem;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .meta-label {
          font-size: 0.8rem;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .meta-value {
          font-size: 1rem;
          font-weight: 500;
          color: var(--text);
        }

        .workout-comment {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
          color: var(--text-light);
          font-style: italic;
        }

        .panel-title {
          color: var(--text);
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .form-row {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .form-group {
          flex: 1;
          min-width: 150px;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text);
          font-weight: 500;
          font-size: 0.95rem;
        }

        .styled-input, .styled-select {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--card-bg);
          color: var(--text);
          font-size: 1rem;
          transition: all 0.2s;
        }

        .styled-input:focus, .styled-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(110, 231, 183, 0.2);
        }

        .add-button, .add-set-button {
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
          height: fit-content;
          margin-bottom: 0.5rem;
        }

        .add-button:hover, .add-set-button:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        .add-set-button {
          padding: 0.75rem;
        }

        .exercises-container {
          margin-top: 2rem;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--text-light);
        }

        .exercise-card {
          margin-bottom: 2rem;
        }

        .exercise-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .exercise-header h4 {
          margin: 0;
          font-size: 1.2rem;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .exercise-category {
          font-size: 0.8rem;
          background: var(--primary);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          text-transform: capitalize;
        }

        .delete-button {
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

        .add-set-form {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .add-set-form h5 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: var(--text);
        }

        .sets-list h5 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: var(--text);
        }

        .no-sets {
          color: var(--text-light);
          font-style: italic;
        }

        .sets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
        }

        .set-card {
          background: var(--card-bg);
          border-radius: 6px;
          padding: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
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
          color: var(--text);
        }

        .set-separator {
          color: var(--text-light);
        }

        .delete-set-button {
          background: none;
          border: none;
          color: var(--text-light);
          font-size: 1rem;
          cursor: pointer;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .delete-set-button:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .not-found {
          padding: 2rem;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        @media (max-width: 768px) {
          .workout-detail {
            padding: 1rem;
          }
          
          .workout-meta {
            grid-template-columns: 1fr 1fr;
          }
          
          .form-row {
            flex-direction: column;
            align-items: stretch;
          }
          
          .add-button, .add-set-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}