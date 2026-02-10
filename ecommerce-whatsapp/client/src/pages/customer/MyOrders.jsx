import { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { supabase } from '../../config/supabase'
import Header from '../../components/customer/Header'
import Footer from '../../components/customer/Footer'
import WhatsAppButton from '../../components/customer/WhatsAppButton'
import './MyOrders.css'

export default function MyOrders() {
    const { user, loading: authLoading } = useContext(AuthContext)
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/auth/login?redirect=/mis-pedidos')
            return
        }

        if (user) {
            loadOrders()
        }
    }, [user, authLoading])

    const loadOrders = async () => {
        try {
            // Intentar cargar pedidos de la tabla orders
            const { data: ordersData, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items:order_items(
                        *,
                        product:products(
                            id, 
                            name, 
                            slug,
                            product_images(image_url, is_primary)
                        )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error && error.code !== 'PGRST116') {
                // Si la tabla no existe, mostrar mensaje
                console.log('Tabla orders no disponible:', error.message)
                setOrders([])
                setLoading(false)
                return
            }

            if (ordersData) {
                setOrders(ordersData)
            }
        } catch (error) {
            console.error('Error loading orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'status-pending'
            case 'confirmed': return 'status-confirmed'
            case 'shipped': return 'status-shipped'
            case 'delivered': return 'status-delivered'
            case 'cancelled': return 'status-cancelled'
            default: return 'status-default'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pendiente'
            case 'confirmed': return 'Confirmado'
            case 'shipped': return 'Enviado'
            case 'delivered': return 'Entregado'
            case 'cancelled': return 'Cancelado'
            default: return status
        }
    }

    if (authLoading || loading) {
        return (
            <div className="my-orders-page">
                <Header />
                <main className="orders-main">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Cargando pedidos...</p>
                    </div>
                </main>
                <Footer />
                <WhatsAppButton />
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="my-orders-page">
            <Header />

            <main className="orders-main">
                <div className="orders-container">
                    <div className="orders-header">
                        <h1>Mis Pedidos</h1>
                        <Link to="/mi-cuenta" className="btn btn-outline">
                            ← Volver a Mi Cuenta
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <div className="no-orders">
                            <div className="no-orders-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                    <line x1="3" y1="6" x2="21" y2="6"/>
                                    <path d="M16 10a4 4 0 0 1-8 0"/>
                                </svg>
                            </div>
                            <h2>No tienes pedidos aún</h2>
                            <p>Cuando realices tu primer pedido, podrás ver el historial aquí.</p>
                            <Link to="/" className="btn btn-primary">
                                Ir a la Tienda
                            </Link>
                        </div>
                    ) : (
                        <div className="orders-grid">
                            {orders.map(order => (
                                <div 
                                    key={order.id} 
                                    className="order-summary-card"
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <div className="order-summary-header">
                                        <span className="order-id">#{String(order.id).padStart(6, '0')}</span>
                                        <span className={`order-status ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                    
                                    <div className="order-summary-info">
                                        <div className="info-item">
                                            <span className="label">Fecha:</span>
                                            <span className="value">
                                                {new Date(order.created_at).toLocaleDateString('es-AR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Items:</span>
                                            <span className="value">{order.order_items?.length || 0}</span>
                                        </div>
                                        <div className="info-item total">
                                            <span className="label">Total:</span>
                                            <span className="value price">
                                                ${parseFloat(order.total).toLocaleString('es-AR')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="order-summary-footer">
                                        <button className="btn-view-details">
                                            Ver Detalle
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Order Details Modal */}
                    {selectedOrder && (
                        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <div className="modal-title">
                                        <h2>Pedido #{String(selectedOrder.id).padStart(6, '0')}</h2>
                                        <span className={`order-status ${getStatusColor(selectedOrder.status)}`}>
                                            {getStatusText(selectedOrder.status)}
                                        </span>
                                    </div>
                                    <button className="btn-close" onClick={() => setSelectedOrder(null)}>
                                        ×
                                    </button>
                                </div>

                                <div className="modal-body">
                                    <div className="order-date-full">
                                        Realizado el {new Date(selectedOrder.created_at).toLocaleDateString('es-AR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>

                                    <div className="order-items">
                                        {selectedOrder.order_items?.map((item, index) => {
                                            const imgUrl = item.product?.product_images?.find(img => img.is_primary)?.image_url || 
                                                         item.product?.product_images?.[0]?.image_url;
                                            
                                            return (
                                            <div key={index} className="order-item">
                                                {imgUrl ? (
                                                    <img 
                                                        src={imgUrl} 
                                                        alt={item.product?.name || item.product_name}
                                                        className="item-image"
                                                    />
                                                ) : (
                                                    <div className="item-image-placeholder">Sin imagen</div>
                                                )}
                                                <div className="item-details">
                                                    <Link 
                                                        to={item.product?.slug ? `/producto/${item.product.slug}` : '#'}
                                                        className="item-name"
                                                        onClick={(e) => !item.product?.slug && e.preventDefault() || setSelectedOrder(null)}
                                                    >
                                                        {item.product?.name || item.product_name || item.name}
                                                    </Link>
                                                    <span className="item-quantity">Cantidad: {item.quantity}</span>
                                                </div>
                                                <span className="item-price">
                                                    ${parseFloat(item.price).toLocaleString('es-AR')}
                                                </span>
                                            </div>
                                            )
                                        })}
                                    </div>

                                    <div className="order-summary-total">
                                        <div className="total-row">
                                            <span>Subtotal</span>
                                            <span>${parseFloat(selectedOrder.total).toLocaleString('es-AR')}</span>
                                        </div>
                                        <div className="total-row final">
                                            <span>Total</span>
                                            <span>${parseFloat(selectedOrder.total).toLocaleString('es-AR')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    {selectedOrder.status === 'pending' && (
                                        <a 
                                            href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '5491112345678'}?text=Hola,%20quiero%20confirmar%20mi%20pedido%20#${selectedOrder.id.slice(-8).toUpperCase()}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-whatsapp"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                                            Coordinar Pago/Envío
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
            <WhatsAppButton />
        </div>
    )
}
