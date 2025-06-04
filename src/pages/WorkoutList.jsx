import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function WorkoutList({ workouts, setWorkouts }) {
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
    <>
      <h1>Workouts</h1>

      <div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="text" placeholder="Workout name" value={name} onChange={e => setName(e.target.value)} />
        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} placeholder="Start Time" />
        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} placeholder="End Time" />
        <input type="number" value={rating} onChange={e => setRating(e.target.value)} placeholder="Rating (1-10)" min="1" max="10" />
        <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="Comment (optional)" />
        <button onClick={addWorkout}>Add Workout</button>
      </div>

      <ul>
        {workouts.map(w => (
          <li key={w.id}>
            <Link to={`/workout/${w.id}`}>
              {w.date} - {w.name} ({(w.exercises?.length || 0)} exercises)
            </Link>
            <button onClick={() => removeWorkout(w.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  );
}
