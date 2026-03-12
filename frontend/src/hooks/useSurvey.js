import { useState } from 'react';

export function useSurvey() {
  const [surveys, setSurveys] = useState([]);

  const submitSurvey = (surveyData) => {
    setSurveys([...surveys, surveyData]);
  };

  return { surveys, submitSurvey };
}
