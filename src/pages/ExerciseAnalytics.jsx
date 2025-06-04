import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function ExerciseAnalytics({ workouts }) {
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
  const [progressionMode, setProgressionMode] = useState('repsForWeight'); // or 'weightForReps'

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
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Chronological sort
  }, [workouts, selectedExercise, selectedWeight, minReps, progressionMode, startDate, endDate]);

  return (
    <div>
      <h1>Exercise Analytics</h1>

      {/* CATEGORY SELECT */}
      <label>
        Category:
        <select value={selectedCategory} onChange={e => {
          setSelectedCategory(e.target.value);
          setSelectedExercise('');
        }}>
          <option value="">-- Choose Category --</option>
          {Object.keys(categoryMap).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </label>

      {/* EXERCISE SELECT */}
      {selectedCategory && (
        <>
          <br />
          <label>
            Exercise:
            <select value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)}>
              <option value="">-- Choose Exercise --</option>
              {categoryMap[selectedCategory].map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
        </>
      )}

      {/* FILTERS */}
      {selectedExercise && (
        <>
          <br />
          <label>
            Filter by Weight (kg):{' '}
            <input type="number" value={selectedWeight} onChange={e => setSelectedWeight(e.target.value)} />
          </label>
          <br />
          <label>
            Reps Range:{' '}
            <input
              type="number"
              placeholder="Min"
              value={minReps}
              onChange={e => setMinReps(e.target.value)}
              style={{ width: '60px' }}
            /> - 
            <input
              type="number"
              placeholder="Max"
              value={maxReps}
              onChange={e => setMaxReps(e.target.value)}
              style={{ width: '60px', marginLeft: '4px' }}
            />
          </label>
          <br />
          <label>
            Date Range:{' '}
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /> - 
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ marginLeft: '4px' }} />
          </label>
          <br />
          <label>
            Sort by:{' '}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="reps">Reps</option>
              <option value="weight">Weight</option>
              <option value="date">Date</option>
            </select>
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input
              type="checkbox"
              checked={sortDescending}
              onChange={() => setSortDescending(prev => !prev)}
            /> Descending
          </label>
          <br />
          <button onClick={() => setShowProgression(prev => !prev)}>
            {showProgression ? 'Hide' : 'Show'} Progression Chart
          </button>
          {showProgression && (
            <>
              <br />
              <label>
                Progression Mode:{' '}
                <select value={progressionMode} onChange={e => setProgressionMode(e.target.value)}>
                  <option value="repsForWeight">Reps @ Weight</option>
                  <option value="weightForReps">Weight @ Reps</option>
                </select>
              </label>
              <br />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    name={progressionMode === 'repsForWeight' ? 'Reps' : 'Weight'}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </>
      )}

      {/* RESULTS */}
      {filteredSets.length > 0 && (
        <>
          <h3>Filtered Sets</h3>
          <ul>
            {filteredSets.map((s, idx) => (
              <li key={idx}>{s.date} - {s.reps} reps @ {s.weight} kg</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}