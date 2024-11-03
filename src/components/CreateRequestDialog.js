// src/components/CreateRequestDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import axiosInstance from '../api/axios';

const CreateRequestDialog = ({ open, onClose, onSubmit }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    start_date: '',
    quantity: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        console.log('Fetching products...');
        const response = await axiosInstance.get('/products/');
        console.log('Products received:', response.data);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchProducts();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to:`, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
  
    try {
      const requestData = {
        product_id: formData.product,
        start_date: formData.start_date,
        quantity: parseInt(formData.quantity)
      };
  
      console.log('Sending request data:', requestData);
      await onSubmit(requestData);
      
      setFormData({
        product: '',
        start_date: '',
        quantity: ''
      });
      
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Request</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="product-label">Product</InputLabel>
            <Select
              labelId="product-label"
              name="product"
              value={formData.product}
              onChange={handleChange}
              label="Product"
              required
              disabled={loading}
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.product_name} - {product.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            required
            fullWidth
            name="start_date"
            label="Start Date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="quantity"
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            inputProps={{ min: 1 }}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>CANCEL</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading || !formData.product || !formData.start_date || !formData.quantity}
        >
          {loading ? 'Loading...' : 'CREATE'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRequestDialog;