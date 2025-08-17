import React, { useState, useEffect, useMemo } from 'react'
import { ChevronRight, Upload, X, Calculator, Percent, DollarSign, Loader } from 'lucide-react'
import { useSubscriptionForm } from '../../contexts/SubscriptionFormContext'
import { useToast } from '../../contexts/ToastContext'
import apiService from '../../services/api'

const BillingPaymentStep = ({ onNext, onPrevious, currentStep, totalSteps }) => {
  const { formData, updateFormData } = useSubscriptionForm()
  const { success, error: showError } = useToast()

  // Local state for billing/payment
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [isSponsor, setIsSponsor] = useState(formData.isSponsor || false)
  const [paymentMethod, setPaymentMethod] = useState(formData.paymentMethod || '')
  const [manualDiscount, setManualDiscount] = useState(formData.manualDiscount || 0)
  const [notes, setNotes] = useState(formData.notes || '')
  const [uploadedFiles, setUploadedFiles] = useState(formData.uploadedFiles || [])
  const [isSaving, setIsSaving] = useState(false)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [couponDiscountData, setCouponDiscountData] = useState(null) // Store full coupon response
  const [paymentReference, setPaymentReference] = useState('') // Payment reference input
  const [paymentTypes, setPaymentTypes] = useState([])
  const [isLoadingPaymentTypes, setIsLoadingPaymentTypes] = useState(false)

  // Get pricing data from generated plan with safe fallbacks
  // The generated plan response might be nested in different ways
  const generatedPlanData = formData.generatedPlan?.data || formData.generatedPlan
  const planPrice = generatedPlanData?.planPrice || 0
  const taxSettings = generatedPlanData?.taxSettings || {
    taxActive: false,
    isIncluedTax: false,
    taxPercent: 0.14,
    taxDicountOption: 1,
    bagValue: 0
  }

  console.log('🔍 BillingPaymentStep - Pricing data:', {
    planPrice,
    taxSettings,
    generatedPlan: formData.generatedPlan,
    generatedPlanData
  })

  // Load payment types from API
  const loadPaymentTypes = async () => {
    try {
      setIsLoadingPaymentTypes(true)

      // Get subscription type and branch ID from form data
      const subscriptionType = parseInt(formData.subscriptionType) || 0 // Default to Web (0)

      console.log('🔍 Form data for payment types:', {
        subscriptionType: formData.subscriptionType,
        branchId: formData.branchId,
        parsedSubscriptionType: subscriptionType
      })

      // Always include branchId - get from user selection or customer info
      let branchId = null

      if (formData.subscriptionType === 2) {
        // For branch subscriptions, use user-selected branch
        const parsedBranchId = parseInt(formData.branchId)
        if (!isNaN(parsedBranchId) && parsedBranchId > 0) {
          branchId = parsedBranchId
          console.log('🏢 Using user-selected branch ID:', branchId)
        } else {
          console.warn('⚠️ Branch subscription requires valid branchId, got:', formData.branchId)
        }
      }

      // If no branch ID yet (non-branch subscription or invalid branch), get from customer info
      if (branchId === null && formData.customerId) {
        try {
          console.log('🔍 Getting branch ID from customer info for CustomerID:', formData.customerId)
          const customerInfoResponse = await apiService.getCustomerInfo(formData.customerId)
          const customerData = customerInfoResponse?.data || customerInfoResponse
          const customerBranchID = customerData?.branchID || 0

          if (customerBranchID > 0) {
            branchId = customerBranchID
            console.log('🏢 Using customer branch ID:', branchId)
          } else {
            console.warn('⚠️ No valid branch ID found in customer info')
            branchId = 0 // Use 0 as fallback
          }
        } catch (error) {
          console.error('❌ Error getting customer branch info:', error)
          branchId = 0 // Use 0 as fallback
        }
      }

      // Ensure we have a branch ID (even if 0)
      if (branchId === null) {
        branchId = 0
        console.log('🏢 Using fallback branch ID: 0')
      }

      console.log('🔍 Loading payment types with params:', {
        subscriptionType,
        branchId
      })

      const response = await apiService.getPaymentTypes(subscriptionType, branchId)
      console.log('💳 Payment types response:', response)

      const paymentTypesData = response?.data || response || []
      console.log('💳 Payment types data:', paymentTypesData)
      console.log('💳 First payment type structure:', paymentTypesData[0])

      // Transform API response to expected format
      const transformedPaymentTypes = paymentTypesData
        .filter(paymentType => paymentType && (paymentType.paymentID || paymentType.id || paymentType.paymentTypeID)) // Filter out invalid entries
        .map(paymentType => {
          // Use the correct API field names: paymentID and paymentName
          const id = paymentType.paymentID || paymentType.id || paymentType.paymentTypeID
          const label = paymentType.paymentName || paymentType.name || paymentType.paymentTypeName || paymentType.typeName || `Payment Method ${id}`

          return {
            id: id,
            value: id,
            label: label,
            methodId: id // Store for API calls
          }
        })

      console.log('💳 Transformed payment types:', transformedPaymentTypes)
      setPaymentTypes(transformedPaymentTypes)

      // Clear selected payment method if it's no longer available
      if (paymentMethod && !transformedPaymentTypes.find(pt =>
        pt && pt.value !== undefined && pt.value !== null &&
        pt.value.toString() === paymentMethod.toString()
      )) {
        setPaymentMethod('')
      }

    } catch (error) {
      console.error('❌ Error loading payment types:', error)
      showError('Failed to load payment methods')

      // Fallback to default payment methods
      setPaymentTypes([
        { id: 1, value: 1, label: 'Cash', methodId: 1 },
        { id: 2, value: 2, label: 'Credit/Debit Card', methodId: 2 },
        { id: 3, value: 3, label: 'Bank Transfer', methodId: 3 }
      ])
    } finally {
      setIsLoadingPaymentTypes(false)
    }
  }

  // Calculate pricing based on generate plan response
  const calculatePricing = () => {
    if (!planPrice || planPrice === 0) {
      return {
        planPrice: 0,
        bagValue: 0,
        subtotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        netAmount: 0,
        total: 0
      }
    }

    const bagValue = taxSettings.bagValue || 0
    let subtotal = planPrice
    let taxAmount = 0
    let netAmount = 0

    // Calculate total discount (manual + coupon)
    const totalDiscount = manualDiscount + couponDiscount

    if (taxSettings.isIncluedTax) {
      // Tax is included in planPrice
      // Calculate tax amount from included price
      taxAmount = planPrice * (taxSettings.taxPercent / (1 + taxSettings.taxPercent))
      netAmount = planPrice - taxAmount

      // Apply discounts to net amount
      netAmount = Math.max(0, netAmount - totalDiscount)

      // Recalculate tax on discounted amount if taxDicountOption allows
      if (taxSettings.taxDicountOption === 1) {
        taxAmount = netAmount * taxSettings.taxPercent
      }

      subtotal = netAmount + taxAmount + bagValue
    } else {
      // Tax is not included in planPrice
      netAmount = Math.max(0, planPrice - totalDiscount)

      // Calculate tax on net amount (after discount)
      if (taxSettings.taxActive) {
        taxAmount = netAmount * taxSettings.taxPercent
      }

      subtotal = netAmount + taxAmount + bagValue
    }

    return {
      planPrice,
      bagValue,
      subtotal,
      discountAmount: totalDiscount,
      taxAmount,
      netAmount,
      total: subtotal
    }
  }

  // Use useMemo to stabilize pricing calculation
  const pricing = useMemo(() => {
    return calculatePricing()
  }, [planPrice, taxSettings, manualDiscount, couponDiscount])

  // Apply coupon discount
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      showError('Please enter a coupon code')
      return
    }

    try {
      setIsApplyingCoupon(true)
      console.log('🎫 Applying coupon:', couponCode)

      // Prepare invoice data for discount application
      const invoiceDataForDiscount = {
        customerId: formData.customerId || 0,
        total: pricing.planPrice || 0,
        discount: manualDiscount || 0,
        net: pricing.netAmount || 0,
        tax: pricing.taxAmount || 0
      }

      console.log('🎫 Invoice data for discount:', invoiceDataForDiscount)

      const response = await apiService.applyDiscount(couponCode.trim(), invoiceDataForDiscount)
      console.log('🎫 Coupon response:', response)

      if (response && response.succeeded) {
        // Check if the coupon application was successful
        const data = response.data

        if (data && data.result === true && data.discounts && data.discounts.length > 0) {
          // Coupon is valid and has discounts
          const discountInfo = data.discounts[0]
          const discountValue = discountInfo?.discountValue || discountInfo?.amount || 0

          if (discountValue > 0) {
            setCouponDiscount(discountValue)
            setCouponDiscountData(discountInfo) // Store full discount data for invoice
            setCouponError('') // Clear any previous errors
            success(`Coupon applied! Discount: ${discountValue}`)
            console.log('🎫 Stored coupon discount data:', discountInfo)
          } else {
            setCouponError('Coupon is valid but no discount amount available')
          }
        } else if (data && data.result === false && data.errorList && data.errorList.length > 0) {
          // Coupon is invalid - show error message below input
          const errorMessage = data.errorList[0] || 'Invalid coupon code'
          setCouponError(errorMessage)
        } else {
          setCouponError('Invalid coupon code or no discount available')
        }
      } else {
        setCouponError(response?.message || 'Failed to validate coupon')
      }
    } catch (error) {
      console.error('❌ Error applying coupon:', error)
      showError('Failed to apply coupon. Please try again.')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  // Remove coupon
  const removeCoupon = () => {
    setCouponCode('')
    setCouponDiscount(0)
    setCouponDiscountData(null)
    setCouponError('')
    success('Coupon removed')
  }

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        // Remove the data:image/jpeg;base64, prefix
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  // Load payment types on component mount and when subscription type/branch changes
  useEffect(() => {
    // Only load if we have the required subscription data
    if (formData.subscriptionType !== undefined) {
      loadPaymentTypes()
    }
  }, [formData.subscriptionType, formData.branchId])

  // Debug: Log form data to see what we have
  useEffect(() => {
    console.log('🔍 BillingPaymentStep - Current form data:', formData)
    console.log('🔍 Available data for subscription creation:', {
      customerInfo: {
        customerId: formData.customerId,
        customerName: formData.customerName
      },
      subscriptionDetails: {
        planId: formData.planId,
        planCategoryId: formData.planCategoryId,
        startDate: formData.startDate,
        duration: formData.duration,
        subscriptionType: formData.subscriptionType,
        branchId: formData.branchId
      },
      mealTypes: formData.mealTypes,
      deliveryDays: formData.deliveryDays,
      dislikeCategories: formData.dislikeCategories
    })
  }, [formData])

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  // Remove uploaded file
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  // Clear billing data when sponsor is checked
  useEffect(() => {
    if (isSponsor) {
      // Clear all billing-related data for sponsors
      setCouponCode('')
      setCouponDiscount(0)
      setCouponDiscountData(null)
      setCouponError('')
      setPaymentMethod('')
      setPaymentReference('')
      setManualDiscount(0)
      setUploadedFiles([])
    }
  }, [isSponsor])

  // Update form data when local state changes
  useEffect(() => {
    updateFormData({
      isSponsor,
      paymentMethod: isSponsor ? '' : paymentMethod,
      manualDiscount: isSponsor ? 0 : manualDiscount,
      couponCode: isSponsor ? '' : couponCode,
      couponDiscount: isSponsor ? 0 : couponDiscount,
      notes,
      uploadedFiles: isSponsor ? [] : uploadedFiles,
      finalTotal: isSponsor ? 0 : pricing.total,
      // Invoice data for API
      invoiceData: {
        planPrice: pricing.planPrice,
        bagValue: pricing.bagValue,
        subtotal: pricing.subtotal,
        discountAmount: pricing.discountAmount,
        taxAmount: pricing.taxAmount,
        netAmount: pricing.netAmount,
        total: pricing.total
      }
    })
  }, [isSponsor, paymentMethod, manualDiscount, couponCode, couponDiscount, notes, uploadedFiles, pricing])

  // Validate form
  const validateForm = () => {
    // Skip validation for sponsors
    if (isSponsor) {
      return true
    }

    if (!paymentMethod) {
      showError('Please select a payment method')
      return false
    }

    // Validate that invoice file is uploaded for non-sponsor customers
    if (uploadedFiles.length === 0) {
      showError('Please upload an invoice file before completing the subscription')
      return false
    }

    return true
  }

  // Save subscription function
  const saveSubscription = async () => {
    setIsSaving(true)
    try {
      // First, get customer info to retrieve driverID, branchID, and addressID
      console.log('🔍 Fetching customer info for CustomerID:', formData.customerId)
      const customerInfoResponse = await apiService.getCustomerInfo(formData.customerId)

      console.log('📋 Customer info response:', customerInfoResponse)

      // Extract required IDs from customer info
      const customerData = customerInfoResponse?.data || customerInfoResponse
      const driverID = customerData?.driverID || 0
      const branchID = customerData?.branchID || 0

      // Get first address ID from the address list
      const addresses = customerData?.adress || []
      const adressID = addresses.length > 0 ? addresses[0].id : 0

      console.log('🔍 Extracted customer data:', {
        driverID,
        branchID,
        adressID,
        addressesCount: addresses.length
      })

      // Get meal types data to reconstruct the objects
      console.log('🔍 Form data mealTypes:', formData.mealTypes)

      let mealTypesArray = []
      if (formData.mealTypes && formData.mealTypes.length > 0) {
        // Check if mealTypes contains IDs or full objects
        if (typeof formData.mealTypes[0] === 'number') {
          // mealTypes contains IDs only, need to fetch meal type details
          console.log('🔍 MealTypes are IDs, fetching meal type details...')
          try {
            const mealTypesResponse = await apiService.getMealsTypes(formData.planId)
            const allMealTypes = mealTypesResponse?.data || mealTypesResponse || []

            // Transform and filter selected meal types
            console.log('🔍 Selected meal type IDs:', formData.mealTypes)
            console.log('🔍 Available meal types from API:', allMealTypes)

            mealTypesArray = formData.mealTypes.map(mealTypeId => {
              const mealType = allMealTypes.find(mt => mt.mealTypeID === mealTypeId)
              console.log(`🔍 Looking for meal type ID ${mealTypeId}, found:`, mealType)

              if (mealType) {
                const result = {
                  mealTypeID: mealType.mealTypeID,
                  mealTypeName: mealType.mealTypeName,
                  mealTypeCategoryID: mealType.mealTypeCategoryID,
                  mealTypeCategoryName: mealType.mealTypeCategoryName
                }
                console.log('✅ Successfully mapped meal type:', result)
                return result
              } else {
                console.warn('⚠️ Meal type not found for ID:', mealTypeId)
                console.warn('⚠️ Available meal type IDs:', allMealTypes.map(mt => mt.mealTypeID))
                const fallback = {
                  mealTypeID: mealTypeId,
                  mealTypeName: `MealType ${mealTypeId}`,
                  mealTypeCategoryID: 1,
                  mealTypeCategoryName: 'Meal'
                }
                console.warn('⚠️ Using fallback meal type:', fallback)
                return fallback
              }
            })

            console.log('🔍 Final meal types array:', mealTypesArray)
          } catch (error) {
            console.error('❌ Error fetching meal types:', error)
            // Fallback: create basic objects from IDs
            mealTypesArray = formData.mealTypes.map(mealTypeId => ({
              mealTypeID: mealTypeId,
              mealTypeName: `MealType ${mealTypeId}`,
              mealTypeCategoryID: 1,
              mealTypeCategoryName: 'Meal'
            }))
          }
        } else {
          // mealTypes contains full objects
          console.log('🔍 MealTypes are full objects')
          mealTypesArray = formData.mealTypes.map(mealType => ({
            mealTypeID: mealType.id || mealType.mealTypeID,
            mealTypeName: mealType.name || mealType.mealTypeName,
            mealTypeCategoryID: mealType.categoryId || mealType.mealTypeCategoryID,
            mealTypeCategoryName: mealType.categoryName || mealType.mealTypeCategoryName
          }))
        }
      }

      console.log('🔍 Final mealTypesArray:', mealTypesArray)

      // Create invoice object based on sponsor status
      let invoiceData = null

      if (!isSponsor) {
        // Only create invoice object for non-sponsor customers

        // Prepare payment discounts array from coupon data
        const paymentDiscounts = []
        if (couponDiscountData && couponDiscount > 0) {
          paymentDiscounts.push({
            id: 0,
            paymentDetailsId: 0,
            discountId: couponDiscountData.discountId || 1, // Use actual discount ID from API
            discountValue: couponDiscountData.discountValue || couponDiscount,
            couponCode: couponCode || null,
            discountType: couponDiscountData.discountType || 1,
            customerId: formData.customerId
          })
        }

        // Prepare payment methods array
        const paymentMethods = []
        if (paymentMethod) {
          paymentMethods.push({
            id: 0,
            paymentsDetailsId: 0,
            methodId: parseInt(paymentMethod),
            amount: pricing.total,
            refrenceId: paymentReference || '' // Use the reference input
          })
        }

        // Prepare upload request if files exist
        let uploadRequest = null
        if (uploadedFiles.length > 0) {
          try {
            const file = uploadedFiles[0]
            const base64Data = await fileToBase64(file.file)
            uploadRequest = {
              fileName: file.name,
              extension: file.name.split('.').pop(),
              uploadType: 0, // 0 = invoice
              data: base64Data
            }
          } catch (error) {
            console.error('❌ Error converting file to base64:', error)
            uploadRequest = {
              fileName: uploadedFiles[0].name,
              extension: uploadedFiles[0].name.split('.').pop(),
              uploadType: 0,
              data: '' // Fallback to empty string
            }
          }
        }

        invoiceData = {
          invoiceID: 0, // Auto-generated by API
          customerId: formData.customerId,
          total: pricing.planPrice,
          discount: pricing.discountAmount,
          net: pricing.netAmount,
          tax: pricing.taxAmount,
          subscriptionType: formData.subscriptionType || 0,
          subscripBranch: formData.branchId || branchID, // Use form branch or customer branch
          notes: notes || '',
          manualDiscount: manualDiscount,
          url: '', // Will be filled by API
          bageValue: pricing.bagValue,
          paymentDiscounts: paymentDiscounts,
          paymentMethods: paymentMethods,
          uploadRequest: uploadRequest
        }

        console.log('📋 Invoice data (non-sponsor):', invoiceData)
      } else {
        console.log('📋 Invoice data (sponsor): null - no billing required')
      }

      // Prepare subscription data based on step 2 structure
      const subscriptionData = {
        SubscriperName: formData.customerName || 'Customer Name',
        MealsType: mealTypesArray,
        DeliveryDays: await (async () => {
          console.log('🔍 Form data deliveryDays:', formData.deliveryDays)

          let deliveryDaysArray = []
          if (formData.deliveryDays && formData.deliveryDays.length > 0) {
            // Check if deliveryDays contains IDs or full objects
            if (typeof formData.deliveryDays[0] === 'number') {
              // deliveryDays contains IDs only, need to fetch delivery day details
              console.log('🔍 DeliveryDays are IDs, fetching delivery day details...')
              try {
                const deliveryDaysResponse = await apiService.getDeliveryDays()
                const allDeliveryDays = deliveryDaysResponse?.data || deliveryDaysResponse || []

                // Transform and filter selected delivery days
                deliveryDaysArray = formData.deliveryDays.map(dayId => {
                  const day = allDeliveryDays.find(d => d.day_id === dayId)
                  if (day) {
                    return {
                      day_id: day.day_id,
                      day_name: day.day_name
                    }
                  } else {
                    console.warn('⚠️ Delivery day not found for ID:', dayId)
                    return {
                      day_id: dayId,
                      day_name: `Day ${dayId}`
                    }
                  }
                })
              } catch (error) {
                console.error('❌ Error fetching delivery days:', error)
                // Fallback: create basic objects from IDs
                deliveryDaysArray = formData.deliveryDays.map(dayId => ({
                  day_id: dayId,
                  day_name: `Day ${dayId}`
                }))
              }
            } else {
              // deliveryDays contains full objects
              console.log('🔍 DeliveryDays are full objects')
              deliveryDaysArray = formData.deliveryDays.map(day => ({
                day_id: day.day_id || day.id,
                day_name: day.day_name || day.name
              }))
            }
          }

          console.log('🔍 Final deliveryDaysArray:', deliveryDaysArray)
          return deliveryDaysArray
        })(),
        dislikeDategory: await (async () => {
          console.log('🔍 Form data dislikeCategories:', formData.dislikeCategories)

          let dislikeCategoriesArray = []
          if (formData.dislikeCategories && formData.dislikeCategories.length > 0) {
            // Check if dislikeCategories contains IDs or full objects
            if (typeof formData.dislikeCategories[0] === 'number') {
              // dislikeCategories contains IDs only, need to fetch dislike category details
              console.log('🔍 DislikeCategories are IDs, fetching dislike category details...')
              try {
                const dislikeCategoriesResponse = await apiService.getDislikeCategories()
                const allDislikeCategories = dislikeCategoriesResponse?.data || dislikeCategoriesResponse || []

                // Transform and filter selected dislike categories
                dislikeCategoriesArray = formData.dislikeCategories.map(categoryId => {
                  const category = allDislikeCategories.find(c => c.dilikeCategoryID === categoryId)
                  if (category) {
                    return {
                      dilikeCategoryID: category.dilikeCategoryID,
                      dilikeCategoryName: category.dilikeCategoryName
                    }
                  } else {
                    console.warn('⚠️ Dislike category not found for ID:', categoryId)
                    return {
                      dilikeCategoryID: categoryId,
                      dilikeCategoryName: `Category ${categoryId}`
                    }
                  }
                })
              } catch (error) {
                console.error('❌ Error fetching dislike categories:', error)
                // Fallback: create basic objects from IDs
                dislikeCategoriesArray = formData.dislikeCategories.map(categoryId => ({
                  dilikeCategoryID: categoryId,
                  dilikeCategoryName: `Category ${categoryId}`
                }))
              }
            } else {
              // dislikeCategories contains full objects
              console.log('🔍 DislikeCategories are full objects')
              dislikeCategoriesArray = formData.dislikeCategories.map(category => ({
                dilikeCategoryID: category.dilikeCategoryID || category.id,
                dilikeCategoryName: category.dilikeCategoryName || category.name
              }))
            }
          }

          console.log('🔍 Final dislikeCategoriesArray:', dislikeCategoriesArray)
          return dislikeCategoriesArray
        })(),
        PlanID: parseInt(formData.planId),
        planCategory: parseInt(formData.planCategoryId),
        CustomerID: formData.customerId,
        StartDate: formData.startDate,
        Duration: parseInt(formData.duration),
        subscriptionType: formData.subscriptionType, // Numeric value (0=Web, 1=mobileApplication, 2=Branch)
        subscripBranch: formData.subscriptionType === 2 ? parseInt(formData.branchId) : 0, // API expects 'subscripBranch' and 0 for non-branch

        // Required additional fields from customer info
        driverID: driverID,
        branchID: branchID,
        adressID: adressID,

        // Invoice data - null for sponsors, full object for regular customers
        invoice: invoiceData // Will be null for sponsors, full object for non-sponsors
      }

      console.log('🚀 Saving subscription with complete data:', subscriptionData)
      console.log('💰 Invoice status:', isSponsor ? 'SPONSOR - Invoice: null' : 'REGULAR CUSTOMER - Invoice: included')

      const response = await apiService.createSubscriptions(subscriptionData)

      console.log('✅ Subscription saved successfully:', response)
      success('Subscription created successfully!')

      // Navigate to summary page instead of next step
      onNext('summary')

    } catch (error) {
      console.error('❌ Error saving subscription:', error)
      if (error.message.includes('CustomerInfo')) {
        showError('Failed to fetch customer information. Please try again.')
      } else {
        showError('Failed to create subscription. Please try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Handle next step
  const handleNext = () => {
    if (validateForm()) {
      // Call save subscription instead of just going to next step
      saveSubscription()
    }
  }

  // Show warning if no plan data is available
  if (!formData.generatedPlan || (!generatedPlanData && planPrice === 0)) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Billing & Payment
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configure pricing, discounts, and payment details
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Plan Data Required
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please complete the subscription details step to generate plan pricing before proceeding with billing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onPrevious}
            className="btn-secondary"
          >
            Previous
          </button>
          <button
            disabled
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Subscription
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Billing & Payment
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configure pricing, discounts, and payment details
        </p>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form Fields */}
        <div className="space-y-6">
          {/* Sponsor Checkbox - Always visible */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isSponsor"
              checked={isSponsor}
              onChange={(e) => setIsSponsor(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isSponsor" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Is Sponsor?
            </label>
          </div>

          {/* Show message for sponsors */}
          {isSponsor && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This subscription is sponsored. No billing information is required.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Billing fields - Only show for non-sponsors */}
          {!isSponsor && (
            <>
              {/* Manual Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Manual Discount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={manualDiscount}
                    onChange={(e) => setManualDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter discount amount"
                    className="input-field w-full pr-10"
                    min="0"
                    step="0.01"
                  />
                  <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Coupon Code
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase())
                        setCouponError('') // Clear error when user types
                      }}
                      placeholder="Enter coupon code"
                      className={`input-field w-full pr-10 ${couponError ? 'border-red-500' : ''}`}
                      disabled={couponDiscount > 0}
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {couponDiscount > 0 ? (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="btn-outline text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={!couponCode.trim() || isApplyingCoupon}
                      className="btn-primary disabled:opacity-50"
                    >
                      {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponDiscount > 0 && (
                  <p className="mt-1 text-sm text-green-600">
                    Coupon applied: -{couponDiscount.toFixed(2)} discount
                  </p>
                )}
                {couponError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠️</span>
                    {couponError}
                  </p>
                )}
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Methods *
                </label>
                <div className="relative">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input-field w-full"
                    required
                    disabled={isLoadingPaymentTypes}
                  >
                    <option value="">
                      {isLoadingPaymentTypes ? 'Loading payment methods...' : 'Select payment method'}
                    </option>
                    {paymentTypes.map(method => (
                      <option key={method.id} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                  {isLoadingPaymentTypes && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    </div>
                  )}
                </div>
                {paymentTypes.length === 0 && !isLoadingPaymentTypes && (
                  <p className="mt-1 text-sm text-yellow-600">
                    No payment methods available. Please contact support.
                  </p>
                )}
              </div>

              {/* Payment Reference - Only show if payment method is selected */}
              {paymentMethod && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Reference
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Enter payment reference (optional)"
                    className="input-field w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Add a reference number or note for this payment
                  </p>
                </div>
              )}

            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="input-field w-full resize-none"
              placeholder="Add any additional notes..."
            />
          </div>

          {/* File Upload - Only show if NOT sponsor */}
          {!isSponsor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Invoice Files <span className="text-red-500">*</span>
              </label>
              <div
                className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                  Drag & Drop to Upload Image File Here Or
                </p>
                <label className="btn-primary cursor-pointer">
                  Choose Image
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Required field message */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span className="text-red-500">*</span> Invoice file is required to complete the subscription
              </p>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Pricing Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            {isSponsor ? 'Sponsor Information' : 'Pricing Summary'}
          </h3>

          {isSponsor ? (
            /* Sponsor Summary */
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                      Sponsored Subscription
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      This subscription is fully sponsored. No payment is required from the customer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <span className="text-2xl font-bold text-green-600">FREE</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sponsored by organization</p>
              </div>
            </div>
          ) : (
            /* Regular Pricing Summary */
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Description</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Value</span>
              </div>

              <hr className="border-gray-200 dark:border-gray-600" />

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">Plan Price</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{pricing.planPrice.toFixed(2)}</span>
              </div>

              {pricing.bagValue > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Bag Value</span>
                  <span className="text-sm font-medium text-blue-600">+{pricing.bagValue.toFixed(2)}</span>
                </div>
              )}

              {pricing.discountAmount > 0 && (
                <>
                  {manualDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Manual Discount</span>
                      <span className="text-sm font-medium text-red-600">-{manualDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Coupon Discount</span>
                      <span className="text-sm font-medium text-red-600">-{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}

              {taxSettings.taxActive && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Tax ({(taxSettings.taxPercent * 100).toFixed(1)}%)
                    {taxSettings.isIncluedTax && ' (Included)'}
                  </span>
                  <span className="text-sm font-medium text-yellow-600">
                    {taxSettings.isIncluedTax ? 'Included' : `+${pricing.taxAmount.toFixed(2)}`}
                  </span>
                </div>
              )}

              <hr className="border-gray-200 dark:border-gray-600" />

              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900 dark:text-white">Net</span>
                <span className="text-base font-bold text-green-600">{pricing.total.toFixed(0)} USD</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onPrevious}
          disabled={currentStep === 1}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={isSaving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Creating Subscription...
            </>
          ) : (
            <>
              Complete Subscription
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default BillingPaymentStep
