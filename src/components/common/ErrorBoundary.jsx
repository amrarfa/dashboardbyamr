import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
              <div className="text-center">
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
                  Error Loading Customer Form
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  There was an error loading the customer creation form.
                </p>
                <details className="text-left bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4">
                  <summary className="cursor-pointer font-medium">Error Details</summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                    className="btn-secondary"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => this.props.onClose && this.props.onClose()}
                    className="btn-primary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
