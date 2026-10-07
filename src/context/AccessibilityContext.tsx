import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccessibilitySettings } from '../types';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
  highContrast: false,
  textAlign: 'left',
  colorFilter: 'none',
  lineSpacing: 'normal',
  dyslexiaFont: false,
  largeCursor: false
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('dr_joshi_access');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return defaultSettings;
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('dr_joshi_access', JSON.stringify(settings));
    } catch (e) {
      // ignore
    }

    // Apply class names to root html/body
    const root = document.documentElement;

    // Font size scaling
    root.style.fontSize =
      settings.fontSize === 'medium' ? '17px' :
      settings.fontSize === 'large' ? '18.5px' :
      settings.fontSize === 'xlarge' ? '20px' : '16px';

    // Line spacing
    root.style.lineHeight =
      settings.lineSpacing === 'relaxed' ? '1.8' :
      settings.lineSpacing === 'loose' ? '2.1' : '1.5';

    // Contrast
    root.classList.toggle('access-high-contrast', settings.highContrast);

    // Filters
    root.classList.toggle('access-grayscale', settings.colorFilter === 'grayscale');
    root.classList.toggle('access-warm', settings.colorFilter === 'warm');

    // Dyslexia font
    root.classList.toggle('access-dyslexia', settings.dyslexiaFont);

    // Large cursor
    root.classList.toggle('access-cursor-large', settings.largeCursor);

  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        isPanelOpen,
        setIsPanelOpen
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
