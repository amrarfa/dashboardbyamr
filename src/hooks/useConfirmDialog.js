import { useState, useCallback } from 'react'

/**
 * Simple hook for managing global confirm dialogs
 * Provides a clean API for showing confirmation dialogs throughout the project
 */
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    isLoading: false,
    onConfirm: null,
    closeOnBackdrop: true,
    closeOnEscape: true
  })

  // Show confirmation dialog
  const showConfirm = useCallback((options) => {
    setDialogState(prev => ({
      ...prev,
      isOpen: true,
      isLoading: false,
      ...options
    }))
  }, [])

  // Hide dialog
  const hideDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      isOpen: false,
      isLoading: false
    }))
  }, [])

  // Set loading state
  const setLoading = useCallback((loading) => {
    setDialogState(prev => ({
      ...prev,
      isLoading: loading
    }))
  }, [])

  // Handle confirm action
  const handleConfirm = useCallback(async () => {
    if (dialogState.onConfirm) {
      try {
        setLoading(true)
        await dialogState.onConfirm()
        hideDialog()
      } catch (error) {
        console.error('Confirm action failed:', error)
        setLoading(false)
      }
    }
  }, [dialogState.onConfirm, setLoading, hideDialog])

  // Handle cancel action
  const handleCancel = useCallback(() => {
    hideDialog()
  }, [hideDialog])

  // Preset dialog types for common use cases
  const confirmDelete = useCallback((message, onConfirm) => {
    showConfirm({
      title: 'Delete Item',
      message: message || 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm
    })
  }, [showConfirm])

  const confirmSave = useCallback((message, onConfirm) => {
    showConfirm({
      title: 'Save Changes',
      message: message || 'Do you want to save your changes?',
      confirmText: 'Save',
      type: 'success',
      onConfirm
    })
  }, [showConfirm])

  const confirmAction = useCallback((title, message, onConfirm, type = 'danger') => {
    showConfirm({
      title,
      message,
      confirmText: 'Confirm',
      type,
      onConfirm
    })
  }, [showConfirm])

  return {
    // State
    isOpen: dialogState.isOpen,
    isLoading: dialogState.isLoading,

    // Actions
    showConfirm,
    hideDialog,
    setLoading,

    // Preset dialogs
    confirmDelete,
    confirmSave,
    confirmAction,

    // Dialog props (spread these to ConfirmDialog component)
    dialogProps: {
      isOpen: dialogState.isOpen,
      onClose: handleCancel,
      onConfirm: handleConfirm,
      title: dialogState.title,
      message: dialogState.message,
      confirmText: dialogState.confirmText,
      cancelText: dialogState.cancelText,
      type: dialogState.type,
      isLoading: dialogState.isLoading,
      closeOnBackdrop: dialogState.closeOnBackdrop,
      closeOnEscape: dialogState.closeOnEscape
    }
  }
}

export default useConfirmDialog
