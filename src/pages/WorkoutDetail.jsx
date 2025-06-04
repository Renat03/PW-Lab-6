import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const categories = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs'];

export default function WorkoutDetail({ workouts, setWorkouts }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const workout = workouts.find(w => w.id === id);
  if (!workout) {
    return (
      <div>
        <p>Workout not found.</p>
        <button onClick={() => navigate('/')}>Back</button>
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
    <>
      <button onClick={() => navigate(-1)}>Back</button>
      <h1>{workout.name} ({workout.date})</h1>
      <p><strong>Start:</strong> {workout.startTime || '-'}</p>
      <p><strong>End:</strong> {workout.endTime || '-'}</p>
      <p><strong>Duration:</strong> {calculateDuration(workout.startTime, workout.endTime)}</p>
      <p><strong>Total Sets:</strong> {totalSets}</p>
      {workout.rating != null && <p><strong>Rating:</strong> {workout.rating}/10</p>}
      {workout.comment && <p><strong>Comment:</strong> {workout.comment}</p>}

      <h2>Add Exercise</h2>
      <input type="text" placeholder="Exercise name" value={exerciseName} onChange={e => setExerciseName(e.target.value)} />
      <select value={exerciseCategory} onChange={e => setExerciseCategory(e.target.value)}>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <button onClick={addExercise}>Add Exercise</button>

      <h2>Exercises</h2>
      {workout.exercises.length === 0 && <p>No exercises added yet.</p>}

      {workout.exercises.map(e => (
        <div key={e.id} style={{ border: '1px solid gray', marginBottom: '1rem', padding: '0.5rem' }}>
          <h3>
            {e.name} ({e.category}){' '}
            <button onClick={() => removeExercise(e.id)}>Remove Exercise</button>
          </h3>

          <h4>Add Set</h4>
          <input type="number" placeholder="Reps" value={setReps} onChange={e => setSetReps(e.target.value)} min="1" />
          <input type="number" placeholder="Weight (kg)" value={setWeight} onChange={e => setSetWeight(e.target.value)} min="0" />
          <button onClick={() => addSet(e.id)}>Add Set</button>

          <h4>Sets</h4>
          {e.sets.length === 0 && <p>No sets added.</p>}
          <ul>
            {e.sets.map(s => (
              <li key={s.id}>
                {s.reps} reps × {s.weight} kg{' '}
                <button onClick={() => removeSet(e.id, s.id)}>Remove Set</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
