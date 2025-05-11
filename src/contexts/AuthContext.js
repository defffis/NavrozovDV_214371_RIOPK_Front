import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';
import { hasActionAccess } from '../utils/roles';

 
const AuthContext = createContext();

 
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

     
    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
        setLoading(false);
    }, []);

  
    const login = async (email, password, role) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.login(email, password, role);
            setCurrentUser(data.userInfo);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Ошибка при входе в систему';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    
    const logout = () => {
        authService.logout();
        setCurrentUser(null);
    };

 
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.register(userData);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Ошибка при регистрации';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

   
    const hasRole = (role) => {
        if (!currentUser) return false;
        return currentUser.role === role;
    };
    
  
    const canPerformAction = (actionName) => {
        if (!currentUser || !currentUser.role) return false;
        return hasActionAccess(currentUser.role, actionName);
    };
    
 
    const updateProfile = async (profileData) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.updateProfile(profileData);
            setCurrentUser(prev => ({...prev, ...data.userInfo}));
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Ошибка при обновлении профиля';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    
    const value = {
        currentUser,
        loading,
        error,
        login,
        logout,
        register,
        hasRole,
        canPerformAction,
        updateProfile,
        isAuthenticated: !!currentUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

 
export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext; 