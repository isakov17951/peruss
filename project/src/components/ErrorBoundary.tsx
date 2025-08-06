import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Обновляем состояние, чтобы следующий рендер показал fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Логируем ошибку для мониторинга
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Здесь можно отправить ошибку в сервис мониторинга
    // например, Sentry, LogRocket, или собственный сервис
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // В production здесь будет отправка в сервис мониторинга
    if (process.env.NODE_ENV === 'production') {
      // Пример отправки в сервис мониторинга:
      // Sentry.captureException(error, { extra: errorInfo });
      console.error('Production error logged:', { error, errorInfo });
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    // Перезагружаем страницу для полного сброса состояния
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Если передан кастомный fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Иначе показываем красивый UI ошибки
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-8 py-6 text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">Упс! Что-то пошло не так</h1>
              <p className="text-red-100">Произошла неожиданная ошибка в приложении</p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-4">
                  Не волнуйтесь, мы уже знаем об этой проблеме и работаем над её исправлением.
                </p>
                
                {/* Показываем детали ошибки только в development */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="text-left bg-gray-50 rounded-lg p-4 mb-4">
                    <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                      Детали ошибки (только для разработки)
                    </summary>
                    <div className="text-sm text-gray-600 font-mono">
                      <div className="mb-2">
                        <strong>Ошибка:</strong> {this.state.error.message}
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong>Стек:</strong>
                          <pre className="whitespace-pre-wrap text-xs mt-1">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-lg transform hover:scale-105"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Попробовать снова</span>
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-md transform hover:scale-105"
                >
                  <Home className="w-5 h-5" />
                  <span>На главную</span>
                </button>
              </div>

              {/* Help text */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Если проблема повторяется, попробуйте обновить страницу или очистить кэш браузера
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC для оборачивания компонентов в ErrorBoundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;