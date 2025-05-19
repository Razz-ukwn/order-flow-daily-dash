
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Search, ShoppingCart, Plus, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddProductForm from '@/components/admin/AddProductForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const ProductsPage = () => {
  const { products } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const { toast } = useToast();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredProducts(products);
    } else {
      const results = products.filter(
        product => 
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term)
      );
      setFilteredProducts(results);
    }
  };

  const toggleAvailability = (productId: string, currentStatus: boolean) => {
    // Toggle availability would be implemented with real API call
    toast({
      title: `Product ${currentStatus ? "disabled" : "enabled"}`,
      description: `Product has been ${currentStatus ? "disabled" : "enabled"} successfully.`,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    toast({
      title: "Product deleted",
      description: "The product has been removed successfully.",
    });
    // In a real app, we would call an API to delete the product
  };

  const handleEditProduct = (productId: string) => {
    toast({
      title: "Edit product",
      description: "Edit functionality would open the product form here.",
    });
    // In a real app, we would open the edit form with the product data
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  const refreshProductsList = () => {
    setFilteredProducts(products);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-gray-500">Manage all products in the system</p>
        </div>
        
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <AddProductForm 
              onClose={() => setIsAddProductOpen(false)}
              onSuccess={refreshProductsList} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Products</CardTitle>
          <CardDescription>You have {products.length} products</CardDescription>
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 w-full md:max-w-sm"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-gray-100 border flex items-center justify-center">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="h-10 w-10 object-cover rounded-md"
                            />
                          ) : (
                            <ShoppingCart className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500 truncate w-[300px]">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={product.is_available} 
                          onCheckedChange={() => toggleAvailability(product.id, product.is_available)}
                        />
                        <span className="flex items-center gap-1">
                          {product.is_available ? 
                            <><Check className="h-3.5 w-3.5 text-green-500" /> Available</> : 
                            <><X className="h-3.5 w-3.5 text-red-500" /> Unavailable</>
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(product.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditProduct(product.id)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsPage;
