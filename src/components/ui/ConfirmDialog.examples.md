# Global ConfirmDialog - Simple & Reusable

A clean, simple confirmation dialog component for the entire project. No model dependencies, just confirmation messages and two buttons.

## Basic Usage

```jsx
import ConfirmDialog from '../components/ui/ConfirmDialog'

// Simple confirmation
<ConfirmDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  onConfirm={handleConfirm}
  title="Confirm Action"
  message="Are you sure you want to proceed?"
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | - | Controls dialog visibility |
| `onClose` | function | - | Called when dialog should close |
| `onConfirm` | function | - | Called when user confirms |
| `title` | string | "Confirm Action" | Dialog title |
| `message` | string | "Are you sure..." | Main message |
| `confirmText` | string | "Confirm" | Confirm button text |
| `cancelText` | string | "Cancel" | Cancel button text |
| `type` | string | "danger" | Dialog type (see types below) |
| `isLoading` | boolean | false | Shows loading state |
| `closeOnBackdrop` | boolean | true | Close when clicking backdrop |
| `closeOnEscape` | boolean | true | Close when pressing Escape |

## Types

### danger (Red) - Default
```jsx
<ConfirmDialog
  type="danger"
  title="Delete Item"
  message="This action cannot be undone."
  confirmText="Delete"
/>
```

### warning (Yellow)
```jsx
<ConfirmDialog
  type="warning"
  title="Unsaved Changes"
  message="You have unsaved changes."
  confirmText="Continue"
/>
```

### info (Blue)
```jsx
<ConfirmDialog
  type="info"
  title="Information"
  message="This will update your settings."
  confirmText="Update"
/>
```

### success (Green)
```jsx
<ConfirmDialog
  type="success"
  title="Success"
  message="Operation completed successfully."
  confirmText="Continue"
/>
```

### question (Gray)
```jsx
<ConfirmDialog
  type="question"
  title="Choose Option"
  message="How would you like to proceed?"
  confirmText="Yes"
/>
```

## Using with Hook (Recommended)

```jsx
import useConfirmDialog from '../hooks/useConfirmDialog'

const MyComponent = () => {
  const dialog = useConfirmDialog()

  const handleDelete = () => {
    dialog.confirmDelete(
      'Are you sure you want to delete this item?',
      async () => {
        await deleteItem()
        success('Item deleted!')
      }
    )
  }

  const handleSave = () => {
    dialog.confirmSave(
      'Save your changes?',
      async () => {
        await saveChanges()
        success('Changes saved!')
      }
    )
  }

  const handleCustomAction = () => {
    dialog.confirmAction(
      'Custom Title',
      'Custom message here',
      async () => {
        await performAction()
        success('Action completed!')
      },
      'warning' // type: danger, warning, info, success, question
    )
  }

  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleCustomAction}>Custom</button>

      {/* Single dialog handles all confirmations */}
      <ConfirmDialog {...dialog.dialogProps} />
    </>
  )
}
```

## Manual Usage

```jsx
const [showDialog, setShowDialog] = useState(false)
const [isLoading, setIsLoading] = useState(false)

const handleConfirm = async () => {
  setIsLoading(true)
  try {
    await performAction()
    success('Action completed!')
    setShowDialog(false)
  } catch (error) {
    showError('Action failed!')
  } finally {
    setIsLoading(false)
  }
}

<ConfirmDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  onConfirm={handleConfirm}
  title="Custom Dialog"
  message="Are you sure?"
  confirmText="Yes, Do It"
  cancelText="No, Cancel"
  type="danger"
  isLoading={isLoading}
/>
```

## Real-World Examples

### Delete Customer (Current Implementation)
```jsx
<ConfirmDialog
  isOpen={showDeleteDialog}
  onClose={handleCancelDelete}
  onConfirm={handleConfirmDelete}
  title="Delete Customer"
  message="Are you sure you want to delete this customer? This action cannot be undone."
  confirmText="Delete Customer"
  type="danger"
  isLoading={isDeleting}
/>
```

### Export Data
```jsx
const handleExport = () => {
  dialog.confirmAction(
    'Export Data',
    'This will export all customer data to a CSV file. Continue?',
    async () => {
      await exportData()
      success('Export completed!')
    },
    'info'
  )
}
```

### Reset Settings
```jsx
const handleReset = () => {
  dialog.confirmAction(
    'Reset Settings',
    'This will reset all settings to default values. Are you sure?',
    async () => {
      await resetSettings()
      success('Settings reset successfully!')
    },
    'warning'
  )
}
```

### Logout Confirmation
```jsx
const handleLogout = () => {
  dialog.confirmAction(
    'Logout',
    'Are you sure you want to logout?',
    async () => {
      await logout()
      info('Logged out successfully')
    },
    'question'
  )
}
```

## Best Practices

1. **Use the hook**: Prefer `useConfirmDialog` for cleaner code
2. **Clear messages**: Be specific about what will happen
3. **Appropriate types**: Match dialog type to action severity
4. **Handle loading**: Always show loading feedback for async operations
5. **Toast integration**: Combine with toast notifications for complete UX
6. **Mobile friendly**: All dialogs are responsive by default

## Global Usage Pattern

```jsx
// In any component throughout the project
import useConfirmDialog from '../hooks/useConfirmDialog'
import { useToast } from '../contexts/ToastContext'

const AnyComponent = () => {
  const dialog = useConfirmDialog()
  const { success, error } = useToast()

  const handleAnyAction = () => {
    dialog.confirmAction(
      'Action Title',
      'Confirmation message here',
      async () => {
        try {
          await performAction()
          success('Action completed!')
        } catch (err) {
          error('Action failed!')
        }
      },
      'danger' // or 'warning', 'info', 'success', 'question'
    )
  }

  return (
    <>
      <button onClick={handleAnyAction}>Perform Action</button>
      <ConfirmDialog {...dialog.dialogProps} />
    </>
  )
}
```

This pattern works for any action in any component across the entire project!
