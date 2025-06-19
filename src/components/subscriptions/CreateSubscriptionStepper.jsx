import React from 'react'
import { Check, AlertCircle } from 'lucide-react'

const CreateSubscriptionStepper = ({ steps, currentStep, onStepClick, errors = {} }) => {
  // Check if a step has errors
  const stepHasErrors = (stepNumber) => {
    const stepErrorKeys = {
      1: ['customer', 'customerPhone', 'customerName', 'customerEmail'],
      2: [], // Subscription details validation is handled internally
      3: [], // Preview step has no validation
      4: ['oldSid', 'notes', 'billingCycle'], // Additional options
      5: [] // Review step shows all errors
    }

    const keysToCheck = stepErrorKeys[stepNumber] || []
    return keysToCheck.some(key => errors[key])
  }

  // Get step status
  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) {
      return stepHasErrors(stepNumber) ? 'error' : 'completed'
    } else if (stepNumber === currentStep) {
      return stepHasErrors(stepNumber) ? 'error' : 'current'
    } else {
      return 'upcoming'
    }
  }

  // Get step styles based on status
  const getStepStyles = (status) => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-500 text-white border-green-500',
          line: 'bg-green-500',
          title: 'text-green-600 dark:text-green-400',
          description: 'text-green-500 dark:text-green-400'
        }
      case 'current':
        return {
          circle: 'bg-primary-500 text-white border-primary-500',
          line: 'bg-gray-200 dark:bg-gray-700',
          title: 'text-primary-600 dark:text-primary-400',
          description: 'text-primary-500 dark:text-primary-400'
        }
      case 'error':
        return {
          circle: 'bg-red-500 text-white border-red-500',
          line: 'bg-gray-200 dark:bg-gray-700',
          title: 'text-red-600 dark:text-red-400',
          description: 'text-red-500 dark:text-red-400'
        }
      case 'upcoming':
      default:
        return {
          circle: 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700',
          line: 'bg-gray-200 dark:bg-gray-700',
          title: 'text-gray-500 dark:text-gray-400',
          description: 'text-gray-400 dark:text-gray-500'
        }
    }
  }

  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:block">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id)
              const styles = getStepStyles(status)
              const isLast = index === steps.length - 1
              const isClickable = step.id <= currentStep || status === 'completed'

              return (
                <li key={step.id} className={`relative ${isLast ? '' : 'flex-1'}`}>
                  <div className="flex items-center">
                    {/* Step Circle */}
                    <button
                      onClick={() => isClickable && onStepClick(step.id)}
                      disabled={!isClickable}
                      className={`
                        relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                        ${styles.circle}
                        ${isClickable ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                      `}
                    >
                      {status === 'completed' ? (
                        <Check className="h-5 w-5" />
                      ) : status === 'error' ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </button>

                    {/* Step Content */}
                    <div className="ml-4 min-w-0">
                      <p className={`text-sm font-medium transition-colors ${styles.title}`}>
                        {step.title}
                      </p>
                      <p className={`text-xs transition-colors ${styles.description}`}>
                        {step.description}
                      </p>
                    </div>

                    {/* Connecting Line */}
                    {!isLast && (
                      <div className="flex-1 ml-6">
                        <div className={`h-0.5 transition-colors ${styles.line}`} />
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Step {currentStep} of {steps.length}</span>
              <span>{Math.round((currentStep / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Step Info */}
          <div className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
              ${getStepStyles(getStepStatus(currentStep)).circle}
            `}>
              {getStepStatus(currentStep) === 'completed' ? (
                <Check className="h-4 w-4" />
              ) : getStepStatus(currentStep) === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{currentStep}</span>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {steps[currentStep - 1]?.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
          </div>

          {/* Step Navigation Dots */}
          <div className="flex justify-center mt-4 space-x-2">
            {steps.map((step) => {
              const status = getStepStatus(step.id)
              const isClickable = step.id <= currentStep || status === 'completed'

              return (
                <button
                  key={step.id}
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-200
                    ${step.id === currentStep
                      ? 'bg-primary-500 scale-125'
                      : status === 'completed'
                      ? 'bg-green-500'
                      : status === 'error'
                      ? 'bg-red-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                    }
                    ${isClickable ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}
                  `}
                  title={`${step.title}: ${step.description}`}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Please fix the following errors:
              </h3>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field} className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0" />
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateSubscriptionStepper
