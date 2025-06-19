import React, { useState } from 'react'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import useConfirmDialog from '../hooks/useConfirmDialog'
import { useToast } from '../contexts/ToastContext'
import { Trash2, Save, Download, Upload, RefreshCw } from 'lucide-react'

/**
 * Simple examples showing how to use the global ConfirmDialog
 * This demonstrates the simplified, reusable dialog for the entire project
 */
const ConfirmDialogExamples = () => {
  const { success, error, info } = useToast()
  const dialog = useConfirmDialog()

  // Manual dialog state (alternative approach)
  const [showManualDialog, setShowManualDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Example: Delete with hook
  const handleDeleteWithHook = () => {
    dialog.confirmDelete(
      'Are you sure you want to delete this user account? This action cannot be undone.',
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        success('User deleted successfully!')
      }
    )
  }

  // Example: Save with hook
  const handleSaveWithHook = () => {
    dialog.confirmSave(
      'Save your changes to this document?',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1500))
        success('Document saved successfully!')
      }
    )
  }

  // Example: Custom action with hook
  const handleCustomAction = () => {
    dialog.confirmAction(
      'Export Data',
      'This will export all customer data to a CSV file. Continue?',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 3000))
        success('Export completed successfully!')
      },
      'info'
    )
  }

  // Example: Warning action
  const handleWarningAction = () => {
    dialog.confirmAction(
      'Reset Settings',
      'This will reset all settings to default values. Are you sure?',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        success('Settings reset successfully!')
      },
      'warning'
    )
  }

  // Example: Manual dialog with custom buttons
  const handleManualDialog = () => {
    setShowManualDialog(true)
  }

  const handleManualConfirm = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      success('Action completed!')
      setShowManualDialog(false)
    } catch (err) {
      error('Action failed!')
    } finally {
      setIsLoading(false)
    }
  }

  // Example: Custom dialog with multiple actions
  const handleMultipleActions = () => {
    dialog.showConfirm({
      title: 'Choose Action',
      message: 'What would you like to do with this item?',
      type: 'question',
      size: 'lg',
      customButtons: [
        {
          text: 'Cancel',
          onClick: dialog.hideDialog,
          className: 'btn-secondary'
        },
        {
          text: 'Archive',
          onClick: async () => {
            await new Promise(resolve => setTimeout(resolve, 1000))
            info('Item archived')
            dialog.hideDialog()
          },
          icon: <Save className="h-4 w-4" />,
          className: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        },
        {
          text: 'Delete',
          onClick: async () => {
            await new Promise(resolve => setTimeout(resolve, 1000))
            success('Item deleted')
            dialog.hideDialog()
          },
          icon: <Trash2 className="h-4 w-4" />,
          loading: true,
          loadingText: 'Deleting...',
          className: 'bg-red-600 hover:bg-red-700 text-white'
        }
      ]
    })
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">ConfirmDialog Examples</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Hook-based examples */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Hook-based Dialogs</h2>

          <button
            onClick={handleDeleteWithHook}
            className="w-full btn-danger"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </button>

          <button
            onClick={handleSaveWithHook}
            className="w-full btn-success"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Document
          </button>

          <button
            onClick={handleExportWithHook}
            className="w-full btn-primary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>

          <button
            onClick={handleUnsavedChanges}
            className="w-full btn-warning"
          >
            Unsaved Changes
          </button>
        </div>

        {/* Custom examples */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Custom Dialogs</h2>

          <button
            onClick={handleManualDialog}
            className="w-full btn-secondary"
          >
            Manual Dialog
          </button>

          <button
            onClick={handleMultipleActions}
            className="w-full btn-outline"
          >
            Multiple Actions
          </button>

          <button
            onClick={() => dialog.confirmRefresh({
              onConfirm: async () => {
                await new Promise(resolve => setTimeout(resolve, 1000))
                success('Data refreshed!')
              }
            })}
            className="w-full btn-info"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
        </div>

        {/* Size examples */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Different Sizes</h2>

          <button
            onClick={() => dialog.showConfirm({
              title: 'Small Dialog',
              message: 'This is a small dialog.',
              size: 'sm',
              onConfirm: () => info('Small confirmed!')
            })}
            className="w-full btn-outline"
          >
            Small Dialog
          </button>

          <button
            onClick={() => dialog.showConfirm({
              title: 'Large Dialog',
              message: 'This is a large dialog with more space for content.',
              size: 'lg',
              details: (
                <div className="space-y-4">
                  <p>This dialog has more space for detailed information.</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Feature 1</li>
                    <li>Feature 2</li>
                    <li>Feature 3</li>
                  </ul>
                </div>
              ),
              onConfirm: () => info('Large confirmed!')
            })}
            className="w-full btn-outline"
          >
            Large Dialog
          </button>

          <button
            onClick={() => dialog.showConfirm({
              title: 'Extra Large Dialog',
              message: 'This is an extra large dialog.',
              size: 'xl',
              onConfirm: () => info('XL confirmed!')
            })}
            className="w-full btn-outline"
          >
            XL Dialog
          </button>
        </div>
      </div>

      {/* Hook-based dialog (automatically managed) */}
      <ConfirmDialog {...dialog.dialogProps} />

      {/* Manual dialog example */}
      <ConfirmDialog
        isOpen={showManualDialog}
        onClose={() => setShowManualDialog(false)}
        onConfirm={handleManualConfirm}
        title="Manual Dialog"
        message="This dialog is managed manually without the hook."
        confirmText="Process"
        type="info"
        isLoading={isLoading}
        details={
          <div className="text-sm text-gray-600 dark:text-gray-300">
            This demonstrates manual state management for more complex scenarios.
          </div>
        }
      />
    </div>
  )
}

export default ConfirmDialogExamples
