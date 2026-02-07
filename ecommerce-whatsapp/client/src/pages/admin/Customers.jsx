import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCustomers, getCustomerDetails, sendPasswordReset } from '../../services/customerService'
import toast, { Toaster } from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import './Customers.css'

export default function Customers() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadCustomers()
    }, [])

    const loadCustomers = async () => {
        setLoading(true)
        const { data, error } = await getCustomers()
        if (error) {
            toast.error('Error al cargar clientes')
        } else {
            setCustomers(data || [])
        }
        setLoading(false)
    }

    const handleSelectCustomer = async (customer) => {
        setLoadingDetails(true)
        setSelectedCustomer(customer) // Show basic info immediately
        
        const { data, error } = await getCustomerDetails(customer.id)
        if (error) {
            toast.error('Error al cargar detalles del cliente')
        } else {
            setSelectedCustomer(data) // Update with full details (orders, etc.)
        }
        setLoadingDetails(false)
    }

    const handleCloseModal = () => {
        setSelectedCustomer(null)
    }

    const handlePasswordReset = async (email) => {
        if (!window.confirm(`¿Enviar correo de recuperación de contraseña a ${email}?`)) return

        const loadingToast = toast.loading('Enviando correo...')
        const { error } = await sendPasswordReset(email)
        toast.dismiss(loadingToast)

        if (error) {
            toast.error('Error al enviar correo: ' + error.message)
        } else {
            toast.success('Correo de recuperación enviado')
        }
    }

    const filteredCustomers = customers.filter(c => 
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id?.includes(searchTerm)
    )

    return (
        <div className="customers-page">
            <Toaster position="top-right" />
            
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/admin/dashboard" className="btn-back">
                        ⬅️
                    </Link>
                    <h1>Clientes Registrados</h1>
                </div>
            </div>

            <div className="customers-content">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar por email, nombre o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : filteredCustomers.length === 0 ? (
                    <div className="empty-state">
                        <p>No se encontraron clientes.</p>
                    </div>
                ) : (
                    <div className="customers-list">
                        <table className="customers-table">
                            <thead>
                                <tr>
                                    <th>Email (Usuario)</th>
                                    <th>Nombre</th>
                                    <th>Fecha Registro</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map(customer => (
                                    <tr key={customer.id}>
                                        <td>{customer.email}</td>
                                        <td>{customer.full_name || 'N/A'}</td>
                                        <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button 
                                                className="btn-view"
                                                onClick={() => handleSelectCustomer(customer)}
                                            >
                                                Ver Datos
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                        
                        <div className="customer-details-header">
                            <h2>Datos del Cliente</h2>
                            <p className="customer-id">ID: {selectedCustomer.id}</p>
                        </div>

                        <div className="customer-info-grid">
                            <div className="info-section">
                                <h3>Información Personal</h3>
                                <p><strong>Email:</strong> {selectedCustomer.email}</p>
                                <p><strong>Nombre:</strong> {selectedCustomer.full_name || 'No registrado'}</p>
                                <p><strong>Teléfono:</strong> {selectedCustomer.phone || 'No registrado'}</p>
                                
                                <div className="action-buttons">
                                    <button 
                                        className="btn-reset-password"
                                        onClick={() => handlePasswordReset(selectedCustomer.email)}
                                    >
                                        📧 Enviar Reset de Contraseña
                                    </button>
                                </div>
                            </div>

                            <div className="info-section">
                                <h3>Datos de Envío</h3>
                                {selectedCustomer.shipping_data ? (
                                    <div className="shipping-data">
                                        <p>{selectedCustomer.shipping_data.address}</p>
                                        <p>{selectedCustomer.shipping_data.city}, {selectedCustomer.shipping_data.state}</p>
                                        <p>CP: {selectedCustomer.shipping_data.zip_code}</p>
                                    </div>
                                ) : (
                                    <p className="no-data">Sin datos de envío guardados</p>
                                )}
                            </div>
                        </div>

                        <div className="orders-section">
                            <h3>Historial de Pedidos ({selectedCustomer.orders?.length || 0})</h3>
                            {loadingDetails ? (
                                <p>Cargando historial...</p>
                            ) : selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                                <div className="orders-list-mini">
                                    {selectedCustomer.orders.map(order => (
                                        <div key={order.id} className="order-item-mini">
                                            <span>#{order.id.slice(0, 8)}</span>
                                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                            <span className={`status-badge ${order.status}`}>{order.status}</span>
                                            <span>${order.total}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">No hay pedidos registrados</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
