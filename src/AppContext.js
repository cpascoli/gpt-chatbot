
import React, { useState } from 'react';

export const AppContext = React.createContext({
    selectedVoice: {"id": "com.apple.voice.compact.en-AU.Karen", "language": "en-AU", "name": "Karen"} ,
    setSelectedVoice: () => {},

    isModeQA: false,
    setModeQA: () => {},

    isGoogleSpeech: false,
    setGoogleSpeech: () => {},

    speechRate: 0.5,
    updateSpeechRate : () => {},

    speechPitch: 0.5,
    updateSpeechPitch: () => {},

    jsonResponse: '',
    setJsonResponse: () => {},

    isReading: false,
    setReading: () => {},
});