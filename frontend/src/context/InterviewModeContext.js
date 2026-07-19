import React, { createContext, useContext, useState } from 'react';

const InterviewModeContext = createContext();

export const useInterviewMode = () => useContext(InterviewModeContext);

export const InterviewModeProvider = ({ children }) => {
  const [mode, setMode] = useState('practice');

  return (
    <InterviewModeContext.Provider value={{ mode, setMode }}>
      {children}
    </InterviewModeContext.Provider>
  );
};
