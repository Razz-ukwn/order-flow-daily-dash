
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

const ProductsPage = () => {
  const { products } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{[key: string]: {product: any, quantity: number}}>({});
  
  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.is_available && 
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Add product to cart
  const addToCart = (product: any) => {
    setCart(prevCart => {
      const updatedCart = { ...prevCart };
      
      if (updatedCart[product.id]) {
        updatedCart[product.id] = {
          ...updatedCart[product.id],
          quantity: updatedCart[product.id].quantity + 1
        };
      } else {
        updatedCart[product.id] = {
          product,
          quantity: 1
        };
      }
      
      return updatedCart;
    });
  };
  
  // Remove product from cart
  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const updatedCart = { ...prevCart };
      
      if (updatedCart[productId].quantity > 1) {
        updatedCart[productId] = {
          ...updatedCart[productId],
          quantity: updatedCart[productId].quantity - 1
        };
      } else {
        delete updatedCart[productId];
      }
      
      return updatedCart;
    });
  };
  
  // Calculate cart total
  const cartTotal = Object.values(cart).reduce(
    (total, item) => total + (item.product.price * item.quantity), 
    0
  );
  
  // Count items in cart
  const cartItemCount = Object.values(cart).reduce(
    (count, item) => count + item.quantity, 
    0
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Browse and add products to your order.</p>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Products list */}
        <div className="flex-1">
          <div className="mb-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map(product => (
                <Card key={product.id} className="card-hover">
                  <div className="aspect-square w-full overflow-hidden rounded-t-lg">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="h-full w-full object-cover transition-all hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-md">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                      {cart[product.id] && (
                        <Badge variant="outline" className="bg-purple-100">
                          {cart[product.id].quantity} in cart
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="w-full flex items-center justify-between">
                      {cart[product.id] ? (
                        <div className="flex items-center">
                          <Button 
                            size="icon" 
                            variant="outline"
                            onClick={() => removeFromCart(product.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="mx-2 font-medium">{cart[product.id].quantity}</span>
                          <Button 
                            size="icon" 
                            variant="outline"
                            onClick={() => addToCart(product)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="w-full bg-purple-400 hover:bg-purple-500"
                          onClick={() => addToCart(product)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-md shadow-sm border">
              <p className="text-muted-foreground">No products found matching your search</p>
            </div>
          )}
        </div>
        
        {/* Cart summary */}
        <div className="lg:w-80">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Cart</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(cart).length > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {Object.values(cart).map(item => (
                        <div key={item.product.id} className="flex justify-between py-2 border-b">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>${item.product.price.toFixed(2)} × {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                            <div className="flex items-center mt-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="mx-1 text-sm">{item.quantity}</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6"
                                onClick={() => addToCart(item.product)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-muted-foreground">Your cart is empty</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-purple-400 hover:bg-purple-500"
                  disabled={cartItemCount === 0}
                >
                  Checkout ({cartItemCount})
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
