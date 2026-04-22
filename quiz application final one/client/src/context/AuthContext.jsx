import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                setUser(JSON.parse(userInfo));
            } catch (error) {
                console.error("Failed to parse userInfo from localStorage:", error);
                localStorage.removeItem('userInfo');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        if (!data.isPendingVerification) {
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
        }
        return data;
    };

    const updateUser = (newData) => {
        const merged = { ...user, ...newData };
        setUser(merged);
        localStorage.setItem('userInfo', JSON.stringify(merged));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, updateUser, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
