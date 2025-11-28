import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import './Auth.css';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }
        
        try {
            setError('');
            setLoading(true);
            
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    emailRedirectTo: `${window.location.origin}/`,
                },
            });
            
            if (signUpError) {
                throw signUpError;
            }
            
            // Si el registro requiere confirmación por correo
            if (authData.user) {
                navigate('/registro-exitoso', { state: { email } });
            }
            
        } catch (error) {
            console.error('Error al registrarse:', error);
            setError(error.message || 'Error al crear la cuenta. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Crear Cuenta</h2>
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="fullName">Nombre Completo</label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="Tu nombre completo"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="tu@email.com"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Mínimo 6 caracteres"
                            minLength="6"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Vuelve a escribir tu contraseña"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Creando cuenta...' : 'Registrarse'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="auth-link">
                            Inicia sesión aquí
                        </Link>
                    </p>
                    <p className="terms-text">
                        Al registrarte, aceptas nuestros{' '}
                        <Link to="/terminos" className="auth-link">
                            Términos de Servicio
                        </Link>{' '}
                        y{' '}
                        <Link to="/privacidad" className="auth-link">
                            Política de Privacidad
                        </Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
