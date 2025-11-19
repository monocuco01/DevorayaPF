// Archivo: src/pages/AdminPanel/AdminPanel.jsx

import AdminLayout from './AdminLayout'; 
import Adashboard from './Adashboard';
import Comercios from './Comercios'; 
import APedidos from './APedidos';
import { Routes, Route } from 'react-router-dom'; 
import React from 'react';

export const AdminPanel = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminLayout />}>
                
             
                <Route index element={<Adashboard />} /> 
              

                {/* 2. Comercios */}
                <Route path="comercios" element={<Comercios />} /> 
                
                {/* 3. Pedidos */}
                <Route path="pedidos" element={<APedidos />} />

            </Route>
        </Routes>
    );
};