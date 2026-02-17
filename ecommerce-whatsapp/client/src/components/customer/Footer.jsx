import { Link } from 'react-router-dom'
import logo from '../../assets/images/print-shop-logo.png'
import './Footer.css'

export default function Footer() {
    return (
        <footer className="store-footer">
            <div className="footer-container">
                {/* Columna 1: Logo y descripción */}
                <div className="footer-column">
                    <div className="footer-logo">
                        <img src={logo} alt="Print Shop" />
                        <div className="logo-text">
                            <span className="logo-bold">PRINT</span>
                            <span className="logo-light">SHOP</span>
                        </div>
                    </div>
                    <p>Personalizamos tus ideas en remeras, tazas, buzos y gorras con la mejor calidad.</p>
                </div>

                {/* Columna 2: Links */}
                <div className="footer-column">
                    <h4>Enlaces</h4>
                    <ul>
                        <li><Link to="/">Inicio</Link></li>
                        <li><Link to="/productos">Productos</Link></li>
                        <li><Link to="/categorias">Categorías</Link></li>
                        <li><Link to="/contacto">Contacto</Link></li>
                    </ul>
                </div>

                {/* Columna 3: Contacto */}
                <div className="footer-column">
                    <h4>Contacto</h4>
                    <ul>
                        <li>📧 info@printshop.com.ar</li>
                        <li>📱 WhatsApp: +54 9 376 501-6293</li>
                        <li>📍 Posadas, Misiones, Argentina</li>
                    </ul>
                    <div className="footer-payments">
                        <p className="footer-payments-title">Aceptamos todas las formas de pago</p>
                        <div className="footer-payment-logos">
                            <img
                                src="/assets/payments/visa.png"
                                alt="Visa"
                                className="payment-logo-img"
                            />
                            <img
                                src="/assets/payments/mastercard.png"
                                alt="Mastercard"
                                className="payment-logo-img"
                            />
                            <img
                                src="/assets/payments/amex.png"
                                alt="American Express"
                                className="payment-logo-img"
                            />
                            <img
                                src="/assets/payments/mercado-pago.png"
                                alt="Mercado Pago"
                                className="payment-logo-img"
                            />
                        </div>
                    </div>
                </div>

                {/* Columna 4: Redes Sociales */}
                <div className="footer-column">
                    <h4>Síguenos</h4>
                    <div className="social-links">
                        <a href="https://www.instagram.com/printshopjujuy" target="_blank" rel="noopener noreferrer" className="social-link">
                            📷 Instagram
                        </a>
                        <a href="https://wa.me/5493765016293" target="_blank" rel="noopener noreferrer" className="social-link">
                            +5493765016293
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Print Shop. Todos los derechos reservados.</p>
            </div>
        </footer>
    )
}
