
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
        // Map database column names (lowercase) to our interface properties (camelCase)
        setSettings({
          storeName: data.storename || defaultSettings.storeName,
          storeDescription: data.storedescription || defaultSettings.storeDescription,
          contactEmail: data.contactemail || defaultSettings.contactEmail,
          contactPhone: data.contactphone || defaultSettings.contactPhone,
          enableOrderNotifications: data.enableordernotifications ?? defaultSettings.enableOrderNotifications,
          enableSMS: data.enablesms ?? defaultSettings.enableSMS,
          deliveryRadius: data.deliveryradius || defaultSettings.deliveryRadius,
          minOrderAmount: data.minorderamount || defaultSettings.minOrderAmount,
          deliveryFee: data.deliveryfee || defaultSettings.deliveryFee,
          freeDeliveryThreshold: data.freedeliverythreshold || defaultSettings.freeDeliveryThreshold,
          enableDeliveryTracking: data.enabledeliverytracking ?? defaultSettings.enableDeliveryTracking,
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
      // Convert our camelCase property names to database lowercase column names
      const dbSettings: Record<string, any> = {};
      
      if (newSettings.storeName !== undefined) dbSettings.storename = newSettings.storeName;
      if (newSettings.storeDescription !== undefined) dbSettings.storedescription = newSettings.storeDescription;
      if (newSettings.contactEmail !== undefined) dbSettings.contactemail = newSettings.contactEmail;
      if (newSettings.contactPhone !== undefined) dbSettings.contactphone = newSettings.contactPhone;
      if (newSettings.enableOrderNotifications !== undefined) dbSettings.enableordernotifications = newSettings.enableOrderNotifications;
      if (newSettings.enableSMS !== undefined) dbSettings.enablesms = newSettings.enableSMS;
      if (newSettings.deliveryRadius !== undefined) dbSettings.deliveryradius = newSettings.deliveryRadius;
      if (newSettings.minOrderAmount !== undefined) dbSettings.minorderamount = newSettings.minOrderAmount;
      if (newSettings.deliveryFee !== undefined) dbSettings.deliveryfee = newSettings.deliveryFee;
      if (newSettings.freeDeliveryThreshold !== undefined) dbSettings.freedeliverythreshold = newSettings.freeDeliveryThreshold;
      if (newSettings.enableDeliveryTracking !== undefined) dbSettings.enabledeliverytracking = newSettings.enableDeliveryTracking;
      
      const { error } = await supabase
        .from('settings')
        .update(dbSettings)
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
