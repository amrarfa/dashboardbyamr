import React, { useState } from 'react'
import { ChevronLeft, Check, User, CreditCard, Calendar, DollarSign, FileText, Edit, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'

const ReviewConfirmStep = ({
  formData,
  updateFormData,
  errors,
  isLoading,
  onNext,
  onPrevious,
  currentStep,
  totalSteps
}) => {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Handle subscription creation
  const handleCreateSubscription = async () => {
    if (!termsAccepted) {
      showError('Please accept the terms and conditions to continue')
      return
    }

    setIsCreating(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Clear draft from localStorage
      localStorage.removeItem('subscriptionDraft')

      success('Subscription created successfully!')
      navigate('/subscriptions')
    } catch (err) {
      showError('Failed to create subscription. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Calculate remaining days
  const calculateRemainingDays = () => {
    if (!formData.startDate || !formData.endDate) return 0
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const diffTime = end - start
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Review & Confirm
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Please review all details before creating the subscription
        </p>
      </div>

      {/* Customer Information */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Customer Information
            </h3>
          </div>
          <button
            onClick={() => onPrevious(1)}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm flex items-center"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
            <p className="text-gray-900 dark:text-white">{formData.customerName || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
            <p className="text-gray-900 dark:text-white">{formData.customerPhone || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
            <p className="text-gray-900 dark:text-white">{formData.customerEmail || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
            <p className="text-gray-900 dark:text-white">{formData.customerAddress || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Subscription Details
            </h3>
          </div>
          <button
            onClick={() => onPrevious(2)}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm flex items-center"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscription ID</label>
              <p className="text-gray-900 dark:text-white font-mono">{formData.sid || 'Not generated'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</label>
              <p className="text-gray-900 dark:text-white">{formData.planName || 'Not selected'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                formData.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                formData.status === 'Hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
              }`}>
                {formData.status}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${formData.amount?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</label>
              <p className="text-gray-900 dark:text-white">{formData.duration || 0} days</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Rate</label>
              <p className="text-gray-900 dark:text-white">
                ${formData.amount && formData.duration ? (formData.amount / formData.duration).toFixed(2) : '0.00'} per day
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Information */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Schedule
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</label>
            <p className="text-gray-900 dark:text-white">{formatDate(formData.startDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</label>
            <p className="text-gray-900 dark:text-white">{formatDate(formData.endDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Duration</label>
            <p className="text-gray-900 dark:text-white">{calculateRemainingDays()} days</p>
          </div>
        </div>
      </div>

      {/* Additional Options */}
      {(formData.oldSid || formData.notes || formData.specialInstructions || formData.paymentMethod !== 'cash' || formData.billingCycle !== 'monthly') && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Additional Options
              </h3>
            </div>
            <button
              onClick={() => onPrevious(3)}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm flex items-center"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {formData.oldSid && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Old SID</label>
                  <p className="text-gray-900 dark:text-white font-mono">{formData.oldSid}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</label>
                <p className="text-gray-900 dark:text-white capitalize">{formData.paymentMethod?.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Billing Cycle</label>
                <p className="text-gray-900 dark:text-white capitalize">{formData.billingCycle}</p>
              </div>
            </div>

            <div className="space-y-4">
              {formData.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Internal Notes</label>
                  <p className="text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {formData.notes}
                  </p>
                </div>
              )}
              {formData.specialInstructions && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Special Instructions</label>
                  <p className="text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {formData.specialInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <DollarSign className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
          <h3 className="text-xl font-bold text-primary-900 dark:text-primary-100">
            Subscription Summary
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-900 dark:text-primary-100">
              ${formData.amount?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-primary-700 dark:text-primary-300">Total Amount</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-900 dark:text-primary-100">
              {formData.duration || 0}
            </div>
            <div className="text-sm text-primary-700 dark:text-primary-300">Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-900 dark:text-primary-100">
              ${formData.amount && formData.duration ? (formData.amount / formData.duration).toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-primary-700 dark:text-primary-300">Per Day</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-900 dark:text-primary-100">
              {formData.planName || 'N/A'}
            </div>
            <div className="text-sm text-primary-700 dark:text-primary-300">Plan</div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              Terms and Conditions
            </h4>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              <p className="mb-2">
                By creating this subscription, you confirm that:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>All customer information provided is accurate and up-to-date</li>
                <li>The customer has agreed to the subscription terms and pricing</li>
                <li>Payment arrangements have been confirmed with the customer</li>
                <li>You have the authority to create this subscription on behalf of the customer</li>
              </ul>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <span className="ml-2 text-sm text-yellow-900 dark:text-yellow-100">
                I accept the terms and conditions and confirm the accuracy of all information
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onPrevious}
          disabled={isCreating}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </button>
        <button
          onClick={handleCreateSubscription}
          disabled={!termsAccepted || isCreating}
          className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Subscription...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Create Subscription
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ReviewConfirmStep