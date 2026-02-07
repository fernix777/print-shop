import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import './Auth.css';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        if (password.length < 6) {
            return setError('La contraseña debe tener al menos 6 caracteres');
        }

        try {
            setError('');
            setLoading(true);

            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                throw updateError;
            }

            setSuccess(true);
            
            // Redirigir al inicio después de 3 segundos
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (error) {
            console.error('Error al actualizar contraseña:', error);
            setError(error.message || 'Error al actualizar la contraseña. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Actualizar Contraseña</h2>

                {error && <div className="error-message">{error}</div>}
                
                {success ? (
                    <div className="success-message-container">
                        <div className="success-icon">✓</div>
                        <h3>¡Contraseña Actualizada!</h3>
                        <p>Tu contraseña ha sido actualizada exitosamente.</p>
                        <p className="redirect-message">Serás redirigido al inicio en unos segundos...</p>
                        <Link to="/" className="btn btn-primary btn-block">
                            Volver al Inicio
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="auth-description">
                            Ingresa tu nueva contraseña. Asegúrate de que tenga al menos 6 caracteres.
                        </p>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="password">Nueva Contraseña</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                    minLength="6"
                                    autoComplete="new-password"
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
                                    autoComplete="new-password"
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                            </button>
                        </form>
                    </>
                )}

                <div className="auth-footer">
                    <p>
                        ¿Recordaste tu contraseña?{' '}
                        <Link to="/login" className="auth-link">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
