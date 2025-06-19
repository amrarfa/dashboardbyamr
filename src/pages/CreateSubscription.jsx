import React, { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { SubscriptionFormProvider, useSubscriptionForm } from '../contexts/SubscriptionFormContext'
import CreateSubscriptionStepper from '../components/subscriptions/CreateSubscriptionStepper'
import CustomerSelectionStep from '../components/subscriptions/CustomerSelectionStep'
import SubscriptionDetailsStep from '../components/subscriptions/SubscriptionDetailsStep'
import SubscriptionPreviewStep from '../components/subscriptions/SubscriptionPreviewStep'
import BillingPaymentStep from '../components/subscriptions/BillingPaymentStep'
import ReviewConfirmStep from '../components/subscriptions/ReviewConfirmStep'
import SubscriptionSummary from '../components/subscriptions/SubscriptionSummary'
import apiService from '../services/api'

const CreateSubscriptionContent = () => {
  const navigate = useNavigate()
  const { success, error: showError, info } = useToast()
  const { formData: contextFormData, resetForm, resetPlanData } = useSubscriptionForm()

  // Form state management
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  // Form data state - single source of truth
  const [formData, setFormData] = useState({
    // Customer Information
    customerId: null,
    customerPhone: '',
    customerName: '',
    customerEmail: '',
    customerAddress: '',
    selectedCustomer: null,

    // Subscription Details
    planCategoryId: null,
    planId: null,
    startDate: '',
    duration: null,
    deliveryDays: [],
    mealTypes: [],
    dislikeCategories: [],
    generatedPlan: null,

    // Additional Options
    oldSid: '',
    notes: '',
    billingCycle: 'monthly',
    paymentMethod: 'cash',
    specialInstructions: '',

    // Billing & Payment
    discount: '',
    isSponsor: false,
    basePrice: 1503,
    manualDiscount: 0,
    bagValue: 0,
    uploadedFiles: [],
    finalTotal: 0
  })

  // Validation errors state
  const [errors, setErrors] = useState({})

  // Step configuration
  const steps = [
    {
      id: 1,
      title: 'Customer',
      description: 'Select or create customer'
    },
    {
      id: 2,
      title: 'Subscription',
      description: 'Choose plan and details'
    },
    {
      id: 3,
      title: 'Preview',
      description: 'Review meal plan'
    },
    {
      id: 4,
      title: 'Billing',
      description: 'Payment and pricing'
    },
    {
      id: 5,
      title: 'Review',
      description: 'Confirm and create'
    }
  ]

  // Update form data
  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }))

    // Clear related errors when data is updated
    if (updates && Object.keys(updates).length > 0) {
      const updatedFields = Object.keys(updates)
      setErrors(prev => {
        const newErrors = { ...prev }
        updatedFields.forEach(field => {
          delete newErrors[field]
        })
        return newErrors
      })
    }
  }, [])

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {}

    console.log('🔍 Validating step:', step)
    console.log('🔍 Context form data for validation:', contextFormData)

    switch (step) {
      case 1: // Customer Selection
        // Use context data for customer validation since CustomerSelectionStep uses context
        console.log('🔍 Step 1 validation - Customer data:', {
          customerId: contextFormData.customerId,
          customerPhone: contextFormData.customerPhone,
          customerName: contextFormData.customerName
        })

        if (!contextFormData.customerId && !contextFormData.customerPhone) {
          console.log('❌ Validation failed: No customer ID or phone')
          newErrors.customer = 'Please select a customer or enter phone number'
        }
        if (contextFormData.customerPhone) {
          // Handle multiple phone numbers separated by " | " or " - "
          const phoneNumbers = contextFormData.customerPhone.split(/\s*[\|\-]\s*/)
          const hasValidPhone = phoneNumbers.some(phone => {
            const cleanPhone = phone.replace(/\D/g, '')
            return cleanPhone.length >= 10 && cleanPhone.length <= 15
          })

          if (!hasValidPhone) {
            console.log('❌ Validation failed: Invalid phone format')
            newErrors.customerPhone = 'Please enter a valid phone number'
          }
        }
        if (!contextFormData.customerName?.trim()) {
          console.log('❌ Validation failed: No customer name')
          newErrors.customerName = 'Customer name is required'
        }

        console.log('🔍 Step 1 validation errors:', newErrors)
        break

      case 2: // Subscription Details
        // Validation is handled by the SubscriptionDetailsStep component itself
        // No additional validation needed here since the step validates before proceeding
        break

      case 3: // Preview
        // No validation needed for preview step
        break

      case 4: // Billing & Payment
        // Skip validation for sponsors
        if (!formData.isSponsor) {
          if (!formData.paymentMethod) {
            newErrors.paymentMethod = 'Payment method is required'
          }
          if (formData.basePrice <= 0) {
            newErrors.basePrice = 'Base price must be greater than 0'
          }
        }
        break

      case 5: // Review
        // Final validation - check all required fields
        const step1Errors = validateStep(1)
        const step4Errors = validateStep(4)
        Object.assign(newErrors, step1Errors, step4Errors)
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navigation functions
  const goToNextStep = (mode = null) => {
    console.log('🚀 goToNextStep called for step:', currentStep, 'mode:', mode)

    // If mode is 'summary', show summary page
    if (mode === 'summary') {
      console.log('✅ Showing subscription summary')
      setShowSummary(true)
      return
    }

    // For step 2 (Subscription Details), validation is handled internally
    // For other steps, validate before proceeding
    const isStep2 = currentStep === 2
    const validationPassed = validateStep(currentStep)

    console.log('🔍 Navigation check:', {
      currentStep,
      isStep2,
      validationPassed,
      canProceed: isStep2 || validationPassed
    })

    if (isStep2 || validationPassed) {
      if (currentStep < steps.length) {
        console.log('✅ Navigation allowed - moving to step:', currentStep + 1)
        setCurrentStep(currentStep + 1)
        // Clear any existing errors when moving to next step
        setErrors({})
      } else {
        console.log('⚠️ Already at last step')
      }
    } else {
      console.log('❌ Navigation blocked - validation failed')
    }
  }

  const goToPreviousStep = (targetStep = null) => {
    if (targetStep && targetStep >= 1 && targetStep < currentStep) {
      setCurrentStep(targetStep)
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step) => {
    if (step <= currentStep || validateStep(currentStep)) {
      setCurrentStep(step)
    }
  }

  // Save draft functionality
  const saveDraft = async (showToast = true) => {
    setIsSaving(true)
    try {
      // Save to localStorage for now (could be API call)
      localStorage.setItem('subscriptionDraft', JSON.stringify({
        formData,
        currentStep,
        timestamp: new Date().toISOString()
      }))
      if (showToast) {
        success('Draft saved successfully!')
      }
    } catch (err) {
      showError('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }

  // Clear draft function
  const clearDraft = () => {
    console.log('🧹 Clearing all data - resetting form context')

    // Reset context data (this clears everything including customer data)
    resetForm()

    setCurrentStep(1)
    setErrors({}) // Clear any validation errors
    setShowSummary(false)
    success('Started fresh - all data cleared')
  }

  // Handle back to subscriptions list
  const handleBackToList = () => {
    navigate('/subscriptions')
  }

  // Reset form when component mounts to ensure fresh start
  useEffect(() => {
    console.log('🔄 CreateSubscription: Resetting form for fresh start')
    resetForm()
    setCurrentStep(1)
    setErrors({})
    setShowSummary(false)
  }, [])

  // Auto-save draft when form data changes (silently) - TEMPORARILY DISABLED FOR DEBUGGING
  useEffect(() => {
    console.log('🔄 Auto-save DISABLED for debugging')

    // TEMPORARILY DISABLED
    /*
    const timeoutId = setTimeout(() => {
      // Auto-save if there's any meaningful data
      if (formData.customerId || formData.customerPhone || formData.planCategoryId || formData.planId || formData.startDate) {
        console.log('💾 Auto-saving draft...')
        saveDraft(false) // Don't show toast for auto-save
      }
    }, 1000) // Auto-save after 1 second of inactivity for better responsiveness

    return () => clearTimeout(timeoutId)
    */
  }, [formData])

  // Also auto-save when navigating between steps to ensure persistence - TEMPORARILY DISABLED
  useEffect(() => {
    console.log('🔄 Step-change auto-save DISABLED for debugging')
    // TEMPORARILY DISABLED
    /*
    if (formData.customerId || formData.customerPhone || formData.planCategoryId || formData.planId) {
      saveDraft(false) // Silent save when step changes
    }
    */
  }, [currentStep])

  // Show summary page if subscription was saved
  if (showSummary) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SubscriptionSummary onBackToList={handleBackToList} />
        </div>
      </div>
    )
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CustomerSelectionStep
            errors={errors}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )
      case 2:
        return (
          <SubscriptionDetailsStep
            errors={errors}
            onNext={goToNextStep}
            onPrevious={() => {
              console.log('🔙 Previous button clicked from Step 3 to Step 2')
              goToPreviousStep()
            }}
          />
        )
      case 3:
        return (
          <SubscriptionPreviewStep
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )
      case 4:
        return (
          <BillingPaymentStep
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        )
      case 5:
        return (
          <ReviewConfirmStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/subscriptions')}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create New Subscription
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => saveDraft(true)}
                disabled={isSaving}
                className="btn-secondary flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={clearDraft}
                className="btn-outline"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Stepper */}
          <CreateSubscriptionStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={goToStep}
          />

          {/* Step Content */}
          <div className="mt-8">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

// Main wrapper component with context provider
const CreateSubscription = () => {
  return (
    <SubscriptionFormProvider>
      <CreateSubscriptionContent />
    </SubscriptionFormProvider>
  )
}

export default CreateSubscription