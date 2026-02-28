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

            // 3. No slot yet — count rows to decide which slot to assign
            const { count, error: countError } = await supabase
                .from('user_slots')
                .select('*', { count: 'exact', head: true });

            if (countError) {
                setError('Error al asignar slot de usuario.');
                setLoading(false);
                return;
            }

            const slot = count === 0 ? 'p1' : 'p2';

            // 4. Insert the slot assignment
            const { error: insertError } = await supabase
                .from('user_slots')
                .insert({ user_id: userId, slot });

            if (insertError) {
                setError('Error al guardar el slot de usuario.');
                setLoading(false);
                return;
            }

            onLogin(slot);
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
                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            disabled={loading}
                        />
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
