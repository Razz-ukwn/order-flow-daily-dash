import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSettings } from '@/contexts/SettingsContext';

// Define form schemas
const generalSettingsSchema = z.object({
  storeName: z.string().min(2, { message: 'Store name must be at least 2 characters.' }),
  storeDescription: z.string().optional(),
  contactEmail: z.string().email({ message: 'Please enter a valid email.' }),
  contactPhone: z.string().min(5, { message: 'Please enter a valid phone number.' }),
  enableOrderNotifications: z.boolean().default(true),
  enableSMS: z.boolean().default(false),
});

const deliverySettingsSchema = z.object({
  deliveryRadius: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Delivery radius must be a number.",
  }),
  minOrderAmount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Minimum order amount must be a number.",
  }),
  deliveryFee: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Delivery fee must be a number.",
  }),
  freeDeliveryThreshold: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Free delivery threshold must be a number.",
  }),
  enableDeliveryTracking: z.boolean().default(true),
});

const SettingsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const { settings, updateSettings, isLoading } = useSettings();

  // Setup general settings form
  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      storeName: settings.storeName,
      storeDescription: settings.storeDescription,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      enableOrderNotifications: settings.enableOrderNotifications,
      enableSMS: settings.enableSMS,
    },
  });

  // Setup delivery settings form
  const deliveryForm = useForm<z.infer<typeof deliverySettingsSchema>>({
    resolver: zodResolver(deliverySettingsSchema),
    defaultValues: {
      deliveryRadius: settings.deliveryRadius.toString(),
      minOrderAmount: settings.minOrderAmount.toString(),
      deliveryFee: settings.deliveryFee.toString(),
      freeDeliveryThreshold: settings.freeDeliveryThreshold.toString(),
      enableDeliveryTracking: settings.enableDeliveryTracking,
    },
  });

  const onGeneralSubmit = async (values: z.infer<typeof generalSettingsSchema>) => {
    try {
      await updateSettings({
        storeName: values.storeName,
        storeDescription: values.storeDescription,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        enableOrderNotifications: values.enableOrderNotifications,
        enableSMS: values.enableSMS,
      });

      toast({
        title: 'General settings updated',
        description: 'Your general settings have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update general settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onDeliverySubmit = async (values: z.infer<typeof deliverySettingsSchema>) => {
    try {
      await updateSettings({
        deliveryRadius: Number(values.deliveryRadius),
        minOrderAmount: Number(values.minOrderAmount),
        deliveryFee: Number(values.deliveryFee),
        freeDeliveryThreshold: Number(values.freeDeliveryThreshold),
        enableDeliveryTracking: values.enableDeliveryTracking,
      });

      toast({
        title: 'Delivery settings updated',
        description: 'Your delivery settings have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update delivery settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage your application settings</p>
      </div>

      <div className="flex space-x-2 border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'general' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'delivery' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
          onClick={() => setActiveTab('delivery')}
        >
          Delivery
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'notifications' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'payment' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
          onClick={() => setActiveTab('payment')}
        >
          Payment
        </button>
      </div>

      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage your store's general information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...generalForm}>
              <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                <FormField
                  control={generalForm.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name that will be displayed to your customers.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={generalForm.control}
                  name="storeDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        Briefly describe your store.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={generalForm.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={generalForm.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={generalForm.control}
                  name="enableOrderNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Order Notifications</FormLabel>
                        <FormDescription>
                          Receive notifications when new orders are placed.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={generalForm.control}
                  name="enableSMS"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">SMS Notifications</FormLabel>
                        <FormDescription>
                          Enable SMS notifications for order updates.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit">Save General Settings</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'delivery' && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Settings</CardTitle>
            <CardDescription>Configure how deliveries work for your store</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...deliveryForm}>
              <form onSubmit={deliveryForm.handleSubmit(onDeliverySubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={deliveryForm.control}
                    name="deliveryRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Radius (miles)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormDescription>
                          Maximum distance for delivery service
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={deliveryForm.control}
                    name="minOrderAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order Amount ($)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" />
                        </FormControl>
                        <FormDescription>
                          Smallest order amount allowed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={deliveryForm.control}
                    name="deliveryFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Fee ($)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" />
                        </FormControl>
                        <FormDescription>
                          Standard fee for delivery service
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={deliveryForm.control}
                    name="freeDeliveryThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Free Delivery Threshold ($)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" />
                        </FormControl>
                        <FormDescription>
                          Order amount for free delivery
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={deliveryForm.control}
                  name="enableDeliveryTracking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Delivery Tracking</FormLabel>
                        <FormDescription>
                          Allow customers to track their deliveries in real-time.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit">Save Delivery Settings</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Notification settings will be implemented soon.</p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>Configure payment methods and processors</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Payment settings will be implemented soon.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
