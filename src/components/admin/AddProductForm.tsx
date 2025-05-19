import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  ShoppingCart, 
  Upload, 
  X, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle,
  Tag
} from 'lucide-react';

type ProductFormValues = {
  name: string;
  description: string;
  price: number;
  cost_price?: number;
  stock_quantity?: number;
  category: string;
  unit_of_measurement?: string;
  is_available: boolean;
  tags?: string[];
};

// Available categories and units
const CATEGORIES = ["Dairy", "Bakery", "Beverages", "Fruits", "Vegetables", "Snacks", "Frozen Foods"];
const UNITS = ["Liters", "Kg", "Pack", "Box", "Piece", "Dozen", "Bottle"];

const AddProductForm = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const { products } = useData();
  const { toast } = useToast();
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [trackInventory, setTrackInventory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  const form = useForm<ProductFormValues>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      cost_price: undefined,
      stock_quantity: undefined,
      category: '',
      unit_of_measurement: undefined,
      is_available: true,
      tags: [],
    }
  });

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast({ 
          title: "Invalid file type", 
          description: "Please upload a JPEG or PNG image",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB
        toast({ 
          title: "File too large", 
          description: "Image must be less than 2MB",
          variant: "destructive"
        });
        return;
      }
      
      setMainImage(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setMainImagePreview(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Limit to max 5 total images
      if (additionalImages.length + filesArray.length > 5) {
        toast({
          title: "Too many images",
          description: "You can upload a maximum of 5 additional images",
          variant: "destructive"
        });
        return;
      }
      
      // Validate all files
      const invalidFiles = filesArray.filter(file => 
        !['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024
      );
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Invalid files",
          description: "All images must be JPG/PNG format and less than 2MB",
          variant: "destructive"
        });
        return;
      }
      
      setAdditionalImages([...additionalImages, ...filesArray]);
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTagInput.trim() && !selectedTags.includes(newTagInput.trim())) {
      setSelectedTags([...selectedTags, newTagInput.trim()]);
      setNewTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    
    // Check for duplicate product name
    const isDuplicate = products.some(product => 
      product.name.toLowerCase() === data.name.toLowerCase()
    );
    
    if (isDuplicate) {
      toast({
        title: "Duplicate product",
        description: "A product with this name already exists.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    // Validate required fields
    if (!mainImage) {
      toast({
        title: "Missing main image",
        description: "Please upload a main product image",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    // In a real app, we would upload images to storage here
    // and get back URLs to store in the database
    
    try {
      // For demonstration, create a mock image URL
      const mockImageUrl = `https://images.unsplash.com/photo-${Date.now()}`;
      
      // Add tags to the data
      data.tags = selectedTags;
      
      // Create new product (mock implementation)
      const newProduct = {
        id: `product-${Date.now()}`,
        name: data.name,
        description: data.description,
        price: data.price,
        image_url: mockImageUrl,
        is_available: data.is_available,
        created_at: new Date().toISOString(),
        // Additional fields that would be stored in a real app:
        // cost_price: data.cost_price,
        // stock_quantity: trackInventory ? data.stock_quantity : null,
        // category: data.category,
        // unit_of_measurement: data.unit_of_measurement,
        // tags: data.tags,
        // additional_images: additionalImageUrls
      };
      
      // Success handling
      toast({
        title: "Product added",
        description: `${data.name} has been added successfully.`,
      });
      
      onSuccess(); // Refresh product list
      
      // Optional: clear form if "Save & Add Another" was clicked
      // otherwise close the form
      onClose();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add the product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
        <CardDescription>Enter the details for the new product.</CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">1. Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                rules={{
                  required: "Product name is required",
                  minLength: {
                    value: 3,
                    message: "Name must be at least 3 characters"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique name to identify this product
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the product details..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about the product
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Pricing & Inventory Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">2. Pricing & Inventory</h3>
              
              <FormField
                control={form.control}
                name="price"
                rules={{
                  required: "Price is required",
                  min: {
                    value: 0.01,
                    message: "Price must be greater than 0"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0.01" 
                          className="pl-8"
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      The selling price to customers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          className="pl-8"
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your cost (not shown to customers)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center space-x-2 py-2">
                <Switch 
                  checked={trackInventory} 
                  onCheckedChange={setTrackInventory} 
                  id="track-inventory"
                />
                <Label htmlFor="track-inventory">Track Inventory</Label>
              </div>
              
              {trackInventory && (
                <FormField
                  control={form.control}
                  name="stock_quantity"
                  rules={{
                    min: {
                      value: 0,
                      message: "Stock quantity cannot be negative"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Current quantity in stock
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            {/* Product Media Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">3. Product Media</h3>
              
              <div className="space-y-2">
                <Label htmlFor="main-image">Main Image <span className="text-red-500">*</span></Label>
                
                {!mainImagePreview ? (
                  <div className="border-2 border-dashed rounded-md p-8 text-center">
                    <div className="flex flex-col items-center">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-4">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400">PNG, JPG (max. 2MB)</p>
                      <Input
                        id="main-image"
                        type="file"
                        accept="image/png, image/jpeg"
                        className="hidden"
                        onChange={handleMainImageChange}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => document.getElementById('main-image')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-40 h-40">
                    <img 
                      src={mainImagePreview} 
                      alt="Product preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white"
                      onClick={() => {
                        setMainImage(null);
                        setMainImagePreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additional-images">Additional Images (Max. 5)</Label>
                
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  <Input
                    id="additional-images"
                    type="file"
                    multiple
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={handleAdditionalImagesChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('additional-images')?.click()}
                  >
                    Select Additional Images
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">PNG, JPG (max. 2MB each)</p>
                </div>
                
                {additionalImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {additionalImages.map((file, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Additional image ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white p-0"
                          onClick={() => removeAdditionalImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Organization Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">4. Organization</h3>
              
              <FormField
                control={form.control}
                name="category"
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Group this product by category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map(tag => (
                    <div 
                      key={tag}
                      className="flex items-center bg-purple-100 px-3 py-1 rounded-full text-sm text-purple-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      <span>{tag}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-purple-200"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <PlusCircle className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Add keywords to help with search and filtering
                </p>
              </div>
            </div>
            
            {/* Advanced Options Section */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced-options">
                <AccordionTrigger className="text-lg font-medium">
                  5. Advanced Options
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="unit_of_measurement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit of Measurement</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {UNITS.map(unit => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How this product is measured or sold
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_available"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Available for Ordering
                          </FormLabel>
                          <FormDescription>
                            Make this product visible to customers
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t bg-gray-50 p-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                Save & Exit
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => {
                  form.handleSubmit((data) => {
                    onSubmit(data);
                    form.reset();
                    setMainImage(null);
                    setMainImagePreview(null);
                    setAdditionalImages([]);
                    setSelectedTags([]);
                  })();
                }}
              >
                Save & Add Another
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default AddProductForm;
