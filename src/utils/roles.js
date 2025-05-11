// Определение ролей пользователей в системе
export const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  SUPPLIER: 'supplier',
  CLIENT: 'client'
};

// Определение доступных страниц и функционала для каждой роли
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    title: 'Администратор',
    description: 'Полный доступ ко всем функциям системы',
    pages: [
      'dashboard',
      'suppliers',
      'clients',
      'employees',
      'orders',
      'contracts',
      'products',
      'analytics',
      'reports',
      'admin-reports',
      'deliveries',
      'settings',
      'notifications',
      'user-management',
      'admin-dashboard',
      'admin-products'
    ],
    actions: [
      'create-user',
      'edit-user',
      'delete-user',
      'approve-contract',
      'view-financial',
      'manage-system',
      'update-order-status'
    ]
  },
  [ROLES.EMPLOYEE]: {
    title: 'Сотрудник компании',
    description: 'Работа с заказами, контрактами и поставщиками',
    pages: [
      'dashboard',
      'suppliers',
      'orders',
      'contracts',
      'products',
      'analytics',
      'reports',
      'tasks',
      'delivery-tracking',
      'analytics'
    ],
    actions: [
      'create-order',
      'edit-order',
      'contact-supplier',
      'manage-contracts',
      'process-order',
      'view-analytics',
      'track-deliveries'
    ]
  },
  [ROLES.SUPPLIER]: {
    title: 'Поставщик',
    description: 'Управление своими товарами и заказами',
    pages: [
      'dashboard',
      'products',
      'orders',
      'contracts',
      'performance',
      'notifications'
    ],
    actions: [
      'view-orders',
      'update-order-status',
      'manage-products',
      'view-performance',
      'update-profile'
    ]
  },
  [ROLES.CLIENT]: {
    title: 'Клиент',
    description: 'Размещение и отслеживание заказов',
    pages: [
      'dashboard',
      'products',
      'orders', 
      'cart'
    ],
    actions: [
      'place-order',
      'track-order',
      'manage-cart',
      'view-history',
      'update-profile'
    ]
  }
};

// Функция для проверки доступа к странице
export const hasPageAccess = (role, pageName) => {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.pages.includes(pageName) || false;
};

// Функция для проверки доступа к действию
export const hasActionAccess = (role, actionName) => {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.actions.includes(actionName) || false;
}; 