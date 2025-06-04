import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import WorkoutList from './pages/WorkoutList.jsx';
import WorkoutDetail from './pages/WorkoutDetail.jsx';
import ExerciseAnalytics from './pages/ExerciseAnalytics.jsx';

export default function App() {
  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem('workouts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('workouts', JSON.stringify(workouts));
  }, [workouts]);

  return (
    <Router>
      <nav>
        <Link to="/">Workouts</Link>
        <Link to="/analytics">Analytics</Link>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<WorkoutList workouts={workouts} setWorkouts={setWorkouts} />} />
          <Route path="/workout/:id" element={<WorkoutDetail workouts={workouts} setWorkouts={setWorkouts} />} />
          <Route path="/analytics" element={<ExerciseAnalytics workouts={workouts} />} />
        </Routes>
      </div>
    </Router>
  );
}
