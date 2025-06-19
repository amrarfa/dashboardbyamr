import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Initial form state
const initialFormState = {
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
  subscriptionType: null, // Numeric enum: 0=Web, 1=mobileApplication, 2=Branch
  branchId: null,
  generatedPlan: null,

  // Additional Options
  oldSid: '',
  notes: '',
  billingCycle: 'monthly',
  paymentMethod: 'cash',
  specialInstructions: ''
}

// Action types
const FORM_ACTIONS = {
  UPDATE_FORM_DATA: 'UPDATE_FORM_DATA',
  RESET_FORM: 'RESET_FORM',
  RESET_PLAN_DATA: 'RESET_PLAN_DATA',
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE',
  UPDATE_FIELD: 'UPDATE_FIELD'
}

// Reducer function
const formReducer = (state, action) => {
  switch (action.type) {
    case FORM_ACTIONS.UPDATE_FORM_DATA:
      return {
        ...state,
        ...action.payload
      }
    
    case FORM_ACTIONS.UPDATE_FIELD:
      return {
        ...state,
        [action.field]: action.value
      }
    
    case FORM_ACTIONS.RESET_FORM:
      return initialFormState

    case FORM_ACTIONS.RESET_PLAN_DATA:
      return {
        ...state,
        // Reset only subscription plan data, keep customer data
        planCategoryId: null,
        planId: null,
        startDate: '',
        duration: null,
        deliveryDays: [],
        mealTypes: [],
        dislikeCategories: [],
        subscriptionType: null,
        branchId: null,
        generatedPlan: null,
        // Reset additional options too
        oldSid: '',
        notes: '',
        billingCycle: 'monthly',
        paymentMethod: 'cash',
        specialInstructions: ''
      }

    case FORM_ACTIONS.LOAD_FROM_STORAGE:
      return {
        ...state,
        ...action.payload
      }
    
    default:
      return state
  }
}

// Create context
const SubscriptionFormContext = createContext()

// Provider component
export const SubscriptionFormProvider = ({ children }) => {
  const [formData, dispatch] = useReducer(formReducer, initialFormState)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('subscriptionDraft')
    if (savedDraft) {
      try {
        const { formData: savedFormData } = JSON.parse(savedDraft)
        if (savedFormData) {
          console.log('Loading form data from localStorage:', savedFormData)
          dispatch({
            type: FORM_ACTIONS.LOAD_FROM_STORAGE,
            payload: savedFormData
          })
        }
      } catch (err) {
        console.error('Failed to load draft from localStorage:', err)
      }
    }
  }, [])

  // Auto-save to localStorage when formData changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only save if there's meaningful data
      if (formData.customerId || formData.customerPhone || formData.planCategoryId || formData.planId || formData.startDate) {
        const draftData = {
          formData,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem('subscriptionDraft', JSON.stringify(draftData))
        console.log('Auto-saved form data to localStorage')
      }
    }, 500) // Save after 500ms of inactivity

    return () => clearTimeout(timeoutId)
  }, [formData])

  // Action creators
  const updateFormData = (updates) => {
    console.log('Context: Updating form data with:', updates)
    dispatch({
      type: FORM_ACTIONS.UPDATE_FORM_DATA,
      payload: updates
    })
  }

  const updateField = (field, value) => {
    console.log(`Context: Updating field ${field} with:`, value)
    dispatch({
      type: FORM_ACTIONS.UPDATE_FIELD,
      field,
      value
    })
  }

  const resetForm = () => {
    dispatch({ type: FORM_ACTIONS.RESET_FORM })
    localStorage.removeItem('subscriptionDraft')
  }

  const resetPlanData = () => {
    console.log('Context: Resetting plan data only (keeping customer data)')
    dispatch({ type: FORM_ACTIONS.RESET_PLAN_DATA })

    // Also update localStorage to remove plan data but keep customer data
    const savedDraft = localStorage.getItem('subscriptionDraft')
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft)
        if (draftData.formData) {
          // Keep only customer data, reset plan data
          const updatedFormData = {
            ...draftData.formData,
            // Reset plan data
            planCategoryId: null,
            planId: null,
            startDate: '',
            duration: null,
            deliveryDays: [],
            mealTypes: [],
            dislikeCategories: [],
            subscriptionType: null,
            branchId: null,
            generatedPlan: null,
            // Reset additional options
            oldSid: '',
            notes: '',
            billingCycle: 'monthly',
            paymentMethod: 'cash',
            specialInstructions: ''
          }

          const updatedDraft = {
            ...draftData,
            formData: updatedFormData,
            timestamp: new Date().toISOString()
          }

          localStorage.setItem('subscriptionDraft', JSON.stringify(updatedDraft))
          console.log('Context: Updated localStorage - removed plan data, kept customer data')
        }
      } catch (err) {
        console.error('Failed to update localStorage:', err)
      }
    }
  }

  const getFieldValue = (field) => {
    return formData[field]
  }

  // Context value
  const contextValue = {
    formData,
    updateFormData,
    updateField,
    resetForm,
    resetPlanData,
    getFieldValue,
    
    // Specific getters for commonly used fields
    planId: formData.planId,
    planCategoryId: formData.planCategoryId,
    mealTypes: formData.mealTypes || [],
    deliveryDays: formData.deliveryDays || [],
    dislikeCategories: formData.dislikeCategories || [],
    startDate: formData.startDate,
    duration: formData.duration,
    
    // Customer data
    customerId: formData.customerId,
    customerName: formData.customerName,
    customerPhone: formData.customerPhone,
    customerEmail: formData.customerEmail,
    customerAddress: formData.customerAddress
  }

  return (
    <SubscriptionFormContext.Provider value={contextValue}>
      {children}
    </SubscriptionFormContext.Provider>
  )
}

// Custom hook to use the context
export const useSubscriptionForm = () => {
  const context = useContext(SubscriptionFormContext)
  if (!context) {
    throw new Error('useSubscriptionForm must be used within a SubscriptionFormProvider')
  }
  return context
}

export default SubscriptionFormContext
