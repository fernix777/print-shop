import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import toast, { Toaster } from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import './AdminCustomers.css'

export default function AdminCustomers() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState(null)

    useEffect(() => {
        loadCustomers()
    }, [])

    const loadCustomers = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
            
            if (error) throw error
            setCustomers(data || [])
        } catch (error) {
            console.error('Error loading customers:', error)
            toast.error('Error al cargar clientes')
        } finally {
            setLoading(false)
        }
    }

    const filteredCustomers = customers.filter(customer => {
        const term = searchTerm.toLowerCase()
        const email = customer.email?.toLowerCase() || ''
        const name = customer.full_name?.toLowerCase() || ''
        const shippingName = customer.shipping_data?.full_name?.toLowerCase() || ''
        
        return email.includes(term) || name.includes(term) || shippingName.includes(term)
    })

    const handleViewDetails = (customer) => {
        setSelectedCustomer(customer)
    }

    const [resetLoading, setResetLoading] = useState(false)

    const handlePasswordReset = async () => {
        if (!selectedCustomer?.email) return
        
        if (!window.confirm(`¿Enviar correo de restablecimiento de contraseña a ${selectedCustomer.email}?`)) {
            return
        }

        setResetLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(selectedCustomer.email, {
                redirectTo: `${window.location.origin}/actualizar-contrasena`,
            })

            if (error) throw error
            toast.success('Correo de recuperación enviado exitosamente')
        } catch (error) {
            console.error('Error sending reset email:', error)
            toast.error('Error al enviar correo: ' + error.message)
        } finally {
            setResetLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="admin-customers-page">
            <Toaster position="top-right" />
            
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/admin/dashboard" className="btn-back">
                        ⬅️ Volver
                    </Link>
                    <h1>Clientes Registrados</h1>
                </div>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="customers-table-container">
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Teléfono</th>
                                <th>Ubicación</th>
                                <th>Registrado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map(customer => (
                                    <tr key={customer.id}>
                                        <td>
                                            <div className="customer-name">
                                                {customer.full_name || customer.shipping_data?.full_name || 'Sin nombre'}
                                            </div>
                                        </td>
                                        <td>{customer.email}</td>
                                        <td>{customer.shipping_data?.phone || '-'}</td>
                                        <td>
                                            {customer.shipping_data?.city ? 
                                                `${customer.shipping_data.city}, ${customer.shipping_data.province}` : 
                                                '-'
                                            }
                                        </td>
                                        <td>{formatDate(customer.created_at)}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleViewDetails(customer)}
                                                className="btn-view"
                                            >
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-results">
                                        No se encontraron clientes
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedCustomer && (
                <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
                    <div className="customer-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Detalles del Cliente</h2>
                            <button className="close-btn" onClick={() => setSelectedCustomer(null)}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="detail-section">
                                <h3>Información de Cuenta</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>ID:</label>
                                        <span>{selectedCustomer.id}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Correo (Usuario):</label>
                                        <span className="highlight">{selectedCustomer.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Nombre Registrado:</label>
                                        <span>{selectedCustomer.full_name || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Fecha Registro:</label>
                                        <span>{formatDate(selectedCustomer.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedCustomer.shipping_data && (
                                <div className="detail-section">
                                    <h3>Datos de Envío</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Nombre Recibe:</label>
                                            <span>{selectedCustomer.shipping_data.full_name || '-'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Teléfono:</label>
                                            <span className="highlight">{selectedCustomer.shipping_data.phone || '-'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Dirección:</label>
                                            <span>{selectedCustomer.shipping_data.address || '-'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Ciudad/Provincia:</label>
                                            <span>
                                                {selectedCustomer.shipping_data.city}, {selectedCustomer.shipping_data.province}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Código Postal:</label>
                                            <span>{selectedCustomer.shipping_data.postal_code || '-'}</span>
                                        </div>
                                        <div className="detail-item full-width">
                                            <label>Observaciones:</label>
                                            <p>{selectedCustomer.shipping_data.observations || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                <div className="action-buttons">
                                    <button 
                                        className="btn-reset-password"
                                        onClick={handlePasswordReset}
                                        disabled={resetLoading}
                                    >
                                        {resetLoading ? 'Enviando...' : '📧 Enviar Correo de Recuperación'}
                                    </button>
                                </div>
                                <p className="help-text">
                                    * Esta acción enviará un correo al cliente para que pueda restablecer su contraseña.
                                </p>
                                <button className="btn-close" onClick={() => setSelectedCustomer(null)}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
