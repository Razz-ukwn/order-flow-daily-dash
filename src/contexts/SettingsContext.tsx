
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      // Check if settings table exists and fetch settings
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (error) {
        console.error('Error loading settings:', error);
        return;
      }

      if (data) {
        // Map database column names to our interface properties
        setSettings({
          storeName: data.storeName || defaultSettings.storeName,
          storeDescription: data.storeDescription || defaultSettings.storeDescription,
          contactEmail: data.contactEmail || defaultSettings.contactEmail,
          contactPhone: data.contactPhone || defaultSettings.contactPhone,
          enableOrderNotifications: data.enableOrderNotifications ?? defaultSettings.enableOrderNotifications,
          enableSMS: data.enableSMS ?? defaultSettings.enableSMS,
          deliveryRadius: data.deliveryRadius || defaultSettings.deliveryRadius,
          minOrderAmount: data.minOrderAmount || defaultSettings.minOrderAmount,
          deliveryFee: data.deliveryFee || defaultSettings.deliveryFee,
          freeDeliveryThreshold: data.freeDeliveryThreshold || defaultSettings.freeDeliveryThreshold,
          enableDeliveryTracking: data.enableDeliveryTracking ?? defaultSettings.enableDeliveryTracking,
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
        .update(newSettings)
        .eq('id', 1);

      if (error) {
        console.error('Error updating settings:', error);
        toast.error('Failed to update settings');
        throw error;
      }

      setSettings(prev => ({
        ...prev,
        ...newSettings,
      }));
      
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
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
