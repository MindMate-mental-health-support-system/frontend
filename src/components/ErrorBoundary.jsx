import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service here
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    backgroundColor: '#050509',
                    color: '#f8fafc',
                    fontFamily: "'Outfit', sans-serif"
                }}>
                    <div style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        padding: '2rem',
                        borderRadius: '24px',
                        maxWidth: '600px',
                        width: '100%'
                    }}>
                        <h1 style={{ color: '#f43f5e', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            Oops! Something went wrong.
                        </h1>
                        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            The application encountered an unexpected error. This has been logged and we'll look into it.
                            In the meantime, you can try refreshing the page.
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                border: 'none',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                marginBottom: '2rem'
                            }}
                        >
                            Refresh Application
                        </button>

                        {this.state.error && (
                            <details style={{ whiteSpace: 'pre-wrap', color: '#f43f5e', fontSize: '0.85rem', opacity: 0.8, overflowX: 'auto' }}>
                                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>View Error Details</summary>
                                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginTop: '0.5rem' }}>
                                    {this.state.error.toString()}
                                    <br />
                                    {this.state.errorInfo?.componentStack}
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
