import { useState } from 'react';
import { supabase } from './supabaseClient';
import './styles/oscars.css';

/**
 * LoginScreen
 * - No registration; users are pre-created in Supabase Auth.
 * - On success, checks/creates a row in user_slots and calls onLogin(slot).
 */
export default function LoginScreen({ onLogin, setAdminOpen }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Sign in
            const { data: authData, error: authError } =
                await supabase.auth.signInWithPassword({ email, password });

            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }

            const userId = authData.user.id;

            // 2. Check if this user already has a slot
            const { data: existing, error: fetchError } = await supabase
                .from('user_slots')
                .select('slot')
                .eq('user_id', userId)
                .maybeSingle();

            if (fetchError) {
                setError('Error al verificar el slot de usuario.');
                setLoading(false);
                return;
            }

            if (existing) {
                onLogin(existing.slot);
                return;
            }

            // 3. No slot yet — Count existing slots BEFORE assigning a new one
            // We use { count: 'exact', head: true } to get the total number of assigned slots
            const { count, error: countError } = await supabase
                .from('user_slots')
                .select('*', { count: 'exact', head: true });

            if (countError) {
                setError('Error al determinar la disponibilidad de slots.');
                setLoading(false);
                return;
            }

            // 4. Assign slot: first user gets p1, second user (or any subsequent) gets p2
            const assignedSlot = (count === 0) ? 'p1' : 'p2';

            // 5. Insert the new slot assignment
            const { error: insertError } = await supabase
                .from('user_slots')
                .insert({ user_id: userId, slot: assignedSlot });

            if (insertError) {
                setError('Error al guardar el slot de usuario.');
                setLoading(false);
                return;
            }

            onLogin(assignedSlot);
        } catch (err) {
            setError('Error inesperado. Intente nuevamente.');
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <div className="login-card">
                {/* Decorative header */}
                <div className="login-ornament">◆ ◆ ◆</div>
                <h2 className="login-title">
                    <span
                        onClick={() => setAdminOpen(true)}
                        style={{ cursor: "pointer" }}
                        title="Panel de Administración"
                    >
                        Academia
                    </span>
                </h2>
                <p className="login-subtitle">Acceso privado · Temporada 2026</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label htmlFor="login-email" className="login-label">Correo electrónico</label>
                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="login-password" className="login-label">Contraseña</label>
                        <div style={{ position: "relative" }}>
                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                                disabled={loading}
                                style={{ width: "100%", paddingRight: "40px" }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: showPassword ? "#C9A84C" : "#666",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "5px"
                                }}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && <p className="login-error">{error}</p>}

                    <button
                        id="login-submit"
                        type="submit"
                        className="btn solid"
                        disabled={loading}
                    >
                        {loading ? 'Ingresando…' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
