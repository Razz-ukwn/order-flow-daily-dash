import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Settings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  enableOrderNotifications: boolean;
  enableSMS: boolean;
  deliveryRadius: number;
  minOrderAmount: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  enableDeliveryTracking: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  storeName: 'Daily Orders',
  storeDescription: 'Fresh groceries delivered to your doorstep daily.',
  contactEmail: 'contact@dailyorders.com',
  contactPhone: '123-456-7890',
  enableOrderNotifications: true,
  enableSMS: false,
  deliveryRadius: 10,
  minOrderAmount: 10,
  deliveryFee: 2.99,
  freeDeliveryThreshold: 40,
  enableDeliveryTracking: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error loading settings:', error);
        return;
      }

      if (data) {
        setSettings({
          ...defaultSettings,
          ...data,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 1, // We'll use a single row for settings
          ...newSettings,
        });

      if (error) {
        throw error;
      }

      setSettings(prev => ({
        ...prev,
        ...newSettings,
      }));
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 