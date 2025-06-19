import React, { useEffect } from 'react'
import { X, AlertTriangle, Trash2, Info, CheckCircle, HelpCircle } from 'lucide-react'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // 'danger', 'warning', 'info', 'success', 'question'
  isLoading = false,
  closeOnBackdrop = true,
  closeOnEscape = true
}) => {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <Trash2 className="h-6 w-6" />,
          iconBg: 'bg-red-100 dark:bg-red-900/20',
          iconColor: 'text-red-600 dark:text-red-400',
          confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
          titleColor: 'text-red-600 dark:text-red-400'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6" />,
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 text-white',
          titleColor: 'text-yellow-600 dark:text-yellow-400'
        }
      case 'success':
        return {
          icon: <CheckCircle className="h-6 w-6" />,
          iconBg: 'bg-green-100 dark:bg-green-900/20',
          iconColor: 'text-green-600 dark:text-green-400',
          confirmBtn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white',
          titleColor: 'text-green-600 dark:text-green-400'
        }
      case 'question':
        return {
          icon: <HelpCircle className="h-6 w-6" />,
          iconBg: 'bg-gray-100 dark:bg-gray-700',
          iconColor: 'text-gray-600 dark:text-gray-400',
          confirmBtn: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white',
          titleColor: 'text-gray-600 dark:text-gray-400'
        }
      case 'info':
      default:
        return {
          icon: <Info className="h-6 w-6" />,
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
          titleColor: 'text-blue-600 dark:text-blue-400'
        }
    }
  }

  const styles = getTypeStyles()

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeOnEscape, onClose])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all w-full max-w-md">
          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className={`rounded-full p-3 ${styles.iconBg}`}>
                <div className={styles.iconColor}>
                  {styles.icon}
                </div>
              </div>
            </div>

            {/* Title */}
            <h3 className={`text-lg font-semibold text-center mb-2 ${styles.titleColor}`}>
              {title}
            </h3>

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              {message}
            </p>

            {/* Two Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
              {/* Cancel Button */}
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelText}
              </button>

              {/* Confirm Button */}
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${styles.confirmBtn}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
