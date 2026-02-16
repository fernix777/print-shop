// src/pages/auth/RegistrationSuccess.jsx
import { Link, useLocation } from 'react-router-dom';
import { FaEnvelope, FaCheck, FaHome } from 'react-icons/fa';
import './Auth.css';

export default function RegistrationSuccess() {
    const location = useLocation();
    const { email = 'tu correo electrónico' } = location.state || {};

    return (
        <div className="auth-container">
            <div className="auth-card success-card">
                <div className="success-icon">
                    <div className="icon-circle">
                        <FaCheck />
                    </div>
                </div>
                
                <h2>¡Registro Exitoso!</h2>
                <p className="success-message">
                    Gracias por registrarte en Print Shop. Sigue estos pasos para activar tu cuenta:
                </p>
                
                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Revisa tu correo electrónico</h3>
                            <p>Hemos enviado un enlace de confirmación a <strong>{email}</strong>.</p>
                        </div>
                    </div>
                    
                    <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Busca el correo de confirmación</h3>
                            <p>Revisa tu bandeja de entrada o la carpeta de spam.</p>
                            <div className="email-tip">
                                <FaEnvelope className="email-icon" />
                                <span>Asunto: "Confirma tu correo electrónico - Print Shop"</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Haz clic en el enlace de confirmación</h3>
                            <p>Esto verificará tu dirección de correo electrónico y activará tu cuenta.</p>
                        </div>
                    </div>
                </div>
                
                <div className="additional-info">
                    <p>¿No has recibido el correo? <button className="resend-link">Reenviar correo de confirmación</button></p>
                    <p>¿Tienes alguna pregunta? <Link to="/contacto" className="contact-link">Contáctanos</Link></p>
                </div>
                
                <Link to="/" className="btn btn-primary btn-home">
                    <FaHome className="btn-icon" /> Volver al Inicio
                </Link>
            </div>
        </div>
    );
}