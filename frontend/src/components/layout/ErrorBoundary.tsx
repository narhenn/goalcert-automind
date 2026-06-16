import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 40,
          maxWidth: 600,
          margin: '80px auto',
          background: '#fff',
          border: '1px solid #e8e3f4',
          borderRadius: 14,
          fontFamily: 'Poppins, sans-serif',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e11d48', marginBottom: 12 }}>
            Something went wrong
          </h2>
          <pre style={{
            background: '#0c1322',
            color: '#f87171',
            padding: 16,
            borderRadius: 10,
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            overflow: 'auto',
            maxHeight: 300,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              borderRadius: 11,
              border: 'none',
              background: '#4902A2',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
