
import React, { useState } from 'react';
import { useData, Product } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Plus, Search, Filter, ArrowUpDown, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const AdminProducts = () => {
  const { products } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'availability'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortDirection === 'asc' 
          ? a.price - b.price 
          : b.price - a.price;
      } else { // availability
        return sortDirection === 'asc' 
          ? (a.is_available === b.is_available ? 0 : a.is_available ? -1 : 1) 
          : (a.is_available === b.is_available ? 0 : a.is_available ? 1 : -1);
      }
    });

  const toggleSort = (column: 'name' | 'price' | 'availability') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleAddProduct = () => {
    setCurrentProduct({
      name: '',
      description: '',
      price: 0,
      image_url: 'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05',
      is_available: true
    });
    setIsProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct({ ...product });
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = () => {
    if (!currentProduct?.name || !currentProduct?.price) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // In a real app, this would call an API to save the product
    // For now, we just show a success message
    toast.success(
      currentProduct.id 
        ? `Product "${currentProduct.name}" updated successfully` 
        : `Product "${currentProduct.name}" added successfully`
    );
    setIsProductDialogOpen(false);
  };

  const handleDeleteProduct = (product: Product) => {
    // In a real app, this would call an API to delete the product
    // For now, just show confirmation
    toast.success(`Product "${product.name}" deleted successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={handleAddProduct}
            className="bg-purple-400 hover:bg-purple-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full md:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>
            You have {filteredProducts.length} products in your catalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>
                  <button 
                    className="flex items-center space-x-1 hover:text-purple-500"
                    onClick={() => toggleSort('name')}
                  >
                    <span>Name</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center space-x-1 hover:text-purple-500"
                    onClick={() => toggleSort('price')}
                  >
                    <span>Price</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center space-x-1 hover:text-purple-500"
                    onClick={() => toggleSort('availability')}
                  >
                    <span>Status</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {product.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentProduct?.id ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {currentProduct?.id 
                ? 'Update the product details below' 
                : 'Fill in the product details below'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name*
              </Label>
              <Input
                id="name"
                className="col-span-3"
                placeholder="Product name"
                value={currentProduct?.name || ''}
                onChange={(e) => setCurrentProduct(prev => ({ ...prev!, name: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price*
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                className="col-span-3"
                placeholder="0.00"
                value={currentProduct?.price || ''}
                onChange={(e) => setCurrentProduct(prev => ({ ...prev!, price: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                placeholder="Product description"
                value={currentProduct?.description || ''}
                onChange={(e) => setCurrentProduct(prev => ({ ...prev!, description: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image URL
              </Label>
              <Input
                id="image"
                className="col-span-3"
                placeholder="https://example.com/image.jpg"
                value={currentProduct?.image_url || ''}
                onChange={(e) => setCurrentProduct(prev => ({ ...prev!, image_url: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="available" className="text-right">
                Available
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="available"
                  checked={currentProduct?.is_available || false}
                  onCheckedChange={(checked) => setCurrentProduct(prev => ({ ...prev!, is_available: checked }))}
                />
                <Label htmlFor="available" className="text-sm text-gray-500">
                  {currentProduct?.is_available ? 'Product is available' : 'Product is unavailable'}
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-purple-400 hover:bg-purple-500" onClick={handleSaveProduct}>
              {currentProduct?.id ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
