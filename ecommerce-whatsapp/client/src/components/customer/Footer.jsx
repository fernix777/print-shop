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
                        <li>📱 WhatsApp: +54 388 517-1795</li>
                        <li>📍 San Salvador de Jujuy, Argentina</li>
                    </ul>
                </div>

                {/* Columna 4: Redes Sociales */}
                <div className="footer-column">
                    <h4>Síguenos</h4>
                    <div className="social-links">
                        <a href="https://www.instagram.com/printshopjujuy" target="_blank" rel="noopener noreferrer" className="social-link">
                            📷 Instagram
                        </a>
                        <a href="https://wa.me/543885171795" target="_blank" rel="noopener noreferrer" className="social-link">
                            💬 WhatsApp
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
