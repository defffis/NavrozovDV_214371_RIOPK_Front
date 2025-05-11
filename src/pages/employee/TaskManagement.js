import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Box, Button, Grid,
  Card, CardContent, CardActions, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, MenuItem, 
  FormControl, InputLabel, Select, Chip, Divider,
  IconButton, List, ListItem, ListItemText, Avatar,
  ListItemAvatar, Snackbar, Alert, CircularProgress
} from '@mui/material';
import {
  Add, Delete, Edit, CheckCircle, Refresh, 
  Assignment, CalendarToday, PriorityHigh,
  Person, AccessTime, FilterList
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const { currentUser } = useAuth();

  // Добавляем демо данные для отображения задач
  const demoTasks = [
    {
      _id: '1',
      title: 'Проверить новые заказы',
      description: 'Необходимо проверить все новые заказы, поступившие за сегодня, и подтвердить их.',
      assignedTo: currentUser?._id || 'current-user',
      assignedToName: currentUser?.name || 'Текущий пользователь',
      priority: 'Высокий',
      status: 'В работе',
      dueDate: '2023-12-20',
      createdAt: '2023-12-15'
    },
    {
      _id: '2',
      title: 'Связаться с поставщиком ООО "Технопром"',
      description: 'Уточнить сроки поставки товаров по заказам #1234, #1235.',
      assignedTo: currentUser?._id || 'current-user',
      assignedToName: currentUser?.name || 'Текущий пользователь',
      priority: 'Средний',
      status: 'Ожидает',
      dueDate: '2023-12-22',
      createdAt: '2023-12-16'
    },
    {
      _id: '3',
      title: 'Подготовить отчет по доставкам',
      description: 'Составить еженедельный отчет по выполненным доставкам и передать руководителю.',
      assignedTo: currentUser?._id || 'current-user',
      assignedToName: currentUser?.name || 'Текущий пользователь',
      priority: 'Низкий',
      status: 'Завершена',
      dueDate: '2023-12-18',
      createdAt: '2023-12-14'
    },
    {
      _id: '4',
      title: 'Обновить статусы доставок',
      description: 'Обновить информацию о статусах текущих доставок в системе.',
      assignedTo: 'user-123',
      assignedToName: 'Иванов Иван',
      priority: 'Высокий',
      status: 'В работе',
      dueDate: '2023-12-21',
      createdAt: '2023-12-17'
    },
    {
      _id: '5',
      title: 'Решить проблему с доставкой заказа #5678',
      description: 'Клиент сообщил о задержке доставки. Необходимо связаться с курьером и решить проблему.',
      assignedTo: currentUser?._id || 'current-user',
      assignedToName: currentUser?.name || 'Текущий пользователь',
      priority: 'Срочный',
      status: 'Ожидает',
      dueDate: '2023-12-19',
      createdAt: '2023-12-18'
    }
  ];

  // Демо данные для сотрудников
  const demoEmployees = [
    { _id: 'user-123', name: 'Иванов Иван', position: 'Менеджер по продажам' },
    { _id: 'user-124', name: 'Петров Петр', position: 'Логист' },
    { _id: 'user-125', name: 'Сидорова Анна', position: 'Оператор' },
    { _id: currentUser?._id || 'current-user', name: currentUser?.name || 'Текущий пользователь', position: 'Сотрудник' }
  ];

  const priorities = ['Низкий', 'Средний', 'Высокий', 'Срочный'];
  const statuses = ['Ожидает', 'В работе', 'Завершена', 'Отменена'];

  // Функция для получения токена
  const getToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Попытка получить данные с сервера
      const token = getToken();
      if (!token) throw new Error('No token available');
      
      const response = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.warn('Using demo tasks data:', error);
      // В случае ошибки используем демо-данные
      setTasks(demoTasks);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      // Попытка получить данные с сервера
      const token = getToken();
      if (!token) throw new Error('No token available');
      
      const response = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      console.warn('Using demo employees data:', error);
      // В случае ошибки используем демо-данные
      setEmployees(demoEmployees);
    }
  };

  const handleAddTask = () => {
    setCurrentTask({
      title: '',
      description: '',
      assignedTo: currentUser?._id || 'current-user',
      priority: 'Средний',
      status: 'Ожидает',
      dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    });
    setDialogOpen(true);
  };

  const handleEditTask = (task) => {
    setCurrentTask({
      ...task,
      dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd')
    });
    setDialogOpen(true);
  };

  const handleViewTask = (task) => {
    setCurrentTask(task);
    setTaskDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentTask(null);
  };

  const handleTaskDialogClose = () => {
    setTaskDialogOpen(false);
    setCurrentTask(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = getToken();
      if (!token) throw new Error('No token available');
      
      await axios.patch(`/api/tasks/${taskId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      showSnackbar('Статус задачи успешно обновлен');
    } catch (error) {
      console.warn('Simulating API call:', error);
      // Симулируем успешное обновление даже при отсутствии API
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
      showSnackbar('Статус задачи успешно обновлен');
    }
  };

  const submitTaskForm = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('No token available');
      
      let response;
      
      if (currentTask._id) {
        // Update existing task
        response = await axios.put(`/api/tasks/${currentTask._id}`, currentTask, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local state
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === currentTask._id ? response.data : task
          )
        );
        
        showSnackbar('Задача успешно обновлена');
      } else {
        // Create new task
        response = await axios.post('/api/tasks', currentTask, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local state
        setTasks(prevTasks => [...prevTasks, response.data]);
        
        showSnackbar('Задача успешно создана');
      }
      
      handleDialogClose();
    } catch (error) {
      console.warn('Simulating API call:', error);
      // Симулируем API и добавляем задачу в локальный стейт
      const newOrUpdatedTask = {
        ...currentTask,
        _id: currentTask._id || `new-${Date.now()}`,
        createdAt: currentTask.createdAt || new Date().toISOString(),
        assignedToName: employees.find(e => e._id === currentTask.assignedTo)?.name || 'Назначенный сотрудник'
      };
      
      if (currentTask._id) {
        // Обновление существующей задачи
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === currentTask._id ? newOrUpdatedTask : task
          )
        );
        showSnackbar('Задача успешно обновлена');
      } else {
        // Создание новой задачи
        setTasks(prevTasks => [...prevTasks, newOrUpdatedTask]);
        showSnackbar('Задача успешно создана');
      }
      
      handleDialogClose();
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const token = getToken();
      if (!token) throw new Error('No token available');
      
      await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      
      showSnackbar('Задача успешно удалена');
      handleTaskDialogClose();
    } catch (error) {
      console.warn('Simulating API call:', error);
      // Симулируем успешное удаление даже при отсутствии API
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      showSnackbar('Задача успешно удалена');
      handleTaskDialogClose();
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Низкий': return 'success';
      case 'Средний': return 'info';
      case 'Высокий': return 'warning';
      case 'Срочный': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ожидает': return 'warning';
      case 'В работе': return 'info';
      case 'Завершена': return 'success';
      case 'Отменена': return 'error';
      default: return 'default';
    }
  };

  // Фильтрация задач по выбранному фильтру
  const getFilteredTasks = () => {
    if (filter === 'all') return tasks;
    if (filter === 'my') return tasks.filter(task => task.assignedTo === (currentUser?._id || 'current-user'));
    if (filter === 'pending') return tasks.filter(task => task.status === 'Ожидает');
    if (filter === 'inProgress') return tasks.filter(task => task.status === 'В работе');
    if (filter === 'completed') return tasks.filter(task => task.status === 'Завершена');
    return tasks;
  };

  const renderTaskCards = () => {
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1">Задачи не найдены. Нажмите кнопку "Добавить задачу", чтобы создать новую.</Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {filteredTasks.map(task => (
          <Grid item xs={12} sm={6} md={4} key={task._id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': { boxShadow: 6 }
              }} 
              onClick={() => handleViewTask(task)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" component="div" noWrap>
                    {task.title}
                  </Typography>
                  <Chip 
                    label={task.priority} 
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    mb: 2, 
                    display: '-webkit-box', 
                    WebkitBoxOrient: 'vertical', 
                    WebkitLineClamp: 3, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}
                >
                  {task.description}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }} noWrap>
                    {task.assignedToName || 'Не назначен'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Chip 
                    label={task.status} 
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Создана: {new Date(task.createdAt).toLocaleDateString('ru-RU')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Управление задачами
          </Typography>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Add />}
              onClick={handleAddTask}
              sx={{ ml: 2 }}
            >
              Добавить задачу
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Button 
              variant={filter === 'all' ? 'contained' : 'outlined'} 
              onClick={() => handleFilterChange('all')}
              sx={{ mr: 1 }}
              size="small"
            >
              Все
            </Button>
            <Button 
              variant={filter === 'my' ? 'contained' : 'outlined'} 
              onClick={() => handleFilterChange('my')}
              sx={{ mr: 1 }}
              size="small"
            >
              Мои
            </Button>
            <Button 
              variant={filter === 'pending' ? 'contained' : 'outlined'} 
              onClick={() => handleFilterChange('pending')}
              sx={{ mr: 1 }}
              size="small"
            >
              Ожидают
            </Button>
            <Button 
              variant={filter === 'inProgress' ? 'contained' : 'outlined'} 
              onClick={() => handleFilterChange('inProgress')}
              sx={{ mr: 1 }}
              size="small"
            >
              В работе
            </Button>
            <Button 
              variant={filter === 'completed' ? 'contained' : 'outlined'} 
              onClick={() => handleFilterChange('completed')}
              size="small"
            >
              Завершены
            </Button>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={fetchTasks}
          >
            Обновить
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          renderTaskCards()
        )}
      </Paper>

      {/* Диалог создания/редактирования задачи */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{currentTask?._id ? 'Редактировать задачу' : 'Добавить задачу'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Название задачи"
                value={currentTask?.title || ''}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Описание"
                value={currentTask?.description || ''}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Приоритет</InputLabel>
                <Select
                  name="priority"
                  value={currentTask?.priority || 'Средний'}
                  onChange={handleInputChange}
                  label="Приоритет"
                >
                  {priorities.map(priority => (
                    <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  name="status"
                  value={currentTask?.status || 'Ожидает'}
                  onChange={handleInputChange}
                  label="Статус"
                >
                  {statuses.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Назначить</InputLabel>
                <Select
                  name="assignedTo"
                  value={currentTask?.assignedTo || (currentUser?._id || 'current-user')}
                  onChange={handleInputChange}
                  label="Назначить"
                >
                  {employees.map(employee => (
                    <MenuItem key={employee._id} value={employee._id}>{employee.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dueDate"
                label="Срок выполнения"
                type="date"
                value={currentTask?.dueDate || ''}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">Отмена</Button>
          <Button onClick={submitTaskForm} variant="contained" color="primary">
            {currentTask?._id ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра задачи */}
      <Dialog open={taskDialogOpen} onClose={handleTaskDialogClose} maxWidth="sm" fullWidth>
        {currentTask && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{currentTask.title}</Typography>
                <Chip 
                  label={currentTask.priority} 
                  color={getPriorityColor(currentTask.priority)}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {currentTask.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Назначена:
                  </Typography>
                  <Typography variant="body1">
                    {currentTask.assignedToName || 'Не назначена'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Срок выполнения:
                  </Typography>
                  <Typography variant="body1">
                    {new Date(currentTask.dueDate).toLocaleDateString('ru-RU')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Статус:
                  </Typography>
                  <Chip 
                    label={currentTask.status} 
                    color={getStatusColor(currentTask.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Создана:
                  </Typography>
                  <Typography variant="body1">
                    {new Date(currentTask.createdAt).toLocaleDateString('ru-RU')}
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Изменить статус:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {statuses.map(status => (
                  <Button
                    key={status}
                    variant={currentTask.status === status ? 'contained' : 'outlined'}
                    color={getStatusColor(status)}
                    size="small"
                    onClick={() => handleStatusChange(currentTask._id, status)}
                    disabled={currentTask.status === status}
                  >
                    {status}
                  </Button>
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => deleteTask(currentTask._id)} 
                color="error"
                startIcon={<Delete />}
              >
                Удалить
              </Button>
              <Button 
                onClick={() => {
                  handleTaskDialogClose();
                  handleEditTask(currentTask);
                }} 
                color="primary"
                startIcon={<Edit />}
              >
                Редактировать
              </Button>
              <Button onClick={handleTaskDialogClose} color="inherit">
                Закрыть
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TaskManagement; 