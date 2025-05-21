import React, { useState } from 'react';
import { useData, OrderItem, OrderStatus, PaymentStatus, PaymentMethod } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  category: string | null;
  stock_quantity: number | null;
  track_inventory: boolean;
  tags: string[];
  updated_at: string;
}

const Products = () => {
  const { products, addOrder } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: number }>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 0) return;
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  const getTotalAmount = () => {
    return Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product?.price || 0) * quantity;
    }, 0);
  };

  const handleOrderSubmit = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }

    const selectedItems = Object.entries(selectedProducts)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        if (!product) {
          throw new Error(`Product with ID ${productId} not found`);
        }
        return {
          product_id: productId,
          quantity,
          price_at_order: product.price,
          product,
          id: '', // Will be set by database
          order_id: '', // Will be set by database
          created_at: new Date().toISOString()
        } as OrderItem;
      });

    if (selectedItems.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the order
      const order = await addOrder({
        customer_id: user.id,
        items: selectedItems,
        total_amount: getTotalAmount(),
        payment_method: paymentMethod,
        payment_status: 'pending' as PaymentStatus,
        status: 'pending' as OrderStatus,
        delivery_address: user.address || '',
        notes: ''
      });

      if (order) {
        toast.success('Order placed successfully!');
        setSelectedProducts({});
        setPaymentMethod('cash');
        // Navigate to orders page after successful order placement
        navigate('/customer/orders');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Available Products</h1>
        <p className="text-muted-foreground">Select products to place your order.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Price:</span>
                  <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Available:</span>
                  <span className="text-sm">{product.stock_quantity || 0}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center space-x-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(product.id, (selectedProducts[product.id] || 0) - 1)}
                >
                  -
                </Button>
                <Input
                  type="number"
                  min="0"
                  value={selectedProducts[product.id] || 0}
                  onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                  className="w-16 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(product.id, (selectedProducts[product.id] || 0) + 1)}
                >
                  +
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {Object.values(selectedProducts).some(qty => qty > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {Object.entries(selectedProducts)
                .filter(([_, quantity]) => quantity > 0)
                .map(([productId, quantity]) => {
                  const product = products.find(p => p.id === productId);
                  return (
                    <div key={productId} className="flex justify-between items-center">
                      <span>{product?.name} x {quantity}</span>
                      <span>${((product?.price || 0) * quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>${getTotalAmount().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi">UPI</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleOrderSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Products; 