import React from 'react';
import { logger } from '../lib/logger';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        logger.error("ErrorBoundary caught an error:", { error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="app" style={{ justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
                    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <div className="login-ornament">◆ ◆ ◆</div>
                        <h2 className="login-title" style={{ fontSize: '28px' }}>Interrupción en la Gala</h2>
                        <p style={{ color: '#8a7a5a', margin: '20px 0', fontStyle: 'italic' }}>
                            Lo sentimos, ha ocurrido un error inesperado en la aplicación.
                        </p>
                        <button
                            className="btn solid"
                            onClick={() => window.location.reload()}
                        >
                            Reiniciar Aplicación
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
