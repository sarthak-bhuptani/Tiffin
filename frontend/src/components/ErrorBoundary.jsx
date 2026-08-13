import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Uncaught Error:', error, errorInfo);
  }

  handleReload = () => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    window.location.reload(true);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4 font-sans text-center">
          <div className="bg-white rounded-3xl p-6 border border-orange-200 shadow-md max-w-sm w-full space-y-4">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
              🍱
            </div>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">
              મોમ્સ સ્પેશિયલ ટિફિન સર્વિસ
            </h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              એપ્લિકેશનમાં નવું અપડેટ આવ્યું છે. કૃપા કરીને નીચેના બટન પર ક્લિક કરીને રિફ્રેશ કરો.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-600/30 transition active:scale-95"
            >
              🔄 એપ રિફ્રેશ કરો (Refresh App)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
