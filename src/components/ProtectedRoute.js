import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPageAccess } from '../utils/roles';

 
const ProtectedRoute = ({ children, requiredRole, pageName }) => {
    const { currentUser, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    
    if (loading) {
        return null;
    }

    
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

   
    if (requiredRole) {
        
        if (Array.isArray(requiredRole)) {
            
            if (!requiredRole.includes(currentUser.role)) {
                console.log(`Доступ запрещен: роль ${currentUser.role} не входит в список разрешенных: ${requiredRole.join(', ')}`);
                return <Navigate to="/access-denied" replace />;
            }
        } 
         
        else if (currentUser.role !== requiredRole) {
            console.log(`Доступ запрещен: роль ${currentUser.role} не соответствует требуемой ${requiredRole}`);
            return <Navigate to="/access-denied" replace />;
        }
    }

    
    if (pageName && !hasPageAccess(currentUser.role, pageName)) {
        console.log(`Доступ запрещен: у роли ${currentUser.role} нет доступа к странице ${pageName}`);
        return <Navigate to="/access-denied" replace />;
    }

    return children;
};

export default ProtectedRoute; 