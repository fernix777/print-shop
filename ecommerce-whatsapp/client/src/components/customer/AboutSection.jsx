import './AboutSection.css';
import {
    FaBookOpen,
    FaTruckFast,
    FaStore,
    FaMotorcycle,
    FaMapLocationDot,
    FaCircleCheck,
    FaShieldHalved,
    FaWhatsapp,
    FaStar
} from 'react-icons/fa6';

export default function AboutSection() {
    return (
        <section className="about-section">
            <div className="about-container">
                <div className="about-header">
                    <h2 className="about-title">Nosotros</h2>
                    <p className="about-subtitle">Conoce más sobre nuestra historia y servicios</p>
                </div>

                <div className="about-content">
                    {/* Historia de la Empresa */}
                    <div className="about-card history-card">
                        <div className="card-icon">
                            <FaShieldHalved />
                        </div>
                        <h3>Nuestra Historia</h3>
                        <span className="history-subtitle">Impresión personalizada con calidad y detalle</span>
                        <div className="history-body">
                            <p>
                                Print Shop nació con la misión de transformar tus ideas en productos tangibles de alta calidad.
                                Especializados en impresión personalizada, nos dedicamos a plasmar diseños únicos en remeras,
                                tazas, buzos y gorras.
                            </p>
                            <p>
                                Utilizamos las mejores técnicas de sublimación y estampado para garantizar durabilidad y
                                colores vibrantes en cada pieza que creamos para vos.
                            </p>
                        </div>
                    </div>

                    {/* Métodos de Envío */}
                    <div className="about-card shipping-card">
                        <div className="card-icon">
                            <FaTruckFast />
                        </div>
                        <h3>Métodos de Envío</h3>
                        <p>Hacemos llegar tus productos de forma rápida y segura:</p>
                        <ul className="shipping-list">
                            <li>
                                <span className="shipping-icon"><FaMapLocationDot /></span>
                                <div>
                                    <strong>Envío Nacional</strong>
                                    <p>
                                        Trabajamos con Correo Argentino, con producción de la prenda entre 5 y 7 días
                                        y envío a domicilio o sucursal en todo el país.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Valores adicionales */}
                <div className="values-section">
                    <div className="value-item">
                        <span className="value-icon"><FaShieldHalved /></span>
                        <h4>Compra Segura</h4>
                        <p>Protección de datos</p>
                    </div>
                    <div className="value-item">
                        <span className="value-icon"><FaWhatsapp /></span>
                        <h4>Atención Personalizada</h4>
                        <p>Soporte por WhatsApp</p>
                    </div>
                    <div className="value-item">
                        <span className="value-icon"><FaStar /></span>
                        <h4>Mejores Precios</h4>
                        <p>Ofertas exclusivas</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
