import axios from 'axios';

const API_URL = 'http://127.0.0.1:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Функция для получения токена из localStorage
const getToken = () => {
    return localStorage.getItem('token');
};

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// API сервисы для работы с аналитикой
const analyticsService = {
    // Получение KPI для дашборда
    getDashboardKPIs: async () => {
        try {
            const response = await api.get('/analytics/dashboard/kpis');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard KPIs:', error);
            throw error;
        }
    },

    // Получение последней полной ежедневной аналитики
    getLatestDailyDetails: async () => {
        try {
            const response = await api.get('/analytics/latest-daily-details');
            return response.data;
        } catch (error) {
            console.error('Error fetching latest daily detailed analytics:', error);
            throw error;
        }
    },

    // Получение метрик поставщиков
    getSupplierMetrics: async (startDate, endDate) => {
        try {
            const response = await api.get('/analytics/suppliers', {
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching supplier metrics:', error);
            throw error;
        }
    },

    // Получение метрик доставки
    getDeliveryMetrics: async (startDate, endDate) => {
        try {
            const response = await api.get('/analytics/delivery', {
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching delivery metrics:', error);
            throw error;
        }
    },

    // Получение ежедневных метрик доставки для графика трендов
    getDeliveryDailyMetrics: async (startDate, endDate) => {
        try {
            const response = await api.get('/analytics/delivery/daily', {
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching daily delivery metrics:', error);
            throw error;
        }
    },

    // Получение региональных метрик доставки
    getDeliveryRegionMetrics: async (startDate, endDate) => {
        try {
            const response = await api.get('/analytics/delivery/regions', {
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching delivery region metrics:', error);
            throw error;
        }
    },

    // Получение KPI метрик доставки для дашборда
    getDeliveryKPIs: async (startDate, endDate) => {
        try {
            const response = await api.get('/analytics/delivery/kpis', {
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching delivery KPIs:', error);
            throw error;
        }
    },

    // Получение метрик продуктов
    getProductMetrics: async (startDate, endDate, category) => {
        try {
            const response = await api.get('/analytics/products', {
                params: { startDate, endDate, category },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching product metrics:', error);
            throw error;
        }
    },

    // Получение прогнозов
    getForecasts: async () => {
        try {
            const response = await api.get('/analytics/forecasts');
            return response.data;
        } catch (error) {
            console.error('Error fetching forecasts:', error);
            throw error;
        }
    },

    // Получение региональных метрик
    getRegionMetrics: async (startDate, endDate) => {
        try {
            const response = await api.get('/analytics/regions', {
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching region metrics:', error);
            throw error;
        }
    },

    // Получение агрегированных аналитических данных
    getAggregatedAnalytics: async (period, startDate, endDate) => {
        try {
            const response = await api.get('/analytics/aggregated', {
                params: { period, startDate, endDate },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching aggregated analytics:', error);
            throw error;
        }
    },

    // Получение ДЕТАЛЬНЫХ метрик эффективности КОНКРЕТНОГО поставщика (НОВАЯ ФУНКЦИЯ)
    getSupplierPerformanceDetails: async (supplierId) => {
        try {
            const response = await api.get(`/analytics/supplier/${supplierId}/performance-details`);
            return response.data;
        } catch (error) {
            console.error('Error fetching supplier performance details:', error);
            throw error;
        }
    },

    // Получение данных для сравнительного анализа поставщиков
    getSupplierComparisonData: async (supplierIds, metricIds) => {
        // supplierIds is expected to be an array, metricIds an array
        try {
            const response = await api.get('/analytics/suppliers/comparison', {
                params: {
                    supplierIds: supplierIds.join(','), // Convert array to comma-separated string
                    metricIds: metricIds.join(',')    // Convert array to comma-separated string
                }
            });
            return response.data; // Expected: { success: true, data: [{ supplierId, supplierName, metric1: value, metric2: value ... }] }
        } catch (error) {
            console.error('Error fetching supplier comparison data:', error);
            throw error;
        }
    }
};

// API сервисы для работы с поставщиками
const supplierService = {
    // Получение всех поставщиков
    getSuppliers: async () => {
        try {
            const response = await api.get('/suppliers');
            return response.data;
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            throw error;
        }
    },

    // Получение конкретного поставщика
    getSupplier: async (id) => {
        try {
            const response = await api.get(`/suppliers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching supplier:', error);
            throw error;
        }
    },

    // Создание нового поставщика
    createSupplier: async (supplierData) => {
        try {
            const response = await api.post('/suppliers', supplierData);
            return response.data;
        } catch (error) {
            console.error('Error creating supplier:', error);
            throw error;
        }
    },

    // Обновление поставщика
    updateSupplier: async (id, supplierData) => {
        try {
            const response = await api.put(`/suppliers/${id}`, supplierData);
            return response.data;
        } catch (error) {
            console.error('Error updating supplier:', error);
            throw error;
        }
    },

    // Удаление поставщика
    deleteSupplier: async (id) => {
        try {
            const response = await api.delete(`/suppliers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting supplier:', error);
            throw error;
        }
    },
    
    // Получение рейтинга поставщика
    getSupplierRating: async (id) => {
        try {
            const response = await api.get(`/suppliers/${id}/rating`);
            return response.data;
        } catch (error) {
            console.error('Error fetching supplier rating:', error);
            throw error;
        }
    },
    
    // Получение товаров поставщика
    getSupplierProducts: async (id) => {
        try {
            const response = await api.get(`/suppliers/${id}/products`);
            return response.data;
        } catch (error) {
            console.error('Error fetching supplier products:', error);
            throw error;
        }
    },
    
    // Получение контрактов поставщика
    getSupplierContracts: async (id) => {
        try {
            const response = await api.get(`/suppliers/${id}/contracts`);
            return response.data;
        } catch (error) {
            console.error('Error fetching supplier contracts:', error);
            throw error;
        }
    }
};

// API сервисы для работы с заказами
const orderService = {
    // Получение всех заказов с фильтрацией
    getOrders: async (filters = {}) => {
        try {
            const response = await api.get('/orders', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    // Получение заказов для поставщика
    getSupplierOrders: async () => {
        try {
            const response = await api.get('/orders/supplier');
            return response.data;
        } catch (error) {
            console.error('Error fetching supplier orders:', error);
            throw error;
        }
    },

    // Получение заказа по ID
    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error;
        }
    },

    // Создание нового заказа
    createOrder: async (orderData) => {
        try {
            // Преобразуем данные в формат, ожидаемый сервером
            // В тестовом режиме сервер ожидает данные в следующем формате:
            const formattedOrderData = {
                // Если это тестовая среда, используем формат items
                items: orderData.products.map(product => ({
                    product: product.product,
                    quantity: product.quantity,
                    unitPrice: product.unitPrice,
                    totalPrice: product.quantity * product.unitPrice
                })),
                // Общая информация о заказе
                totalOrderValue: orderData.totalOrderValue,
                shippingAddress: orderData.shippingAddress,
                paymentMethod: orderData.paymentMethod,
                shippingMethod: orderData.shippingMethod,
                // Обратная совместимость с production API
                products: orderData.products.map(product => ({
                    product: product.product,
                    quantity: product.quantity,
                    unitPrice: product.unitPrice
                }))
            };

            const response = await api.post('/orders', formattedOrderData);
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    // Обновление статуса заказа
    updateOrderStatus: async (orderId, status, comment = '') => {
        try {
            const response = await api.patch(`/orders/${orderId}/status`, {
                status,
                comment,
                location: 'Web Interface'
            });
            return response.data;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    },

    // Получение заказов без назначенного сотрудника
    getOrdersWithoutEmployee: async () => {
        try {
            const response = await api.get('/orders/employee/without');
            return response.data;
        } catch (error) {
            console.error('Error fetching orders without employee:', error);
            throw error;
        }
    },

    // Назначение сотрудника на заказ
    assignEmployeeToOrder: async (orderId, employeeId) => {
        try {
            const response = await api.patch(`/orders/${orderId}/assign`, {
                employeeId
            });
            return response.data;
        } catch (error) {
            console.error('Error assigning employee to order:', error);
            throw error;
        }
    },
    
    // Получение подробной информации о заказе
    getOrderDetails: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    },
    
    // Отмена заказа
    cancelOrder: async (orderId, reason = '') => {
        try {
            const response = await api.patch(`/orders/${orderId}/status`, {
                status: 'Отменен',
                comment: reason,
                location: 'Web Interface'
            });
            return response.data;
        } catch (error) {
            console.error('Error canceling order:', error);
            throw error;
        }
    },
    
    // Добавление трекинг-номера
    addTrackingNumber: async (orderId, trackingNumber) => {
        try {
            const response = await api.patch(`/orders/${orderId}/tracking`, {
                trackingNumber
            });
            return response.data;
        } catch (error) {
            console.error('Error adding tracking number:', error);
            throw error;
        }
    },

    // Получение метрик поставщика (ПО НОВОМУ ЭНДПОИНТУ)
    getSupplierMetrics: async (supplierId) => {
        try {
            // Запрашиваем новый эндпоинт
            const response = await api.get(`/analytics/supplier/${supplierId}/metrics`); 
            return response.data; // Ожидаем { success: true, data: { totalOrders, ..., onTimeDeliveryPercentage, ... } }
        } catch (error) {
            console.error('Error fetching supplier metrics:', error);
            throw error;
        }
    },

    // Получение метрик заказов
    getOrderMetrics: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            
            if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
            if (filters.supplier) queryParams.append('supplier', filters.supplier);

            const response = await api.get(`/orders/analytics/summary?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order metrics:', error);
            throw error;
        }
    },

    // Подтверждение получения заказа
    confirmOrderReceipt: async (orderId) => {
        try {
            const response = await api.patch(`/orders/${orderId}/status`, {
                status: 'Получен',
                comment: 'Получение подтверждено клиентом',
                location: 'Web Interface'
            });
            return response.data;
        } catch (error) {
            console.error('Error confirming order receipt:', error);
            throw error;
        }
    },

    // Получение статистики по заказам для панели управления
    getDashboardStats: async () => {
        try {
            const response = await api.get('/orders/analytics/dashboard');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    // Экспорт заказов в Excel
    exportOrders: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
            if (filters.supplier) queryParams.append('supplier', filters.supplier);

            const response = await api.get(`/orders/export?${queryParams.toString()}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'orders.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting orders:', error);
            throw error;
        }
    },

    // Получение заказов без назначенного поставщика
    getUnclaimedOrders: async () => {
        try {
            const response = await api.get('/orders/unclaimed');
            return response.data;
        } catch (error) {
            console.error('Error fetching unclaimed orders:', error);
            throw error;
        }
    },
    
    // Назначение текущего поставщика на заказ (взятие заказа на выполнение)
    claimOrder: async (orderId) => {
        try {
            const response = await api.patch(`/orders/${orderId}/claim`);
            return response.data;
        } catch (error) {
            console.error('Error claiming order:', error);
            throw error;
        }
    },

    // Обновление информации по отслеживанию заказа
    updateOrderTracking: async (orderId, trackingData) => {
        try {
            const response = await api.put(`/orders/${orderId}/tracking`, trackingData);
            return response.data;
        } catch (error) {
            console.error('Error updating order tracking:', error);
            throw error;
        }
    }
};

// API сервисы для работы с авторизацией
const authService = {
    // Вход в систему
    login: async (email, password, role) => {
        try {
            const response = await api.post('/auth/login', { email, password, role });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.userInfo));
            }
            return response.data;
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    },

    // Выход из системы
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Получение текущего пользователя
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    // Регистрация пользователя
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
        }
    },
    
    // Обновление профиля пользователя
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/auth/profile', profileData);
            // Обновляем данные пользователя в localStorage
            if (response.data.userInfo) {
                const currentUser = JSON.parse(localStorage.getItem('user'));
                localStorage.setItem('user', JSON.stringify({...currentUser, ...response.data.userInfo}));
            }
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },
    
    // Сброс пароля
    resetPassword: async (email) => {
        try {
            const response = await api.post('/auth/reset-password', { email });
            return response.data;
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    }
};

// API сервисы для работы с продуктами
const productService = {
    // Получение всех продуктов (с фильтрацией и пагинацией)
    getProducts: async (filters = {}) => {
        try {
            // filters can include: category, supplierId, isActive, search, sortBy, order, page, limit
            const queryParams = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== '') {
                    queryParams.append(key, filters[key]);
                }
            });
            const response = await api.get(`/products?${queryParams.toString()}`);
            return response.data; // Expects { products, currentPage, totalPages, totalProducts }
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },
    
    // Получение одного продукта
    getProduct: async (id) => {
        try {
            const response = await api.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },
    
    // Создание продукта
    createProduct: async (productData) => {
        try {
            const response = await api.post('/products', productData);
            return response.data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },
    
    // Обновление продукта
    updateProduct: async (id, productData) => {
        try {
            const response = await api.put(`/products/${id}`, productData);
            return response.data;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },
    
    // Удаление продукта
    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },
    
    // Обновление количества товара на складе
    updateProductStock: async (id, quantityChange) => {
        try {
            const response = await api.patch(`/products/${id}/stock`, { quantityChange });
            return response.data;
        } catch (error) {
            console.error('Error updating product stock:', error);
            throw error;
        }
    }
};

// API сервисы для работы с контрактами
const contractService = {
    // Получение всех контрактов
    getContracts: async () => {
        try {
            const response = await api.get('/contracts');
            return response.data;
        } catch (error) {
            console.error('Error fetching contracts:', error);
            throw error;
        }
    },

    // Получение контрактов поставщика
    getSupplierContracts: async (supplierId) => {
        try {
            const response = await api.get(`/contracts/supplier/${supplierId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching supplier contracts:', error);
            throw error;
        }
    },

    // Получение контракта по ID
    getContract: async (id) => {
        try {
            const response = await api.get(`/contracts/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching contract:', error);
            throw error;
        }
    },

    // Создание нового контракта
    createContract: async (contractData) => {
        try {
            const response = await api.post('/contracts', contractData);
            return response.data;
        } catch (error) {
            console.error('Error creating contract:', error);
            throw error;
        }
    },

    // Обновление контракта
    updateContract: async (id, contractData) => {
        try {
            const response = await api.put(`/contracts/${id}`, contractData);
            return response.data;
        } catch (error) {
            console.error('Error updating contract:', error);
            throw error;
        }
    },

    // Удаление контракта
    deleteContract: async (id) => {
        try {
            const response = await api.delete(`/contracts/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting contract:', error);
            throw error;
        }
    }
};

// API сервисы для работы с клиентами
const clientService = {
    // Получение всех клиентов
    getClients: async () => {
        try {
            const response = await api.get('/clients');
            return response.data;
        } catch (error) {
            console.error('Error fetching clients:', error);
            throw error;
        }
    },
    
    // Получение клиента по ID
    getClientById: async (clientId) => {
        try {
            const response = await api.get(`/clients/${clientId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching client:', error);
            throw error;
        }
    },
    
    // Создание клиента
    createClient: async (clientData) => {
        try {
            const response = await api.post('/clients', clientData);
            return response.data;
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    },
    
    // Обновление клиента
    updateClient: async (id, clientData) => {
        try {
            const response = await api.put(`/clients/${id}`, clientData);
            return response.data;
        } catch (error) {
            console.error('Error updating client:', error);
            throw error;
        }
    },
    
    // Удаление клиента
    deleteClient: async (id) => {
        try {
            const response = await api.delete(`/clients/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    },

    // Получение отчета по продажам
    getSalesReport: async (params = {}) => {
        // params: { startDate, endDate, groupBy }
        try {
            const queryParams = new URLSearchParams();
            if (params.startDate) queryParams.append('startDate', params.startDate.toISOString().split('T')[0]);
            if (params.endDate) queryParams.append('endDate', params.endDate.toISOString().split('T')[0]);
            if (params.groupBy) queryParams.append('groupBy', params.groupBy);
            
            const response = await api.get(`/reports/sales?${queryParams.toString()}`);
            return response.data; // Ожидаем { success: true, data: [...] }
        } catch (error) {
            console.error('Error fetching sales report:', error);
            throw error;
        }
    }
};

// API сервисы для работы с сотрудниками
const employeeService = {
    // Получение всех сотрудников
    getEmployees: async () => {
        try {
            const response = await api.get('/employees');
            return response.data;
        } catch (error) {
            console.error('Error fetching employees:', error);
            throw error;
        }
    },
    
    // Получение информации о сотруднике
    getEmployee: async (id) => {
        try {
            const response = await api.get(`/employees/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching employee:', error);
            throw error;
        }
    },
    
    // Создание сотрудника
    createEmployee: async (employeeData) => {
        try {
            const response = await api.post('/employees', employeeData);
            return response.data;
        } catch (error) {
            console.error('Error creating employee:', error);
            throw error;
        }
    },
    
    // Обновление сотрудника
    updateEmployee: async (id, employeeData) => {
        try {
            const response = await api.put(`/employees/${id}`, employeeData);
            return response.data;
        } catch (error) {
            console.error('Error updating employee:', error);
            throw error;
        }
    },
    
    // Удаление сотрудника
    deleteEmployee: async (id) => {
        try {
            const response = await api.delete(`/employees/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting employee:', error);
            throw error;
        }
    }
};

// API сервисы для работы с корзиной
const cartService = {
    // Получение корзины
    getCart: async () => {
        try {
            // Получаем корзину из localStorage
            const cartData = localStorage.getItem('cart');
            if (!cartData) {
                // Если корзины нет, возвращаем пустую корзину
                return { items: [], subtotal: 0 };
            }
            
            // Парсим данные корзины
            const cart = JSON.parse(cartData);
            
            // Обновляем поля продуктов, если они есть
            if (cart.items && cart.items.length > 0) {
                // Получаем список всех ID продуктов из корзины
                const productIds = cart.items.map(item => item.productId);
                
                // Получаем актуальные данные о продуктах из API
                // только если у нас есть ID продукта, а не объект
                if (typeof productIds[0] === 'string') {
                    try {
                        // Запрашиваем продукты по их ID
                        const products = await Promise.all(
                            productIds.map(id => productService.getProduct(id))
                        );
                        
                        // Обновляем данные продуктов в корзине
                        cart.items = cart.items.map((item, index) => {
                            const product = products[index];
                            if (product) {
                                return {
                                    ...item,
                                    productId: product
                                };
                            }
                            return item;
                        });
                        
                        // Сохраняем обновленную корзину в localStorage
                        localStorage.setItem('cart', JSON.stringify(cart));
                    } catch (err) {
                        console.error('Error updating product data in cart:', err);
                    }
                }
            }
            
            // Вычисляем общую сумму корзины
            cart.subtotal = cart.items.reduce((total, item) => {
                return total + (item.quantity * item.unitPrice);
            }, 0);
            
            return cart;
        } catch (err) {
            console.error("Error fetching cart:", err);
            return { items: [], subtotal: 0 };
        }
    },
    
    // Добавление товара в корзину
    addToCart: async (productId, quantity = 1) => {
        try {
            // Получаем информацию о продукте
            const product = await productService.getProduct(productId);
            if (!product) {
                throw new Error('Товар не найден');
            }
            
            // Получаем текущую корзину
            let cart = JSON.parse(localStorage.getItem('cart') || '{"items":[]}');
            
            // Проверяем, есть ли товар уже в корзине
            const existingItemIndex = cart.items.findIndex(
                item => (item.productId._id || item.productId) === productId
            );
            
            if (existingItemIndex !== -1) {
                // Если товар уже есть, увеличиваем количество
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                // Если товара нет, добавляем его
                cart.items.push({
                    _id: new Date().getTime().toString(), // Временный ID для операций с элементом корзины
                    productId: product,
                    quantity: quantity,
                    unitPrice: product.price
                });
            }
            
            // Вычисляем общую сумму
            cart.subtotal = cart.items.reduce((total, item) => {
                return total + (item.quantity * item.unitPrice);
            }, 0);
            
            // Сохраняем корзину в localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            return cart;
        } catch (err) {
            console.error("Error adding to cart:", err);
            throw err;
        }
    },
    
    // Удаление товара из корзины
    removeCartItem: async (itemId) => {
        try {
            // Получаем текущую корзину
            let cart = JSON.parse(localStorage.getItem('cart') || '{"items":[]}');
            
            // Фильтруем элементы, удаляя тот, который нужно удалить
            cart.items = cart.items.filter(item => item._id !== itemId);
            
            // Пересчитываем общую сумму
            cart.subtotal = cart.items.reduce((total, item) => {
                return total + (item.quantity * item.unitPrice);
            }, 0);
            
            // Сохраняем обновленную корзину
            localStorage.setItem('cart', JSON.stringify(cart));
            
            return cart;
        } catch (err) {
            console.error("Error removing from cart:", err);
            throw err;
        }
    },
    
    // Обновление количества товара в корзине
    updateCartItemQuantity: async (itemId, quantity) => {
        try {
            // Получаем текущую корзину
            let cart = JSON.parse(localStorage.getItem('cart') || '{"items":[]}');
            
            // Находим элемент, который нужно обновить
            const itemIndex = cart.items.findIndex(item => item._id === itemId);
            
            if (itemIndex === -1) {
                throw new Error('Товар не найден в корзине');
            }
            
            // Обновляем количество
            cart.items[itemIndex].quantity = quantity;
            
            // Пересчитываем общую сумму
            cart.subtotal = cart.items.reduce((total, item) => {
                return total + (item.quantity * item.unitPrice);
            }, 0);
            
            // Сохраняем обновленную корзину
            localStorage.setItem('cart', JSON.stringify(cart));
            
            return cart;
        } catch (err) {
            console.error("Error updating cart item quantity:", err);
            throw err;
        }
    },
    
    // Очистка корзины
    clearCart: async () => {
        try {
            // Создаем пустую корзину
            const emptyCart = { items: [], subtotal: 0 };
            
            // Сохраняем пустую корзину
            localStorage.setItem('cart', JSON.stringify(emptyCart));
            
            return emptyCart;
        } catch (err) {
            console.error("Error clearing cart:", err);
            throw err;
        }
    }
};

// API сервисы для работы с уведомлениями
const notificationService = {
    // Получение уведомлений
    getNotifications: async () => {
        try {
            const response = await api.get('/notifications');
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },
    
    // Отметка уведомления как прочитанное
    markAsRead: async (notificationId) => {
        try {
            const response = await api.put(`/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },
    
    // Удаление уведомления
    deleteNotification: async (notificationId) => {
        try {
            const response = await api.delete(`/notifications/${notificationId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    },
    
    // Отметка всех уведомлений как прочитанные
    markAllAsRead: async () => {
        try {
            const response = await api.put('/notifications/mark-all-read');
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },
    
    // Получение количества непрочитанных уведомлений
    getUnreadCount: async () => {
        try {
            const notifications = await notificationService.getNotifications();
            return notifications.filter(n => !n.isRead).length;
        } catch (error) {
            console.error('Error getting unread notifications count:', error);
            throw error;
        }
    }
};

// API сервисы для работы с отчетами
const reportService = {
    // Получение отчета по продажам
    getSalesReport: async (params = {}) => {
        // params: { startDate, endDate, groupBy }
        try {
            const queryParams = new URLSearchParams();
            if (params.startDate) queryParams.append('startDate', params.startDate.toISOString().split('T')[0]);
            if (params.endDate) queryParams.append('endDate', params.endDate.toISOString().split('T')[0]);
            if (params.groupBy) queryParams.append('groupBy', params.groupBy);
            
            const response = await api.get(`/reports/sales?${queryParams.toString()}`);
            return response.data; // Ожидаем { success: true, data: [...] }
        } catch (error) {
            console.error('Error fetching sales report:', error);
            throw error;
        }
    },

    // Получение отчета по эффективности поставщиков (можно добавить позже)
    // getSupplierPerformanceReport: async (params = {}) => { ... }
};

// Create variables for services mentioned in export but not defined
const reviewService = {};
const zoneService = {};
const uploadService = {};

// Single export statement with all services
export {
    api,
    orderService,
    authService,
    productService,
    employeeService,
    supplierService,
    notificationService,
    contractService,
    analyticsService,
    cartService,
    reportService,
    clientService,
    reviewService,
    zoneService,
    uploadService
};

export default api; 