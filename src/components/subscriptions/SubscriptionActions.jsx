import React, { useState } from 'react'
import {
  Play,
  Pause,
  Edit3,
  XCircle,
  Calendar,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import {
  holdSubscription,
  resumeSubscription,
  cancelSubscription,
  modifySubscription
} from '../../services/manageSubscriptionApi'

const SubscriptionActions = ({ subscriptionData, onUpdate }) => {
  const { success, showError } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [actionType, setActionType] = useState('')
  const [reason, setReason] = useState('')

  const handleAction = async (action) => {
    if (!subscriptionData?.id) {
      showError('No subscription selected')
      return
    }

    setActionType(action)
    
    // Actions that require confirmation
    if (['hold', 'cancel'].includes(action)) {
      setShowConfirmDialog(true)
      return
    }

    // Direct actions
    await executeAction(action)
  }

  const executeAction = async (action, actionReason = '') => {
    setIsLoading(true)
    try {
      let result
      
      switch (action) {
        case 'hold':
          result = await holdSubscription(subscriptionData.id, actionReason)
          success('Subscription put on hold successfully')
          break
        case 'resume':
          result = await resumeSubscription(subscriptionData.id)
          success('Subscription resumed successfully')
          break
        case 'cancel':
          result = await cancelSubscription(subscriptionData.id, actionReason)
          success('Subscription cancelled successfully')
          break
        case 'modify':
          // This would open a modification dialog in a real implementation
          showError('Modification dialog not implemented yet')
          return
        default:
          showError('Unknown action')
          return
      }

      // Refresh the subscription data
      if (onUpdate) {
        onUpdate()
      }
      
      setShowConfirmDialog(false)
      setReason('')
    } catch (error) {
      showError(`Failed to ${action} subscription: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmAction = () => {
    executeAction(actionType, reason)
  }

  const actions = [
    {
      id: 'hold',
      label: 'Hold Subscription',
      icon: Pause,
      color: 'orange',
      description: 'Temporarily pause deliveries',
      disabled: subscriptionData?.status?.current === 'Hold'
    },
    {
      id: 'resume',
      label: 'Resume Subscription',
      icon: Play,
      color: 'green',
      description: 'Resume paused deliveries',
      disabled: subscriptionData?.status?.current !== 'Hold'
    },
    {
      id: 'modify',
      label: 'Modify Plan',
      icon: Edit3,
      color: 'blue',
      description: 'Change subscription details',
      disabled: false
    },
    {
      id: 'addDays',
      label: 'Add Days',
      icon: Plus,
      color: 'purple',
      description: 'Extend subscription period',
      disabled: false
    },
    {
      id: 'changeDate',
      label: 'Change Start Date',
      icon: Calendar,
      color: 'indigo',
      description: 'Modify delivery schedule',
      disabled: false
    },
    {
      id: 'cancel',
      label: 'Cancel Subscription',
      icon: XCircle,
      color: 'red',
      description: 'Permanently cancel subscription',
      disabled: subscriptionData?.status?.current === 'Cancelled'
    }
  ]

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Actions</h3>
            <p className="text-gray-600 dark:text-gray-400">Manage subscription settings and status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              disabled={action.disabled || isLoading}
              className={`
                group relative p-6 rounded-2xl border-2 transition-all duration-200 text-left
                ${action.disabled 
                  ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                  : `border-${action.color}-200 dark:border-${action.color}-800 bg-${action.color}-50 dark:bg-${action.color}-900/20 hover:border-${action.color}-300 dark:hover:border-${action.color}-600 hover:shadow-lg`
                }
              `}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`
                  p-2 rounded-xl
                  ${action.disabled 
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : `bg-${action.color}-100 dark:bg-${action.color}-900/30`
                  }
                `}>
                  <action.icon className={`
                    h-5 w-5
                    ${action.disabled 
                      ? 'text-gray-400'
                      : `text-${action.color}-600 dark:text-${action.color}-400`
                    }
                  `} />
                </div>
                <div>
                  <h4 className={`
                    font-semibold
                    ${action.disabled 
                      ? 'text-gray-400'
                      : 'text-gray-900 dark:text-white'
                    }
                  `}>
                    {action.label}
                  </h4>
                </div>
              </div>
              <p className={`
                text-sm
                ${action.disabled 
                  ? 'text-gray-400'
                  : 'text-gray-600 dark:text-gray-400'
                }
              `}>
                {action.description}
              </p>
              
              {!action.disabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl"></div>
              )}
            </button>
          ))}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to {actionType} this subscription? This action will affect the customer's service.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`Enter reason for ${actionType}...`}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowConfirmDialog(false)
                    setReason('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Processing...' : `Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionActions
