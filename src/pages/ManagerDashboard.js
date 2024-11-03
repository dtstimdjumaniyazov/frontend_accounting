import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Dialog,
  DialogActions, DialogContent, DialogTitle,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Layout from '../components/Layout';
import axiosInstance from '../api/axios';

const ManagerDashboard = () => {
  const [tab, setTab] = useState(0);
  const [storage, setStorage] = useState([]);
  const [requests, setRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const storageResponse = await axiosInstance.get('/storage/');
      const requestsResponse = await axiosInstance.get('/requests/');
      setStorage(storageResponse.data);
      setRequests(requestsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleStatusUpdate = async (storageId, newStatus) => {
    try {
      await axiosInstance.patch(`/storage/${storageId}/`, {
        status: newStatus
      });
      await fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCreateStorage = async (request) => {
    try {
      const storageData = {
        user_id: request.user.id,
        product_id: request.product.id,
        start_date: request.start_date,
        quantity: request.quantity,
        status: 'pending'  // Добавляем начальный статус
      };
  
      console.log('Creating storage with data:', storageData);
      const response = await axiosInstance.post('/storage/', storageData);
      
      if (response.data) {
        // Обновляем связь заявки с созданным хранением
        await axiosInstance.patch(`/requests/${request.id}/`, {
          storage_id: response.data.id
        });
  
        // Сразу обновляем локальное состояние
        setRequests(prevRequests => 
          prevRequests.map(r => 
            r.id === request.id 
              ? { ...r, storage: response.data }
              : r
          )
        );
  
        await fetchData(); // Обновляем все данные
      }
    } catch (error) {
      console.error('Error creating storage:', error.response?.data || error);
    }
  };

  const handleCloseStorage = async () => {
    try {
      if (selectedStorage && endDate) {
        const formattedDate = dayjs(endDate).format('YYYY-MM-DD');
        
        await axiosInstance.patch(`/storage/${selectedStorage.id}/`, {
          end_date: formattedDate,
          status: 'approved'  // Меняем статус на approved вместо closed
        });

        await fetchData();
        setOpenDialog(false);
        setSelectedStorage(null);
        setEndDate(null);
      }
    } catch (error) {
      console.error('Error closing storage:', error.response?.data || error);
    }
  };

  const translateStatus = (status) => {
    const statusMap = {
      'pending': 'В ожидании',
      'approved': 'Подтверждена',
      'rejected': 'Отклонена',
      'closed': 'Закрыто'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'orange',
      'approved': 'green',
      'rejected': 'red',
      'closed': 'grey'
    };
    return colorMap[status] || 'black';
  };

  const renderRequestStatus = (request) => {
    if (!request.storage) {
      return (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => handleCreateStorage(request)}
        >
          Создать хранение
        </Button>
      );
    }

    return (
      <Typography
        sx={{
          fontWeight: 'bold',
          color: getStatusColor(request.storage.status),
          padding: '6px 12px',
          bgcolor: `${getStatusColor(request.storage.status)}15`,
          borderRadius: '4px',
          display: 'inline-block'
        }}
      >
        Хранение {translateStatus(request.storage.status).toLowerCase()}
      </Typography>
    );
  };

  return (
    <Layout title="Manager Dashboard">
      <Box sx={{ width: '100%' }}>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label="Storage" />
          <Tab label="Requests" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tab === 0 && (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Пользователь</TableCell>
                      <TableCell>Продукт</TableCell>
                      <TableCell>Дата начала</TableCell>
                      <TableCell>Дата окончания</TableCell>
                      <TableCell>Количество</TableCell>
                      <TableCell>Сумма</TableCell>
                      <TableCell>Статус заявки</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {storage.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.user.username}</TableCell>
                        <TableCell>{item.product.product_name}</TableCell>
                        <TableCell>{item.start_date}</TableCell>
                        <TableCell>{item.end_date || 'На складе'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 'bold',
                              color: getStatusColor(item.status),
                              padding: '6px 12px',
                              bgcolor: `${getStatusColor(item.status)}15`,
                              borderRadius: '4px',
                              display: 'inline-block'
                            }}
                          >
                            {translateStatus(item.status)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {item.status === 'pending' && (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleStatusUpdate(item.id, 'approved')}
                                  sx={{ mr: 1 }}
                                >
                                  Подтвердить
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleStatusUpdate(item.id, 'rejected')}
                                  sx={{ mr: 1 }}
                                >
                                  Отклонить
                                </Button>
                              </>
                            )}
                            {!item.end_date && item.status === 'approved' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                  setSelectedStorage(item);
                                  setEndDate(dayjs());
                                  setOpenDialog(true);
                                }}
                              >
                                Закрыть
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {tab === 1 && (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Пользователь</TableCell>
                      <TableCell>Продукт</TableCell>
                      <TableCell>Дата начала</TableCell>
                      <TableCell>Количество</TableCell>
                      <TableCell>Статус хранения</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.user.username}</TableCell>
                        <TableCell>{request.product.product_name}</TableCell>
                        <TableCell>{request.start_date}</TableCell>
                        <TableCell>{request.quantity}</TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 'bold',
                              color: request.storage ? getStatusColor(request.storage.status) : 'text.secondary'
                            }}
                          >
                            {request.storage ? translateStatus(request.storage.status) : 'Новая заявка'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {renderRequestStatus(request)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Закрыть хранение</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <DatePicker
                label="Дата окончания"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                minDate={selectedStorage?.start_date ? dayjs(selectedStorage.start_date) : undefined}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
            <Button 
              onClick={handleCloseStorage} 
              variant="contained" 
              color="primary"
              disabled={!endDate}
            >
              Подтвердить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default ManagerDashboard;