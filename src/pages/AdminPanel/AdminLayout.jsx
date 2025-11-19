// Archivo: src/components/admin/AdminLayout.jsx

import React, { useState } from 'react';
// 💡 Importamos useNavigate para la redirección
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChartBar, 
    faStore, 
    faBox, 
    faSignOutAlt,
    faBars, 
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import './AdminLayout.css'; 
import Swal from 'sweetalert2'; // Opcional: Para una confirmación más bonita

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate(); // 💡 Inicializamos useNavigate

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const isActive = (path) => location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));

    // 💡 FUNCIÓN PARA CERRAR SESIÓN
    const handleLogout = async () => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "¿Quieres cerrar tu sesión actual?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#e74c3c",
            cancelButtonColor: "#3498db",
            confirmButtonText: "Sí, Cerrar Sesión",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            // 1. Eliminar el token de autenticación
            localStorage.removeItem('token');
            
            // 2. Opcional: Eliminar cualquier otra información de usuario/rol
            // localStorage.removeItem('userRole'); 

            // 3. Redirigir al usuario a la página de login (o la página principal)
            navigate('/login'); // Ajusta esta ruta a donde deba ir el usuario no autenticado

            Swal.fire('¡Sesión Cerrada!', 'Has salido del panel de administración.', 'success');
        }
    };

    return (
        <div className={`admin-layout-container ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
            
            {/* 1. Sidebar de Navegación */}
            <aside className={`admin-sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
                <div className="admin-logo">Admin Panel</div>
                <nav className="admin-nav">
                    <Link to="/admin" className={`nav-item ${isActive("/admin") ? 'active' : ''}`}>
                        <FontAwesomeIcon icon={faChartBar} style={{ marginRight: '10px' }} />
                        Dashboard
                    </Link>
                    <Link to="/admin/comercios" className={`nav-item ${isActive("/admin/comercios") ? 'active' : ''}`}>
                        <FontAwesomeIcon icon={faStore} style={{ marginRight: '10px' }} />
                        Gestión Comercios
                    </Link>
                    <Link to="/admin/pedidos" className={`nav-item ${isActive("/admin/pedidos") ? 'active' : ''}`}>
                        <FontAwesomeIcon icon={faBox} style={{ marginRight: '10px' }} />
                        Gestión Pedidos
                    </Link>
                </nav>
            </aside>

            {/* 2. Contenido Principal */}
            <main className="admin-main-content">
                <header className="admin-header">
                    {/* Botón para ocultar/mostrar la barra lateral */}
                    <button onClick={toggleSidebar} className="toggle-sidebar-btn">
                        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
                    </button>
                    
                    <h1>Administración del Sistema</h1>
                    
                    {/* 💡 Conectamos el botón a la nueva función handleLogout */}
                    <button onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '8px' }} />
                        Cerrar Sesión
                    </button>
                </header>
                
                <div className="admin-page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;