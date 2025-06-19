import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Utensils, Package, ChevronDown, Check, ChevronRight, ChevronLeft } from 'lucide-react'
import apiService from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { useSubscriptionForm } from '../../contexts/SubscriptionFormContext'

const SubscriptionDetailsStep = ({ errors, onNext, onPrevious }) => {
  const { success: showSuccess, error: showError } = useToast()
  const { formData, updateFormData } = useSubscriptionForm()

  // Subscription Type Enum - numeric values as per API
  const subscriptionTypes = [
    { value: 0, stringValue: 'Web', label: 'Web' },
    { value: 1, stringValue: 'mobileApplication', label: 'Mobile Application' },
    { value: 2, stringValue: 'Branch', label: 'Branch' }
  ]

  // API Data
  const [planCategories, setPlanCategories] = useState([])
  const [filteredPlans, setFilteredPlans] = useState([])
  const [mealTypes, setMealTypes] = useState([])
  const [deliveryDays, setDeliveryDays] = useState([])
  const [dislikeCategories, setDislikeCategories] = useState([])
  const [planDurations, setPlanDurations] = useState([])
  const [branches, setBranches] = useState([])

  // UI State
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [customDuration, setCustomDuration] = useState(false)

  // Form State - Simple local state with context sync
  const [selectedCategory, setSelectedCategory] = useState(formData?.planCategoryId || '')
  const [selectedPlan, setSelectedPlan] = useState(formData?.planId || '')
  const [startDate, setStartDate] = useState(formData?.startDate || '')
  const [duration, setDuration] = useState(formData?.duration ? String(formData.duration) : '')
  const [selectedDeliveryDays, setSelectedDeliveryDays] = useState(formData?.deliveryDays || [])
  const [selectedMealTypes, setSelectedMealTypes] = useState(formData?.mealTypes || [])
  const [selectedDislikeCategories, setSelectedDislikeCategories] = useState(formData?.dislikeCategories || [])
  const [subscriptionType, setSubscriptionType] = useState(formData?.subscriptionType || '')
  const [selectedBranch, setSelectedBranch] = useState(() => {
    // Only use branch ID if it's a valid integer
    const branchId = formData?.branchId
    return (branchId && typeof branchId === 'number' && branchId > 0) ? branchId : ''
  })

  // Load initial data and clean up invalid branch data
  useEffect(() => {
    loadInitialData()

    // Clean up any invalid branch data in form context
    if (formData?.branchId && (typeof formData.branchId !== 'number' || formData.branchId <= 0)) {
      console.log('🧹 Cleaning up invalid branch data from context:', formData.branchId)
      updateFormData({ branchId: null })
    }

    // Debug current state
    console.log('🔄 SubscriptionDetailsStep mounted with state:', {
      subscriptionType,
      selectedBranch,
      formDataSubscriptionType: formData?.subscriptionType,
      formDataBranchId: formData?.branchId
    })
  }, [])

  // Sync local state with context when formData changes
  useEffect(() => {
    if (formData?.planCategoryId && formData.planCategoryId !== selectedCategory) {
      setSelectedCategory(formData.planCategoryId)
      // IMPORTANT: Load plans for the saved category
      loadPlansForCategory(formData.planCategoryId)
    }
    if (formData?.planId && formData.planId !== selectedPlan) {
      setSelectedPlan(formData.planId)
      // IMPORTANT: Always load meal types and duration for the saved plan
      loadPlanData(formData.planId)
    }
    if (formData?.startDate) setStartDate(formData.startDate)
    if (formData?.duration) setDuration(String(formData.duration))
    if (formData?.deliveryDays) setSelectedDeliveryDays(formData.deliveryDays)
    if (formData?.mealTypes) setSelectedMealTypes(formData.mealTypes)
    if (formData?.dislikeCategories) setSelectedDislikeCategories(formData.dislikeCategories)
    if (formData?.subscriptionType) setSubscriptionType(formData.subscriptionType)
    // Only set branch if it's a valid integer
    if (formData?.branchId && typeof formData.branchId === 'number' && formData.branchId > 0) {
      setSelectedBranch(formData.branchId)
      console.log('✅ Valid branch ID loaded from context:', formData.branchId)
    } else if (formData?.branchId) {
      console.log('⚠️ Invalid branch ID in context, clearing:', formData.branchId, 'Type:', typeof formData.branchId)
      setSelectedBranch('')
    }
  }, [formData])

  // Additional check: If we have planId but no plans loaded, try to load them
  useEffect(() => {
    if (selectedCategory && filteredPlans.length === 0) {
      loadPlansForCategory(selectedCategory)
    }
  }, [selectedCategory, filteredPlans.length])

  // Additional check: If we have selected plan but no meal types/duration, load them
  useEffect(() => {
    if (selectedPlan && (mealTypes.length === 0 || planDurations.length === 0)) {
      loadPlanData(selectedPlan)
    }
  }, [selectedPlan, mealTypes.length, planDurations.length])





  // Simple data loading
  const loadInitialData = async () => {
    setIsLoadingData(true)
    try {
      const [categories, deliveryDays, dislikeCategories, branches] = await Promise.all([
        apiService.getPlansCategory(),
        apiService.getDeliveryDays(),
        apiService.getDislikeCategories(),
        apiService.getAllBranches()
      ])

      setPlanCategories(categories?.data || categories || [])
      setDeliveryDays(deliveryDays?.data || deliveryDays || [])
      setDislikeCategories(dislikeCategories?.data || dislikeCategories || [])

      const branchesData = branches?.data || branches || []
      console.log('🏢 Branches API response:', branchesData)
      setBranches(branchesData)
    } catch (error) {
      console.error('Error loading data:', error)
      showError('Failed to load subscription data')
    } finally {
      setIsLoadingData(false)
    }
  }



  // Load plan data
  const loadPlanData = async (planId) => {
    if (!planId) return
    try {
      const [mealsResponse, durationsResponse] = await Promise.all([
        apiService.getMealsTypes(planId),
        apiService.getPlanDays(planId)
      ])

      // Set meal types
      const mealTypesData = mealsResponse?.data || mealsResponse || []
      const transformedMealTypes = mealTypesData.map(mealType => ({
        id: mealType.mealTypeID,
        name: mealType.mealTypeName,
        categoryId: mealType.mealTypeCategoryID,
        categoryName: mealType.mealTypeCategoryName
      }))
      setMealTypes(transformedMealTypes)

      // Set plan durations
      const durationsData = durationsResponse?.data || durationsResponse || []
      console.log('Plan Durations API Response:', durationsData)

      const transformedDurations = durationsData
        .map(duration => {
          // Check for different possible field names from API
          const durationValue = duration.dayCount || duration.days || duration.planDays || duration.duration
          console.log('Processing duration:', duration, 'extracted value:', durationValue)
          return durationValue ? { days: parseInt(durationValue), label: `${durationValue} Days` } : null
        })
        .filter(Boolean)

      console.log('Transformed Durations:', transformedDurations)

      setPlanDurations(transformedDurations.length > 0 ? transformedDurations : [
        { days: 7, label: '7 Days' },
        { days: 14, label: '14 Days' },
        { days: 30, label: '30 Days' }
      ])
    } catch (error) {
      console.error('Error loading plan data:', error)
      setMealTypes([])
      setPlanDurations([{ days: 7, label: '7 Days' }, { days: 14, label: '14 Days' }, { days: 30, label: '30 Days' }])
    }
  }

  // Load plans for category
  const loadPlansForCategory = async (categoryId) => {
    if (!categoryId) {
      setFilteredPlans([])
      return
    }

    try {
      const plansResponse = await apiService.getPlans(categoryId)
      const plans = plansResponse?.data || plansResponse || []
      setFilteredPlans(plans)
    } catch (error) {
      console.error('Error loading plans:', error)
      setFilteredPlans([])
    }
  }

  // Event handlers
  const handleCategoryChange = async (categoryId) => {
    setSelectedCategory(categoryId)
    setSelectedPlan('')
    setSelectedMealTypes([])
    updateFormData({ planCategoryId: categoryId, planId: null, mealTypes: [] })
    await loadPlansForCategory(categoryId)
  }

  const handlePlanChange = async (planId) => {
    setSelectedPlan(planId)
    // Clear duration when plan changes
    setDuration('')
    setSelectedMealTypes([])
    updateFormData({ planId, duration: null, mealTypes: [] })

    if (planId) {
      await loadPlanData(planId)
    } else {
      setMealTypes([])
      setPlanDurations([])
    }
  }

  const handleDeliveryDayToggle = (dayId) => {
    const newDays = selectedDeliveryDays.includes(dayId)
      ? selectedDeliveryDays.filter(id => id !== dayId)
      : [...selectedDeliveryDays, dayId]
    setSelectedDeliveryDays(newDays)
    updateFormData({ deliveryDays: newDays })
  }

  const handleMealTypeToggle = (mealTypeId) => {
    const newTypes = selectedMealTypes.includes(mealTypeId)
      ? selectedMealTypes.filter(id => id !== mealTypeId)
      : [...selectedMealTypes, mealTypeId]
    setSelectedMealTypes(newTypes)
    updateFormData({ mealTypes: newTypes })
  }

  const handleSelectAllMealTypes = () => {
    const newTypes = selectedMealTypes.length === mealTypes.length ? [] : mealTypes.map(m => m.id)
    setSelectedMealTypes(newTypes)
    updateFormData({ mealTypes: newTypes })
  }

  const handleSelectAllDeliveryDays = () => {
    const newDays = selectedDeliveryDays.length === deliveryDays.length ? [] : deliveryDays.map(d => d.day_id || d.id)
    setSelectedDeliveryDays(newDays)
    updateFormData({ deliveryDays: newDays })
  }

  const handleDislikeCategoryToggle = (categoryId) => {
    const newCategories = selectedDislikeCategories.includes(categoryId)
      ? selectedDislikeCategories.filter(id => id !== categoryId)
      : [...selectedDislikeCategories, categoryId]
    setSelectedDislikeCategories(newCategories)
    updateFormData({ dislikeCategories: newCategories })
  }

  const handleSelectAllDislikeCategories = () => {
    const newCategories = selectedDislikeCategories.length === dislikeCategories.length
      ? []
      : dislikeCategories.map(c => c.dilikeCategoryID)
    setSelectedDislikeCategories(newCategories)
    updateFormData({ dislikeCategories: newCategories })
  }

  const handleSubscriptionTypeChange = (typeValue) => {
    console.log('🔄 Subscription type change triggered:', typeValue, 'Type:', typeof typeValue)

    const numericValue = parseInt(typeValue)
    console.log('🔄 Parsed numeric value:', numericValue)

    setSubscriptionType(numericValue)

    // Find the string value for UI logic (Branch = 2)
    const typeObj = subscriptionTypes.find(t => t.value === numericValue)
    const isBranchType = typeObj?.stringValue === 'Branch'

    console.log('🔄 Type object found:', typeObj)
    console.log('🔄 Is branch type:', isBranchType)

    // Always reset branch selection when subscription type changes
    setSelectedBranch('')

    if (!isBranchType) {
      updateFormData({ subscriptionType: numericValue, branchId: null })
      console.log('🏢 Branch cleared - not branch subscription type')
    } else {
      updateFormData({ subscriptionType: numericValue, branchId: null })
      console.log('🏢 Switched to branch type - branch selection cleared for fresh start')
    }
  }

  const handleBranchChange = (branchId) => {
    console.log('🏢 Branch selected RAW:', branchId, 'Type:', typeof branchId)

    // Clear any existing invalid branch data first
    if (!branchId || branchId === '') {
      setSelectedBranch('')
      updateFormData({ branchId: null })
      return
    }

    // Ensure we store the branch ID as an integer
    const numericBranchId = parseInt(branchId)
    console.log('🏢 Parsed branch ID:', numericBranchId, 'isNaN:', isNaN(numericBranchId))

    if (!isNaN(numericBranchId) && numericBranchId > 0) {
      setSelectedBranch(numericBranchId)
      updateFormData({ branchId: numericBranchId })
      console.log('✅ Branch ID stored successfully:', numericBranchId)
    } else {
      console.warn('⚠️ Invalid branch ID selected:', branchId)
      setSelectedBranch('')
      updateFormData({ branchId: null })
    }
  }

  // Generate customer plan
  const generateCustomerPlan = async () => {
    try {
      setIsGeneratingPlan(true)

      const mealTypesArray = selectedMealTypes.map(mealTypeId => {
        const mealType = mealTypes.find(mt => mt.id === mealTypeId)
        return {
          mealTypeCategoryID: mealType ? mealType.categoryId : 0,
          mealTypeCategoryName: mealType ? mealType.categoryName : 'Unknown Category',
          mealTypeID: mealTypeId,
          mealTypeName: mealType ? mealType.name : `MealType ${mealTypeId}`
        }
      })

      const deliveryDaysArray = selectedDeliveryDays.map(dayId => {
        const day = deliveryDays.find(d => d.day_id === dayId)
        return {
          day_id: dayId,
          day_name: day ? day.day_name : `Day ${dayId}`,
          show: true
        }
      })

      // Handle multiple dislike categories
      const dislikeCategoriesArray = selectedDislikeCategories.map(categoryId => {
        const category = dislikeCategories.find(cat => cat.dilikeCategoryID === categoryId)
        return {
          dilikeCategoryID: categoryId,
          dilikeCategoryName: category ? category.dilikeCategoryName : `Category ${categoryId}`
        }
      })

      const planRequest = {
        SubscriperName: formData.customerName || formData.selectedCustomer?.name || 'Customer Name',
        MealsType: mealTypesArray,
        DeliveryDays: deliveryDaysArray,
        dislikeDategory: dislikeCategoriesArray,
        PlanID: parseInt(selectedPlan),
        planCategory: parseInt(selectedCategory),
        CustomerID: formData.customerId || formData.selectedCustomer?.id,
        StartDate: startDate,
        Duration: parseInt(duration),
        subscriptionType: subscriptionType, // Lowercase - numeric value (0=Web, 1=mobileApplication, 2=Branch)
        subscripBranch: subscriptionType === 2 ? parseInt(selectedBranch) : 0 // API expects 'subscripBranch' and 0 for non-branch
      }

      console.log('Generate Plan Request:', planRequest)
      console.log('Dislike Categories in Request:', dislikeCategoriesArray)

      const response = await apiService.generatePlan(planRequest)

      console.log('Generate Plan API Response:', response)
      console.log('Response structure:', {
        hasData: !!response?.data,
        hasMessages: !!response?.messages,
        hasSubscriptionDetails: !!response?.data?.subscriptionDetails,
        responseKeys: response ? Object.keys(response) : [],
        dataKeys: response?.data ? Object.keys(response.data) : []
      })

      // Check if response has meal data (messages array) - this indicates success
      const hasMessages = response && (response.messages || response.data?.messages)
      const isSuccess = response && (response.succeeded || response.success || hasMessages)

      if (isSuccess) {
        showSuccess('Customer plan generated successfully!')

        // Extract the correct data structure - save the full response
        // The Preview component will handle finding the messages array
        console.log('Generated Plan Data (full response):', response)
        console.log('Response has messages:', !!response.messages)
        console.log('Response.data has messages:', !!response.data?.messages)

        updateFormData({
          planCategoryId: selectedCategory,
          planId: selectedPlan,
          startDate,
          duration,
          deliveryDays: selectedDeliveryDays,
          mealTypes: selectedMealTypes,
          dislikeCategories: selectedDislikeCategories,
          subscriptionType: subscriptionType, // Numeric value
          branchId: subscriptionType === 2 ? selectedBranch : null, // 2 = Branch
          generatedPlan: response  // Save the full response, not just response.data
        })

        onNext()
      } else {
        console.error('Plan generation failed - no success indicator or messages found')
        showError('Failed to generate customer plan')
      }
    } catch (error) {
      console.error('Error generating plan:', error)
      showError('Failed to generate customer plan. Please try again.')
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  // Handle form submission
  const handleNext = () => {
    const newErrors = {}

    // Use formData as source of truth for validation
    const currentCategory = formData?.planCategoryId || selectedCategory
    const currentPlan = formData?.planId || selectedPlan
    const currentStartDate = formData?.startDate || startDate
    const currentDuration = formData?.duration || duration
    const currentDeliveryDays = formData?.deliveryDays || selectedDeliveryDays
    const currentMealTypes = formData?.mealTypes || selectedMealTypes

    // Subscription type validation
    if (subscriptionType === '' || subscriptionType === null || subscriptionType === undefined) {
      newErrors.subscriptionType = 'Subscription type is required'
    }

    // Branch validation (only if subscription type is Branch = 2)
    if (subscriptionType === 2 && !selectedBranch) {
      newErrors.branch = 'Branch selection is required when subscription type is Branch'
    }

    // Plan category validation
    if (!currentCategory) {
      newErrors.category = 'Plan category is required'
    }

    // Plan validation
    if (!currentPlan) {
      newErrors.plan = 'Plan selection is required'
    }

    // Only validate other fields if plan is selected
    if (currentPlan) {
      // Start date validation
      if (!currentStartDate) {
        newErrors.startDate = 'Start date is required'
      } else {
        const selectedDate = new Date(currentStartDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Reset time to start of day

        if (selectedDate < today) {
          newErrors.startDate = 'Start date cannot be in the past'
        }
      }

      // Duration validation
      if (!currentDuration) {
        newErrors.duration = 'Duration is required'
      } else {
        const durationNum = parseInt(currentDuration)
        if (isNaN(durationNum) || durationNum < 1) {
          newErrors.duration = 'Duration must be at least 1 day'
        } else if (durationNum > 365) {
          newErrors.duration = 'Duration cannot exceed 365 days'
        }
      }

      // Meal types validation
      if (!currentMealTypes || currentMealTypes.length === 0) {
        newErrors.mealTypes = 'Please select at least one meal type'
      }

      // Delivery days validation
      if (!currentDeliveryDays || currentDeliveryDays.length === 0) {
        newErrors.deliveryDays = 'Please select at least one delivery day'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      // Show specific error message based on what's missing
      const errorMessages = Object.values(newErrors)
      showError(`Please fix the following: ${errorMessages.join(', ')}`)

      // Scroll to first error field
      const firstErrorField = document.querySelector('.border-red-500')
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }

      return
    }

    // Proceed with plan generation
    generateCustomerPlan()
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading subscription options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary-100 dark:bg-primary-800 p-3 rounded-full">
              <Package className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Subscription Details</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Configure your subscription plan and preferences</p>
        </div>

        {/* Category and Plan Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Plan Category */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-primary-100 dark:bg-primary-800 p-2 rounded-lg mr-3">
                <Package className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Plan Category</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred category</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Plan Category *</label>
              <div className="relative">
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none ${
                    errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Choose a plan category...</option>
                  {planCategories.map((category) => (
                    <option key={category.planID || category.id} value={category.planID || category.id}>
                      {category.planName || category.categoryName || category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.category && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <span className="mr-2">⚠️</span>
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Plan Selection */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg mr-3">
                <Utensils className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Plan</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCategory
                    ? (filteredPlans.length > 0 ? `${filteredPlans.length} plan${filteredPlans.length !== 1 ? 's' : ''} available` : 'Loading plans...')
                    : 'Select category first'
                  }
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Plan *</label>



              <div className="relative">
                <select
                  value={selectedPlan || ''}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                    errors.plan ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={!selectedCategory || filteredPlans.length === 0}
                >
                  <option value="">
                    {!selectedCategory ? 'Select category first...' : filteredPlans.length === 0 ? 'Loading plans...' : 'Choose a plan...'}
                  </option>
                  {filteredPlans.map((plan) => (
                    <option key={plan.id || plan.planID} value={plan.id || plan.planID}>
                      {plan.planName || plan.name}
                      {plan.price ? ` - $${plan.price}` : ''}
                      {plan.duration ? ` (${plan.duration} days)` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.plan && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <span className="mr-2">⚠️</span>
                  {errors.plan}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Start Date and Duration */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg mr-3">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule & Duration</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedPlan ? 'Set start date and subscription duration' : 'Select a plan first to see duration options'}
              </p>
            </div>
          </div>

          {/* Schedule Container with Border */}
          <div className={`border-2 rounded-xl p-6 transition-all ${
            !selectedPlan
              ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
              : 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'
          }`}>
            {!selectedPlan ? (
              /* Hint when no plan selected */
              <div className="text-center py-8">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-3">
                    <Calendar className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h4 className="text-base font-medium text-gray-600 dark:text-gray-400 mb-2">
                    No Plan Selected
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-500 max-w-md mb-3">
                    Please select a plan first to see available duration options and set your start date.
                  </p>
                  <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                    <span className="mr-2">📅</span>
                    Choose a plan above to continue
                  </div>
                </div>
              </div>
            ) : (
              /* Schedule and Duration Form - Input fields aligned at top */
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Start Date */}
                <div className="flex-1 flex flex-col mt-[10px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Start Date *</label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      updateFormData({ startDate: e.target.value })
                    }}
                    className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-2">
                      <span className="mr-2">⚠️</span>
                      {errors.startDate}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div className="flex-1 flex flex-col">
                  {/* Duration Label and Buttons in same row */}
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration *</label>

                    {/* Duration Type Buttons */}
                    {planDurations.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setCustomDuration(false)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            !customDuration
                              ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          From Plan
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomDuration(true)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            customDuration
                              ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          Custom
                        </button>
                      </div>
                    )}
                  </div>



                  {!customDuration && planDurations.length > 0 && planDurations.some(d => d.days && !isNaN(d.days)) ? (
                    /* Plan Duration Selection */
                    <div className="space-y-3">
                      <div className="relative">
                        <select
                          value={duration || ''}
                          onChange={(e) => {
                            setDuration(e.target.value)
                            updateFormData({ duration: e.target.value ? parseInt(e.target.value) : null })
                          }}
                          className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                            errors.duration ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <option value="">Choose duration...</option>
                          {planDurations.map((planDuration, index) => (
                            <option key={index} value={planDuration.days}>
                              {planDuration.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      </div>
                      {planDurations.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {planDurations.length} option{planDurations.length !== 1 ? 's' : ''} available from plan
                        </span>
                      )}
                    </div>
                  ) : (
                    /* Custom Duration Input */
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={duration || ''}
                      onChange={(e) => {
                        setDuration(e.target.value)
                        updateFormData({ duration: e.target.value ? parseInt(e.target.value) : null })
                      }}
                      className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.duration ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter days (1-365)"
                    />
                  )}

                  {errors.duration && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-2">
                      <span className="mr-2">⚠️</span>
                      {errors.duration}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meals Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-800 p-2 rounded-lg mr-3">
                <Utensils className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meals</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedPlan ? `Select meal types • ${selectedMealTypes.length} selected` : 'Select a plan first to see available meals'}
                </p>
              </div>
            </div>
            {selectedPlan && mealTypes.length > 0 && (
              <button
                onClick={handleSelectAllMealTypes}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedMealTypes.length === mealTypes.length
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                    : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                }`}
              >
                {selectedMealTypes.length === mealTypes.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {/* Meals Container with Border */}
          <div className={`border-2 rounded-xl p-6 transition-all ${
            !selectedPlan
              ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
              : 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10'
          }`}>
            {!selectedPlan ? (
              /* Hint when no plan selected */
              <div className="text-center py-8">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-3">
                    <Utensils className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h4 className="text-base font-medium text-gray-600 dark:text-gray-400 mb-2">
                    No Plan Selected
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-500 max-w-md mb-3">
                    Please select a plan category and plan first to see the available meal types for your subscription.
                  </p>
                  <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                    <span className="mr-2">💡</span>
                    Choose from the plan selection above to continue
                  </div>
                </div>
              </div>
            ) : mealTypes.length === 0 ? (
              /* Loading state when plan is selected but meals are loading */
              <div className="text-center py-8">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mb-3"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading available meals...</p>
                </div>
              </div>
            ) : (
              /* Meal types grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mealTypes.map((mealType) => {
                  const currentMealTypes = formData?.mealTypes || selectedMealTypes
                  const isSelected = currentMealTypes.includes(mealType.id)
                  return (
                    <div
                      key={mealType.id}
                      onClick={() => handleMealTypeToggle(mealType.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-green-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{mealType.name}</h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{mealType.categoryName}</p>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ml-4 ${
                          isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-500'
                        }`}>
                          {isSelected && <Check className="h-4 w-4 text-white" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {errors.mealTypes && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <span className="mr-2">⚠️</span>
                {errors.mealTypes}
              </p>
            </div>
          )}
        </div>

        {/* Delivery Days Selection */}
        <div className={`mb-8 transition-all ${!selectedPlan ? 'opacity-60' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-orange-100 dark:bg-orange-800 p-2 rounded-lg mr-3">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Days</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedPlan ? `Select delivery days • ${selectedDeliveryDays.length} selected` : 'Select a plan first'}
                </p>
              </div>
            </div>
            {selectedPlan && deliveryDays.length > 0 && (
              <button
                onClick={handleSelectAllDeliveryDays}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDeliveryDays.length === deliveryDays.length
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                    : 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                }`}
              >
                {selectedDeliveryDays.length === deliveryDays.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {deliveryDays.map((day) => {
              const currentDeliveryDays = formData?.deliveryDays || selectedDeliveryDays
              const isSelected = currentDeliveryDays.includes(day.day_id || day.id)
              return (
                <div
                  key={day.day_id || day.id}
                  onClick={() => selectedPlan && handleDeliveryDayToggle(day.day_id || day.id)}
                  className={`p-3 border-2 rounded-lg transition-all text-center ${
                    !selectedPlan
                      ? 'cursor-not-allowed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                      : isSelected
                        ? 'cursor-pointer border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'cursor-pointer border-gray-200 dark:border-gray-700 hover:border-primary-300 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {isSelected && (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    <span className="font-medium">{day.day_name || day.dayName || day.name}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {errors.deliveryDays && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-3">
              <span className="mr-2">⚠️</span>
              {errors.deliveryDays}
            </p>
          )}
        </div>

        {/* Subscription Type and Branch Selection */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-purple-100 dark:bg-purple-800 p-2 rounded-lg mr-3">
              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription Type</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select subscription type and branch if applicable</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Subscription Type *</label>
              {console.log('🔄 Current subscription type for select value:', subscriptionType, 'Type:', typeof subscriptionType)}
              <div className="relative">
                <select
                  value={subscriptionType !== null && subscriptionType !== undefined ? subscriptionType.toString() : ''}
                  onChange={(e) => {
                    console.log('🔄 Select onChange triggered:', e.target.value)
                    handleSubscriptionTypeChange(e.target.value)
                  }}
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none ${
                    errors.subscriptionType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Choose subscription type...</option>
                  {subscriptionTypes.map((type) => (
                    <option key={type.value} value={type.value.toString()}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.subscriptionType && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-2">
                  <span className="mr-2">⚠️</span>
                  {errors.subscriptionType}
                </p>
              )}
            </div>

            {/* Branch Selection - Only show when subscription type is Branch (2) */}
            <div className={`transition-all duration-300 ${subscriptionType === 2 ? 'opacity-100' : 'opacity-50'}`}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Branch {subscriptionType === 2 ? '*' : '(Optional)'}
              </label>
              <div className="relative">
                <select
                  value={selectedBranch || ''}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  disabled={subscriptionType !== 2}
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none ${
                    errors.branch ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } ${subscriptionType !== 2 ? 'cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {subscriptionType !== 2 ? 'Select subscription type first...' : 'Choose a branch...'}
                  </option>
                  {branches.map((branch) => {
                    // Use the correct API field names: branchID and branchName
                    const branchId = branch.branchID
                    const branchName = branch.branchName

                    console.log('🏢 Branch option:', { branchId, branchName, originalBranch: branch })

                    return (
                      <option key={branchId} value={branchId}>
                        {branchName}
                        {branch.location ? ` - ${branch.location}` : ''}
                      </option>
                    )
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.branch && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-2">
                  <span className="mr-2">⚠️</span>
                  {errors.branch}
                </p>
              )}
              {subscriptionType !== 2 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Branch selection is only required when subscription type is "Branch"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dislike Categories Selection (Multiple) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-red-100 dark:bg-red-800 p-2 rounded-lg mr-3">
                <Package className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dislike Categories</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select categories you want to avoid • {selectedDislikeCategories.length} selected
                </p>
              </div>
            </div>
            {dislikeCategories.length > 0 && (
              <button
                onClick={handleSelectAllDislikeCategories}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDislikeCategories.length === dislikeCategories.length
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                }`}
              >
                {selectedDislikeCategories.length === dislikeCategories.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {/* Dislike Categories Container with Border */}
          <div className="border-2 rounded-xl p-6 transition-all border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10">
            {dislikeCategories.length === 0 ? (
              /* Loading or empty state */
              <div className="text-center py-8">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-3">
                    <Package className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h4 className="text-base font-medium text-gray-600 dark:text-gray-400 mb-2">
                    No Dislike Categories Available
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-500 max-w-md">
                    Dislike categories are loading or not available at the moment.
                  </p>
                </div>
              </div>
            ) : (
              /* Dislike categories grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dislikeCategories.map((category) => {
                  // Use the correct field names from API response
                  const categoryId = category.dilikeCategoryID
                  const categoryName = category.dilikeCategoryName

                  const isSelected = selectedDislikeCategories.includes(categoryId)

                  return (
                    <div
                      key={categoryId}
                      onClick={() => handleDislikeCategoryToggle(categoryId)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-red-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{categoryName}</h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isSelected ? 'Selected to avoid' : 'Click to avoid this category'}
                          </p>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ml-4 ${
                          isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300 dark:border-gray-500'
                        }`}>
                          {isSelected && <Check className="h-4 w-4 text-white" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onPrevious}
            className="btn-secondary"
            disabled={isGeneratingPlan}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </button>
          <button
            onClick={handleNext}
            className="btn-primary"
            disabled={isGeneratingPlan || isLoadingData}
          >
            {isGeneratingPlan ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Plan...
              </>
            ) : (
              <>
                Generate Plan
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>


    </div>
  )
}

export default SubscriptionDetailsStep