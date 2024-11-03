import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Fab, Chip 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Layout from '../components/Layout';
import CreateRequestDialog from '../components/CreateRequestDialog';
import axiosInstance from '../api/axios';

const ClientDashboard = () => {
  const [tab, setTab] = useState(0);
  const [storage, setStorage] = useState([]);
  const [requests, setRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchData = async () => {
    try {
      const storageResponse = await axiosInstance.get('/storage/');
      const requestsResponse = await axiosInstance.get('/requests/');
      console.log('Storage data:', storageResponse.data);
      console.log('Requests data:', requestsResponse.data);
      setStorage(storageResponse.data);
      setRequests(requestsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleCreateRequest = async (formData) => {
    try {
      console.log('Creating request with data:', formData);
      const response = await axiosInstance.post('/requests/', {
        product_id: formData.product_id,
        start_date: formData.start_date,
        quantity: formData.quantity
      });
      
      console.log('Request created:', response.data);
      setOpenDialog(false);
      fetchData(); // Обновляем данные
    } catch (error) {
      console.error('Error creating request:', error);
      // Здесь можно добавить отображение ошибки пользователю
    }
  };

  // Функция для форматирования статуса
  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'В ожидании', color: 'warning' },
      approved: { label: 'Подтверждено', color: 'success' },
      rejected: { label: 'Отклонено', color: 'error' }
    };

    const config = statusConfig[status] || { label: status, color: 'default' };

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ minWidth: '100px' }}
      />
    );
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  // Функция для форматирования суммы
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  return (
    <Layout title="Client Dashboard">
      <Box sx={{ width: '100%', position: 'relative' }}>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label="Storage" />
          <Tab label="Requests" />
        </Tabs>

        {/* Storage Tab Content */}
        {tab === 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {storage.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product.product_name}</TableCell>
                    <TableCell>{formatDate(item.start_date)}</TableCell>
                    <TableCell>{formatDate(item.end_date)}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{formatAmount(item.amount)}</TableCell>
                    <TableCell align="center">{getStatusChip(item.status)}</TableCell>
                  </TableRow>
                ))}
                {storage.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No storage items found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Requests Tab Content */}
        {tab === 1 && (
          <>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.product.product_name}</TableCell>
                      <TableCell>{formatDate(request.start_date)}</TableCell>
                      <TableCell align="right">{request.quantity}</TableCell>
                      <TableCell align="center">
                        {getStatusChip(request.storage ? request.storage.status : 'pending')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {requests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No requests found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Floating Action Button for creating new request */}
            <Fab
              color="primary"
              sx={{ 
                position: 'fixed', 
                bottom: 16, 
                right: 16,
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
              onClick={() => setOpenDialog(true)}
            >
              <AddIcon />
            </Fab>
          </>
        )}

        {/* Create Request Dialog */}
        <CreateRequestDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSubmit={handleCreateRequest}
        />
      </Box>
    </Layout>
  );
};

export default ClientDashboard;