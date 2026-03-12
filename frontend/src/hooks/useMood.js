import { useState } from 'react';

export function useMood() {
  const [moods, setMoods] = useState([]);

  const recordMood = (mood) => {
    setMoods([...moods, { ...mood, timestamp: new Date() }]);
  };

  return { moods, recordMood };
}
