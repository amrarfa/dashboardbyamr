import React from 'react'
import { ChevronRight, ChevronLeft, CreditCard, FileText, Settings, AlertCircle } from 'lucide-react'

const AdditionalOptionsStep = ({
  formData,
  updateFormData,
  errors,
  isLoading,
  onNext,
  onPrevious,
  currentStep,
  totalSteps
}) => {
  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'digital_wallet', label: 'Digital Wallet', icon: '📱' }
  ]

  const billingCycles = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ]

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Additional Options
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configure optional settings and preferences
        </p>
      </div>

      {/* Migration Settings */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Migration Settings
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Old SID (For Migration)
            </label>
            <input
              type="text"
              value={formData.oldSid}
              onChange={(e) => updateFormData({ oldSid: e.target.value })}
              className={`input-field ${errors.oldSid ? 'border-red-500' : ''}`}
              placeholder="Enter previous subscription ID"
            />
            {errors.oldSid && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.oldSid}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional: Used when migrating from an existing subscription
            </p>
          </div>
        </div>
      </div>

      {/* Payment & Billing */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Payment & Billing
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Payment Method
            </label>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <label key={method.value} className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={formData.paymentMethod === method.value}
                    onChange={(e) => updateFormData({ paymentMethod: e.target.value })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                    <span className="mr-2">{method.icon}</span>
                    {method.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Billing Cycle
            </label>
            <select
              value={formData.billingCycle}
              onChange={(e) => updateFormData({ billingCycle: e.target.value })}
              className="input-field"
            >
              {billingCycles.map((cycle) => (
                <option key={cycle.value} value={cycle.value}>
                  {cycle.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              How often the customer will be billed
            </p>
          </div>
        </div>
      </div>

      {/* Notes & Instructions */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Notes & Special Instructions
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Internal Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateFormData({ notes: e.target.value })}
              rows={3}
              className="input-field resize-none"
              placeholder="Add any internal notes about this subscription..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              These notes are for internal use only and won't be visible to the customer
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Special Instructions
            </label>
            <textarea
              value={formData.specialInstructions}
              onChange={(e) => updateFormData({ specialInstructions: e.target.value })}
              rows={3}
              className="input-field resize-none"
              placeholder="Add any special delivery or dietary instructions..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Special instructions for meal preparation, delivery, or dietary requirements
            </p>
          </div>
        </div>
      </div>

      {/* Summary Preview */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Ready for Review
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              You've configured all the essential settings. The next step will show a complete summary
              of the subscription before final creation.
            </p>
            <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Customer:</span> {formData.customerName || 'Not selected'}
                </div>
                <div>
                  <span className="font-medium">Plan:</span> {formData.planName || 'Not selected'}
                </div>
                <div>
                  <span className="font-medium">Amount:</span> ${formData.amount?.toFixed(2) || '0.00'}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {formData.duration || 0} days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onPrevious}
          className="btn-secondary"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </button>
        <button
          onClick={onNext}
          className="btn-primary"
        >
          Next: Review & Confirm
          <ChevronRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  )
}

export default AdditionalOptionsStep
