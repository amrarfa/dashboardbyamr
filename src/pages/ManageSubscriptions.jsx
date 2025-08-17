import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Search,
  Package,
  Phone,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Pause,
  CreditCard,
  Star,
  MapPin,
  Clock,
  Truck,
  Play,
  Edit,
  Eye,
  Download,
  DollarSign,
  Activity,
  MoreVertical,
  TrendingUp,
  FileText,
  Copy,
  Zap,
  Shield,
  ShieldCheck,
  Info,
  Calendar as CalendarIcon,
  BarChart3,
  X,
  Plus,
  Minus,
  Mail,
  Settings,
  ToggleLeft,
  Trash2,
  Shuffle,
  RefreshCw
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

// Helper function to make API calls with proper error handling
const makeApiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, options)
    return response
  } catch (fetchError) {
    console.error('❌ Network/CORS Error:', fetchError)
    if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
      throw new Error('CORS Error: Unable to connect to API. Please ensure the backend server is running and CORS is configured to allow requests from this domain.')
    }
    throw fetchError
  }
}
import { getSubscriptionBySID, searchByPhone } from '../services/manageSubscriptionApi'
import apiService from '../services/api'

// Function to get unique colors for action types
const getActionTypeColor = (actionType) => {
  const colors = {
    'Hold': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    'Active': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    'Resticit': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    'Extend': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'ChangeName': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    'ChangePhone': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    'ChangeAdress': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    'Changedriver': 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    'ChangeBranch': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    'AddNotes': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    'AddDays': 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300',
    'AddMeals': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    'changeStartDate': 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
    'Detact': 'bg-red-200 dark:bg-red-800/40 text-red-800 dark:text-red-200', // Remove days - distinct red
    'BagCount': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    'Renew': 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
    'CustomMeals': 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300',
    'Migrations': 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300',
    'ChangeState': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'ReplaceMeals': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    'NewSubscription': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    'UNResticit': 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300',
    'DeleteDays': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    'Merge_UnMerge': 'bg-purple-200 dark:bg-purple-800/40 text-purple-800 dark:text-purple-200', // Merge/Unmerge - distinct purple
    'DislikeMeals': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    'Refund': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
  };

  return colors[actionType] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
};



// API service functions for tabs
const getCustomerLog = async (subscriptionId) => {
  try {
    console.log('Fetching customer log for subscription:', subscriptionId)
    const url = `http://eg.localhost:7167/api/v1/ActionsManager/subscription/${subscriptionId}/log`
    console.log('Customer log URL:', url)

    const response = await fetch(url, {
      headers: {
        'accept': 'application/octet-stream'
      }
    })
    console.log('Customer log response:', response.status, response.statusText)

    if (!response.ok) throw new Error(`Failed to fetch customer log: ${response.status}`)
    const response_data = await response.json()
    console.log('Customer log response:', response_data)

    // Extract the actual data array from the wrapper object
    const data = response_data?.data || []
    console.log('Extracted customer log data:', data)
    console.log('Customer log data type:', typeof data)
    console.log('Customer log is array:', Array.isArray(data))
    console.log('Customer log length:', data?.length)

    // Log the first item to see the actual field names
    if (data.length > 0) {
      console.log('First customer log item structure:', data[0])
      console.log('Available fields:', Object.keys(data[0]))
    }

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching customer log:', error)
    return []
  }
}

const getInvoiceLog = async (subscriptionId) => {
  try {
    const response = await fetch(`http://eg.localhost:7167/api/v1/ActionsManager/subscription/${subscriptionId}/invoices`)
    if (!response.ok) throw new Error('Failed to fetch invoice log')
    const response_data = await response.json()
    console.log('Invoice log response:', response_data)

    // Extract the actual data array from the wrapper object
    const data = response_data?.data || []
    console.log('Extracted invoice log data:', data)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching invoice log:', error)
    return []
  }
}

const getDeliveryNotes = async (subscriptionId) => {
  try {
    const response = await fetch(`http://eg.localhost:7167/api/v1/ActionsManager/subscription/${subscriptionId}/delivery-notes`)
    if (!response.ok) throw new Error('Failed to fetch delivery notes')
    const response_data = await response.json()
    console.log('Delivery notes response:', response_data)

    // Extract the actual data array from the wrapper object
    const data = response_data?.data || []
    console.log('Extracted delivery notes data:', data)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching delivery notes:', error)
    return []
  }
}

const getDislikeMeals = async (subscriptionId) => {
  try {
    const response = await fetch(`http://eg.localhost:7167/api/v1/ActionsManager/subscription/${subscriptionId}/dislike-meals`)
    if (!response.ok) throw new Error('Failed to fetch dislike meals')
    const response_data = await response.json()
    console.log('Dislike meals response:', response_data)

    // Extract the actual data array from the wrapper object
    const data = response_data?.data || []
    console.log('Extracted dislike meals data:', data)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching dislike meals:', error)
    return []
  }
}

const ManageSubscriptions = () => {
  const { success, error: showError, info } = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  // Enhanced State Management
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('sid') // 'sid' or 'phone'
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSubscriptionId, setLoadingSubscriptionId] = useState(null) // Track which subscription is loading
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [subscriptionsList, setSubscriptionsList] = useState([]) // For phone search results
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [selectedView, setSelectedView] = useState('details')
  const [searchHistory, setSearchHistory] = useState([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  // Column Resize States
  const [isResizing, setIsResizing] = useState(false)
  const [resizeColumn, setResizeColumn] = useState(null)

  // Copy functionality
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      success(`Copied to clipboard: ${text}`)
    } catch (err) {
      console.error('Failed to copy: ', err)
      showError('Failed to copy to clipboard')
    }
  }

  // Action Dialog States
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)
  const [actionData, setActionData] = useState({})
  const [actionLoading, setActionLoading] = useState(false)
  const [loadingPlanPrice, setLoadingPlanPrice] = useState(false)
  const [planPriceData, setPlanPriceData] = useState({})

  // Delete Confirmation Dialog States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmData, setDeleteConfirmData] = useState(null)

  // Get Plan Price API Call
  const getPlanPrice = async (customerId, planId, duration, mealTypes, deliveryDays) => {
    // Validation: Check if all 3 required parameters have values
    if (!customerId || !planId || !duration) {
      console.log('⚠️ GetPlanPrice: Missing required parameters', { customerId, planId, duration })
      return
    }

    // Additional validation for arrays
    if (!mealTypes || mealTypes.length === 0) {
      console.log('⚠️ GetPlanPrice: No meal types selected - clearing pricing data')
      // Clear pricing data when no meal types selected
      setPlanPriceData({
        planAmount: 0,
        taxAmount: 0,
        taxRate: 0,
        deliveryFees: 0,
        discountValue: 0,
        totalAmount: 0
      })
      return
    }

    if (!deliveryDays || deliveryDays.length === 0) {
      console.log('⚠️ GetPlanPrice: No delivery days selected - clearing pricing data')
      // Clear pricing data when no delivery days selected
      setPlanPriceData({
        planAmount: 0,
        taxAmount: 0,
        taxRate: 0,
        deliveryFees: 0,
        discountValue: 0,
        totalAmount: 0
      })
      return
    }

    try {
      setLoadingPlanPrice(true)
      console.log('🔄 Calling GetPlanPrice API...', { customerId, planId, duration, mealTypes, deliveryDays })

      // Create new AbortController for this request
      currentAbortController.current = new AbortController()

      // Convert selected meal type IDs to full meal type objects
      console.log('🔍 GetPlanPrice - Selected meal type IDs:', mealTypes)
      console.log('🔍 GetPlanPrice - Available meal types:', availableMealTypes)

      const mealTypesArray = mealTypes.map(mealTypeId => {
        const mealType = availableMealTypes.find(mt => mt.id === parseInt(mealTypeId))
        console.log(`🔍 GetPlanPrice - Looking for meal type ID ${mealTypeId}, found:`, mealType)

        if (mealType) {
          const result = {
            mealTypeCategoryID: mealType.categoryId,
            mealTypeCategoryName: mealType.categoryName,
            mealTypeID: mealType.id,
            mealTypeName: mealType.name
          }
          console.log('✅ GetPlanPrice - Successfully mapped meal type:', result)
          return result
        } else {
          // Fallback if meal type not found in available list
          console.warn('⚠️ GetPlanPrice - Meal type not found for ID:', mealTypeId)
          console.warn('⚠️ GetPlanPrice - Available meal type IDs:', availableMealTypes.map(mt => mt.id))
          const fallback = {
            mealTypeCategoryID: 1,
            mealTypeCategoryName: "Meal",
            mealTypeID: parseInt(mealTypeId),
            mealTypeName: `MealType ${mealTypeId}`
          }
          console.warn('⚠️ GetPlanPrice - Using fallback meal type:', fallback)
          return fallback
        }
      })

      console.log('🔍 GetPlanPrice - Final meal types array:', mealTypesArray)

      // Convert selected delivery day IDs to full delivery day objects
      console.log('🔍 GetPlanPrice - Selected delivery day IDs:', deliveryDays)
      console.log('🔍 GetPlanPrice - Available delivery days:', availableDeliveryDays)
      console.log('🔍 GetPlanPrice - Available delivery days structure:', availableDeliveryDays.map(dd => ({
        id: dd.id,
        day_id: dd.day_id,
        name: dd.name,
        day_name: dd.day_name
      })))
      console.log('🔍 GetPlanPrice - Available delivery day IDs only:', availableDeliveryDays.map(dd => dd.day_id))

      const deliveryDaysArray = deliveryDays.map(dayId => {
        console.log(`🔍 GetPlanPrice - Processing delivery day ID: ${dayId} (type: ${typeof dayId})`)
        console.log(`🔍 GetPlanPrice - Searching for day ID ${dayId} in available days:`, availableDeliveryDays.map(dd => dd.day_id))

        const deliveryDay = availableDeliveryDays.find(dd => {
          const match = dd.day_id === parseInt(dayId) || dd.day_id === dayId
          console.log(`🔍 GetPlanPrice - Checking delivery day: day_id=${dd.day_id}, day_name="${dd.day_name}", searchId=${dayId}, match=${match}`)
          return match
        })
        console.log(`🔍 GetPlanPrice - Looking for delivery day ID ${dayId}, found:`, deliveryDay)

        if (deliveryDay) {
          const result = {
            day_id: deliveryDay.day_id,
            day_name: deliveryDay.day_name,
            show: true
          }
          console.log('✅ GetPlanPrice - Successfully mapped delivery day:', result)
          return result
        } else {
          // Fallback if delivery day not found in available list
          console.warn('⚠️ GetPlanPrice - Delivery day not found for ID:', dayId)
          console.warn('⚠️ GetPlanPrice - Available delivery day IDs:', availableDeliveryDays.map(dd => dd.day_id))
          const fallback = {
            day_id: parseInt(dayId) || 1,
            day_name: "Monday",
            show: true
          }
          console.warn('⚠️ GetPlanPrice - Using fallback delivery day:', fallback)
          return fallback
        }
      })

      console.log('🔍 GetPlanPrice - Final delivery days array:', deliveryDaysArray)

      const requestBody = {
        customerId: parseInt(customerId),
        planId: parseInt(planId),
        duration: parseInt(duration),
        mealsType: mealTypesArray, // Note: API expects "mealsType" not "mealTypes"
        deliveryDays: deliveryDaysArray, // Add delivery days to the request
        isContainBag: false,
        giftCode: actionData.giftCode || ""
      }

      console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2))

      const response = await makeApiCall(`http://eg.localhost:7167/api/v1/WebIntegration/GetPlanPrice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: currentAbortController.current.signal
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ GetPlanPrice API Response:', result)

        // Store the full plan price data
        setPlanPriceData(result)

        // Update action data with pricing information
        setActionData(prev => ({
          ...prev,
          total: result.totalAmount || result.total || prev.total,
          manualDiscount: result.discountValue || prev.manualDiscount,
          bagValue: result.bageValue || prev.bagValue
        }))

        success('Plan price updated successfully')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ GetPlanPrice API Error:', response.status, errorData)
        showError(`Failed to get plan price: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      // Don't show error if request was cancelled
      if (error.name === 'AbortError') {
        console.log('🚫 GetPlanPrice request was cancelled')
        return
      }
      console.error('❌ GetPlanPrice Error:', error)
      showError('Failed to get plan price')
    } finally {
      setLoadingPlanPrice(false)
    }
  }

  // Auto-update tax amount when API returns new data
  useEffect(() => {
    // Update tax amount when API returns new data, unless user has manually modified it
    if (Object.keys(planPriceData).length > 0 && planPriceData.taxAmount !== undefined) {
      // Always update from API unless user has explicitly set a different value
      console.log('🔄 Auto-updating tax amount from API:', planPriceData.taxAmount)
      setActionData(prev => ({
        ...prev,
        taxAmount: planPriceData.taxAmount,
        // Mark that this was auto-updated, not user-modified
        _taxAmountAutoUpdated: true
      }))
    }
  }, [planPriceData.taxAmount])

  // Auto-update total when API returns new data
  useEffect(() => {
    if (Object.keys(planPriceData).length > 0 && planPriceData.planAmount !== undefined) {
      // Use the planAmount directly from API response
      console.log('🔄 Auto-updating total from API planAmount:', planPriceData.planAmount)
      setActionData(prev => ({
        ...prev,
        total: planPriceData.planAmount,
        // Mark that this was auto-updated, not user-modified
        _totalAutoUpdated: true
      }))
    }
  }, [planPriceData.planAmount])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending debounced calls
      if (debouncedPlanPriceUpdate.current) {
        clearTimeout(debouncedPlanPriceUpdate.current)
      }
      // Cancel any ongoing API requests
      if (currentAbortController.current) {
        currentAbortController.current.abort()
      }
    }
  }, [])

  // Debounced plan price update to prevent multiple API calls
  const debouncedPlanPriceUpdate = useRef(null)
  const currentAbortController = useRef(null)

  // Helper function to trigger plan price calculation with debouncing
  const triggerPlanPriceUpdate = (newActionData) => {
    console.log('🔄 triggerPlanPriceUpdate called with:', newActionData)

    // Cancel previous debounced call
    if (debouncedPlanPriceUpdate.current) {
      clearTimeout(debouncedPlanPriceUpdate.current)
      console.log('🚫 Cancelled previous debounced call')
    }

    // Cancel previous API request
    if (currentAbortController.current) {
      currentAbortController.current.abort()
      console.log('🚫 Cancelled previous API request')
    }

    // Debounce the API call by 500ms
    debouncedPlanPriceUpdate.current = setTimeout(() => {
      console.log('⏰ Debounced API call executing after 500ms delay')

      // Get required parameters - try different field names for planId
      const customerId = subscriptionData?.subscriptionHeader?.customerId || subscriptionData?.subscriptionHeader?.customerID
      const planId = subscriptionData?.subscriptionHeader?.planId ||
                     subscriptionData?.subscriptionHeader?.planID ||
                     subscriptionData?.subscriptionHeader?.plan_id ||
                     subscriptionData?.subscriptionHeader?.id
      const duration = newActionData.duration || subscriptionData?.subscriptionHeader?.duration
      const mealTypes = newActionData.mealTypes || subscriptionData?.subscriptionHeader?.mealTypes || []
      const deliveryDays = newActionData.deliveryDays || subscriptionData?.subscriptionHeader?.deliveryDays || []

      console.log('📊 Parameters for API call:', {
        customerId,
        planId,
        duration,
        mealTypes,
        deliveryDays,
        subscriptionHeader: subscriptionData?.subscriptionHeader,
        availableFields: Object.keys(subscriptionData?.subscriptionHeader || {})
      })

      console.log('🔍 Detailed delivery days analysis:')
      console.log('🔍 newActionData.deliveryDays:', newActionData.deliveryDays)
      console.log('🔍 subscriptionData?.subscriptionHeader?.deliveryDays:', subscriptionData?.subscriptionHeader?.deliveryDays)
      console.log('🔍 Final deliveryDays parameter:', deliveryDays)
      console.log('🔍 deliveryDays type and length:', typeof deliveryDays, Array.isArray(deliveryDays) ? deliveryDays.length : 'not array')

      // Call API with validation
      if (customerId && planId && duration) {
        getPlanPrice(customerId, planId, duration, mealTypes, deliveryDays)
      } else {
        console.log('⚠️ triggerPlanPriceUpdate: Missing required parameters')
      }
    }, 500) // Wait 500ms after user stops making changes
  }

  // Change Status Dialog States
  const [showChangeStatusDialog, setShowChangeStatusDialog] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [statusChangeNotes, setStatusChangeNotes] = useState('')

  // Refund Dialog States
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [invoicesData, setInvoicesData] = useState([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

  // Refund Confirmation Dialog States
  const [showRefundConfirm, setShowRefundConfirm] = useState(false)
  const [refundConfirmData, setRefundConfirmData] = useState(null)

  // DeliveryStatus enum for status badges
  const DeliveryStatus = {
    Pending: 'Pending',
    Deliveried: 'Deliveried',
    NotDelivered: 'NotDelivered',
    Hold: 'Hold',
    Resticited: 'Resticited',
    Canceld: 'Canceld',
    AllStatus: 'AllStatus',
    PickedUp: 'PickedUp',
    Refund: 'Refund',
    Prepared: 'Prepared'
  }

  // Status options for dropdown (excluding AllStatus as it's not a settable status)
  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Deliveried', label: 'Delivered' },
    { value: 'NotDelivered', label: 'Not Delivered' },
    { value: 'Hold', label: 'Hold' },
    { value: 'Resticited', label: 'Restricted' },
    { value: 'Canceld', label: 'Cancelled' },
    { value: 'PickedUp', label: 'Picked Up' },
    { value: 'Refund', label: 'Refund' },
    { value: 'Prepared', label: 'Prepared' }
  ]

  // Tab Data States
  const [customerLogData, setCustomerLogData] = useState(null)
  const [invoiceLogData, setInvoiceLogData] = useState(null)
  const [deliveryNotesData, setDeliveryNotesData] = useState(null)
  const [dislikeMealsData, setDislikeMealsData] = useState(null)
  const [tabLoading, setTabLoading] = useState({})

  // Branches data for renew form
  const [branches, setBranches] = useState([])

  // Renew form data states
  const [availableMealTypes, setAvailableMealTypes] = useState([])
  const [availableDurations, setAvailableDurations] = useState([])
  const [availableDeliveryDays, setAvailableDeliveryDays] = useState([])
  const [availablePaymentTypes, setAvailablePaymentTypes] = useState([])
  const [loadingPlanData, setLoadingPlanData] = useState(false)
  const [loadingRenewData, setLoadingRenewData] = useState(false)

  // Change meal types form data states
  const [changeMealTypesData, setChangeMealTypesData] = useState([])
  const [loadingChangeMealTypes, setLoadingChangeMealTypes] = useState(false)

  // Change delivery days form data states
  const [changeDeliveryDaysData, setChangeDeliveryDaysData] = useState([])
  const [loadingChangeDeliveryDays, setLoadingChangeDeliveryDays] = useState(false)

  // Change customer phone form data states
  const [changeCustomerPhoneData, setChangeCustomerPhoneData] = useState([])
  const [loadingChangeCustomerPhone, setLoadingChangeCustomerPhone] = useState(false)

  // Change customer address form data states
  const [changeCustomerAddressData, setChangeCustomerAddressData] = useState([])
  const [loadingChangeCustomerAddress, setLoadingChangeCustomerAddress] = useState(false)
  const [areas, setAreas] = useState([])
  const [editingAddressIndex, setEditingAddressIndex] = useState(null)
  const [addressesToDelete, setAddressesToDelete] = useState([])
  const [newAddresses, setNewAddresses] = useState([])
  const [showEditAddressDialog, setShowEditAddressDialog] = useState(false)
  const [editAddressData, setEditAddressData] = useState({
    address: '',
    isDefault: false
  })

  // Load branches data
  const loadBranches = async () => {
    try {
      const response = await fetch('http://eg.localhost:7167/api/v1/ActionsManager/branches', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const result = await response.json()
      const branchesData = result?.data || []
      console.log('🏢 Branches loaded:', branchesData)
      setBranches(branchesData)
    } catch (error) {
      console.error('Error loading branches:', error)
      setBranches([])
    }
  }

  // Load meal types and durations based on plan ID
  const loadPlanData = async (planId) => {
    if (!planId) {
      setAvailableMealTypes([])
      setAvailableDurations([])
      return
    }

    setLoadingPlanData(true)
    try {
      console.log('🍽️ Loading plan data for plan ID:', planId)

      const [mealsResponse, durationsResponse] = await Promise.all([
        apiService.getMealsTypes(planId),
        apiService.getPlanDays(planId)
      ])

      // Set meal types
      const mealTypesData = mealsResponse?.data || mealsResponse || []
      console.log('🍽️ Raw meal types data:', mealTypesData)

      const transformedMealTypes = mealTypesData.map(mealType => ({
        id: mealType.mealTypeID,
        name: mealType.mealTypeName,
        categoryId: mealType.mealTypeCategoryID,
        categoryName: mealType.mealTypeCategoryName
      }))

      console.log('🍽️ Transformed meal types:', transformedMealTypes)
      setAvailableMealTypes(transformedMealTypes)

      // Set durations
      const durationsData = durationsResponse?.data || durationsResponse || []
      console.log('📅 Durations data:', durationsData)
      setAvailableDurations(durationsData)

    } catch (error) {
      console.error('Error loading plan data:', error)
      setAvailableMealTypes([])
      setAvailableDurations([])
    } finally {
      setLoadingPlanData(false)
    }
  }

  // Load branches on component mount
  useEffect(() => {
    loadBranches()
  }, [])

  // Load meal types for renew form (step by step)
  const loadMealTypesForRenew = async () => {
    console.log('🚀 loadMealTypesForRenew function called!')
    console.log('🔍 Subscription data:', subscriptionData)
    console.log('🔍 Subscription header:', subscriptionData?.subscriptionHeader)

    // Debug: Log ALL fields in subscriptionHeader to see what's available
    if (subscriptionData?.subscriptionHeader) {
      console.log('🔍 ALL subscriptionHeader fields:')
      Object.entries(subscriptionData.subscriptionHeader).forEach(([key, value]) => {
        console.log(`  ${key}:`, value, `(type: ${typeof value})`)
      })
    }

    // Check different possible field names for plan ID (prioritize numeric planID)
    const planId = subscriptionData?.subscriptionHeader?.planID ||
                   subscriptionData?.subscriptionHeader?.planId ||
                   subscriptionData?.subscriptionHeader?.plan_id ||
                   subscriptionData?.subscriptionHeader?.PlanId ||
                   subscriptionData?.subscriptionHeader?.PlanID

    // Also check for plan name as fallback (only if no numeric planID found)
    const planName = subscriptionData?.subscriptionHeader?.planName

    console.log('🔍 Plan ID (numeric):', planId)
    console.log('🔍 Plan Name (fallback):', planName)
    console.log('🔍 Available fields in subscriptionHeader:', Object.keys(subscriptionData?.subscriptionHeader || {}))

    // Log each field and its value to find the plan ID
    const header = subscriptionData?.subscriptionHeader || {}
    Object.keys(header).forEach(key => {
      if (key.toLowerCase().includes('plan')) {
        console.log(`🎯 PLAN-related field "${key}":`, header[key])
      }
    })

    if (!planId && !planName) {
      console.log('❌ No plan ID or plan name found, cannot load meal types')
      setAvailableMealTypes([])
      return
    }

    // IMPORTANT: Prioritize numeric planID over planName for API calls
    const planIdentifier = planId || planName
    console.log('✅ Using plan identifier:', planIdentifier, '(type:', typeof planIdentifier, ')')

    setLoadingRenewData(true)
    console.log('🔄 Loading meal types for renew form...')

    try {
      console.log('📋 Loading meal types and delivery days for plan identifier:', planIdentifier)
      console.log('📋 About to call apiService methods...')

      // Get subscription type and branch for payment methods API
      const subscriptionType = subscriptionData?.subscriptionHeader?.subscriptionType || 0
      const branchId = subscriptionType === 2 ? (subscriptionData?.subscriptionHeader?.branchId || 0) : 0

      console.log('💳 Payment method params - subscriptionType:', subscriptionType, 'branchId:', branchId)

      // Make parallel API calls for meal types, delivery days, plan days (duration), and payment methods
      console.log('🔄 Making parallel API calls...')
      const [mealTypesResponse, deliveryDaysResponse, planDaysResponse, paymentMethodsResponse] = await Promise.all([
        apiService.getMealsTypes(planIdentifier),
        apiService.getDeliveryDays(),
        apiService.getPlanDays(planIdentifier),
        apiService.getPaymentTypes(subscriptionType, branchId)
      ])

      console.log('✅ All four API calls completed!')
      console.log('🍽️ Raw meal types API response:', mealTypesResponse)
      console.log('📅 Raw delivery days API response:', deliveryDaysResponse)
      console.log('⏱️ Raw plan days API response:', planDaysResponse)
      console.log('💳 Raw payment methods API response:', paymentMethodsResponse)

      // Extract data from responses
      const mealTypesData = mealTypesResponse?.data || mealTypesResponse || []
      const deliveryDaysData = deliveryDaysResponse?.data || deliveryDaysResponse || []
      const planDaysData = planDaysResponse?.data || planDaysResponse || []
      const paymentMethodsData = paymentMethodsResponse?.data || paymentMethodsResponse || []

      console.log('🍽️ Extracted meal types data:', mealTypesData)
      console.log('📅 Extracted delivery days data:', deliveryDaysData)
      console.log('⏱️ Extracted plan days data:', planDaysData)
      console.log('💳 Extracted payment methods data:', paymentMethodsData)

      // Transform meal types data
      const transformedMealTypes = mealTypesData.map(mealType => ({
        id: mealType.mealTypeID,
        name: mealType.mealTypeName,
        categoryId: mealType.mealTypeCategoryID,
        categoryName: mealType.mealTypeCategoryName
      }))

      // Transform delivery days data
      const transformedDeliveryDays = deliveryDaysData.map(day => ({
        id: day.day_id,
        name: day.day_name,
        day_id: day.day_id,
        day_name: day.day_name,
        show: day.show
      }))

      // Transform plan days data (duration options)
      const transformedDurations = planDaysData.map(duration => ({
        value: duration.dayCount,
        label: `${duration.dayCount} days`,
        dayCount: duration.dayCount
      }))

      // Transform payment methods data
      const transformedPaymentMethods = Array.isArray(paymentMethodsData) ? paymentMethodsData.map(payment => ({
        paymentID: payment.paymentID || payment.id,
        paymentName: payment.paymentName || payment.name,
        id: payment.paymentID || payment.id,
        name: payment.paymentName || payment.name
      })) : []

      console.log('🍽️ Transformed meal types:', transformedMealTypes)
      console.log('📅 Transformed delivery days:', transformedDeliveryDays)
      console.log('⏱️ Transformed durations:', transformedDurations)
      console.log('💳 Transformed payment methods:', transformedPaymentMethods)

      // Set all four states
      setAvailableMealTypes(transformedMealTypes)
      setAvailableDeliveryDays(transformedDeliveryDays)
      setAvailableDurations(transformedDurations)
      setAvailablePaymentTypes(transformedPaymentMethods)

      console.log('✅ Meal types, delivery days, durations, and payment methods loaded successfully')

      // Pre-populate form with current subscription data after meal types are loaded
      console.log('🔄 Pre-populating renew form after meal types loaded...')
      const currentMealTypes = getCurrentSubscriptionMealTypesWithAvailable(transformedMealTypes)
      const currentDeliveryDays = getCurrentSubscriptionDeliveryDaysWithAvailable(transformedDeliveryDays)

      console.log('🎯 Pre-populating with meal types:', currentMealTypes)
      console.log('🎯 Pre-populating with delivery days:', currentDeliveryDays)

      setActionData(prev => ({
        ...prev,
        mealTypes: currentMealTypes,
        deliveryDays: currentDeliveryDays,
        duration: subscriptionData?.subscriptionHeader?.duration || '',
        subscriptionType: subscriptionData?.subscriptionHeader?.subscriptionType || 0,
        branchId: subscriptionData?.subscriptionHeader?.branchId || null
      }))

    } catch (error) {
      console.error('❌ Error loading renew form data:', error)
      console.error('❌ Error details:', error.message)
      console.error('❌ Error stack:', error.stack)
      setAvailableMealTypes([])
      setAvailableDeliveryDays([])
      setAvailableDurations([])
      setAvailablePaymentTypes([])
    } finally {
      console.log('🏁 Finally block - setting loading to false')
      setLoadingRenewData(false)
    }
  }

  // Load payment methods based on subscription type and branch
  const loadPaymentMethods = async (subscriptionType, branchId = 0) => {
    try {
      console.log('💳 Loading payment methods for subscriptionType:', subscriptionType, 'branchId:', branchId)

      const paymentMethodsResponse = await apiService.getPaymentTypes(subscriptionType, branchId)
      console.log('💳 Payment methods API response:', paymentMethodsResponse)

      const paymentMethodsData = paymentMethodsResponse?.data || paymentMethodsResponse || []

      // Transform payment methods data
      const transformedPaymentMethods = Array.isArray(paymentMethodsData) ? paymentMethodsData.map(payment => ({
        paymentID: payment.paymentID || payment.id,
        paymentName: payment.paymentName || payment.name,
        id: payment.paymentID || payment.id,
        name: payment.paymentName || payment.name
      })) : []

      console.log('💳 Transformed payment methods:', transformedPaymentMethods)
      setAvailablePaymentTypes(transformedPaymentMethods)

      // Reset payment method selection when options change
      setActionData(prev => ({ ...prev, paymentMethod: '' }))

    } catch (error) {
      console.error('❌ Error loading payment methods:', error)
      setAvailablePaymentTypes([])
    }
  }

  // Load meal types for change meal types action
  const loadChangeMealTypesData = async () => {
    const planId = subscriptionData?.subscriptionHeader?.planId || subscriptionData?.subscriptionHeader?.planID
    const subscriptionId = subscriptionData?.subscriptionHeader?.subscriptionId

    if (!planId || !subscriptionId) {
      console.error('❌ No plan ID or subscription ID found for loading meal types')
      setChangeMealTypesData([])
      return
    }

    setLoadingChangeMealTypes(true)
    console.log('🍽️ Step 1: Loading ALL available meal types for plan ID:', planId)
    console.log('🍽️ Step 2: Will then get SELECTED meal types for subscription ID:', subscriptionId)

    try {
      // Step 1: Get ALL available meal types for this plan
      console.log('📡 Calling GetMealsTypes API...')
      const availableMealTypesResponse = await fetch(`http://eg.localhost:7167/api/v1/CreateSubscriptions/GetMealsTypes?PlanID=${planId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!availableMealTypesResponse.ok) {
        throw new Error(`HTTP error getting available meal types! status: ${availableMealTypesResponse.status}`)
      }

      const availableMealTypesData = await availableMealTypesResponse.json()
      console.log('✅ Step 1 Complete - Available meal types API response:', availableMealTypesData)

      const allMealTypesArray = availableMealTypesData?.data || availableMealTypesData || []

      // Transform and group ALL available meal types by category
      const groupedMealTypes = {}
      allMealTypesArray.forEach(mealType => {
        const categoryName = mealType.mealTypeCategoryName || 'MEAL'
        if (!groupedMealTypes[categoryName]) {
          groupedMealTypes[categoryName] = []
        }
        groupedMealTypes[categoryName].push({
          id: mealType.mealTypeID,
          name: mealType.mealTypeName,
          categoryId: mealType.mealTypeCategoryID,
          categoryName: mealType.mealTypeCategoryName
        })
      })

      console.log('🍽️ All available meal types grouped by category:', groupedMealTypes)
      setChangeMealTypesData(groupedMealTypes)

      // Step 2: Get CURRENTLY SELECTED meal types for this subscription
      console.log('📡 Calling GetSelectedMealType API...')
      const selectedMealTypesResponse = await fetch(`http://eg.localhost:7167/api/v1/ActionsManager/subscription/GetSelectedMealType/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!selectedMealTypesResponse.ok) {
        throw new Error(`HTTP error getting selected meal types! status: ${selectedMealTypesResponse.status}`)
      }

      const selectedMealTypesData = await selectedMealTypesResponse.json()
      console.log('✅ Step 2 Complete - Currently selected meal types API response:', selectedMealTypesData)

      const selectedMealTypesArray = selectedMealTypesData?.data || selectedMealTypesData || []

      // Extract selected meal type IDs from the API response
      const selectedMealTypeIds = selectedMealTypesArray.map(mealType =>
        mealType.mealTypeID || mealType.id || mealType
      )

      console.log('🎯 Customer currently has these meal types selected:', selectedMealTypeIds)
      console.log('📊 Total available meal types:', allMealTypesArray.length)
      console.log('📊 Customer selected meal types:', selectedMealTypeIds.length)

      // Show user which meal types they currently have
      const selectedMealTypeNames = allMealTypesArray
        .filter(mt => selectedMealTypeIds.includes(mt.mealTypeID))
        .map(mt => mt.mealTypeName)

      console.log('📝 Customer selected meal type names:', selectedMealTypeNames)

      setActionData(prev => ({
        ...prev,
        selectedMealTypes: selectedMealTypeIds,
        currentlySelectedNames: selectedMealTypeNames // For display purposes
      }))

    } catch (error) {
      console.error('❌ Error loading meal types for change action:', error)
      setChangeMealTypesData({})
      // Fallback to subscription header meal types if API fails
      const fallbackMealTypes = subscriptionData?.subscriptionHeader?.mealTypes || []
      setActionData(prev => ({ ...prev, selectedMealTypes: fallbackMealTypes }))
    } finally {
      setLoadingChangeMealTypes(false)
    }
  }

  // Load delivery days for change delivery days action
  const loadChangeDeliveryDaysData = async () => {
    const subscriptionId = subscriptionData?.subscriptionHeader?.subscriptionId

    if (!subscriptionId) {
      console.error('❌ No subscription ID found for loading delivery days')
      setChangeDeliveryDaysData([])
      return
    }

    setLoadingChangeDeliveryDays(true)
    console.log('📅 Step 1: Loading ALL available delivery days')
    console.log('📅 Step 2: Will then get SELECTED delivery days for subscription ID:', subscriptionId)

    try {
      // Step 1: Get ALL available delivery days
      console.log('📡 Calling GetDeliveryDays API...')
      const availableDeliveryDaysResponse = await fetch(`http://eg.localhost:7167/api/v1/CreateSubscriptions/GetDeliveryDays`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!availableDeliveryDaysResponse.ok) {
        throw new Error(`HTTP error getting available delivery days! status: ${availableDeliveryDaysResponse.status}`)
      }

      const availableDeliveryDaysData = await availableDeliveryDaysResponse.json()
      console.log('✅ Step 1 Complete - Available delivery days API response:', availableDeliveryDaysData)

      const allDeliveryDaysArray = availableDeliveryDaysData?.data || availableDeliveryDaysData || []

      console.log('📅 All available delivery days:', allDeliveryDaysArray)
      setChangeDeliveryDaysData(allDeliveryDaysArray)

      // Step 2: Get CURRENTLY SELECTED delivery days for this subscription
      console.log('📡 Calling GetSelectedDeliveryDays API...')
      const selectedDeliveryDaysResponse = await fetch(`http://eg.localhost:7167/api/v1/ActionsManager/subscription/GetSelectedDeliveryDays/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!selectedDeliveryDaysResponse.ok) {
        throw new Error(`HTTP error getting selected delivery days! status: ${selectedDeliveryDaysResponse.status}`)
      }

      const selectedDeliveryDaysData = await selectedDeliveryDaysResponse.json()
      console.log('✅ Step 2 Complete - Currently selected delivery days API response:', selectedDeliveryDaysData)

      const selectedDeliveryDaysArray = selectedDeliveryDaysData?.data || selectedDeliveryDaysData || []

      // Extract selected delivery day names from the API response
      const selectedDeliveryDayNames = selectedDeliveryDaysArray.map(day =>
        day.day_name || day.dayName || day.name || day
      )

      console.log('🎯 Customer currently has these delivery days selected:', selectedDeliveryDayNames)
      console.log('📊 Total available delivery days:', allDeliveryDaysArray.length)
      console.log('📊 Customer selected delivery days:', selectedDeliveryDayNames.length)

      setActionData(prev => ({
        ...prev,
        selectedDeliveryDays: selectedDeliveryDayNames,
        currentlySelectedDeliveryDays: selectedDeliveryDayNames // For display purposes
      }))

    } catch (error) {
      console.error('❌ Error loading delivery days for change action:', error)
      setChangeDeliveryDaysData([])
      // Fallback to empty array if API fails
      setActionData(prev => ({ ...prev, selectedDeliveryDays: [] }))
    } finally {
      setLoadingChangeDeliveryDays(false)
    }
  }

  // Load customer phone data for change phone action
  const loadChangeCustomerPhoneData = async () => {
    const customerId = subscriptionData?.subscriptionHeader?.customerId || subscriptionData?.subscriptionHeader?.customerID

    if (!customerId) {
      console.error('❌ No customer ID found for loading customer phone data')
      setChangeCustomerPhoneData([])
      return
    }

    setLoadingChangeCustomerPhone(true)
    console.log('📞 Loading customer phone data for customer ID:', customerId)

    try {
      console.log('📡 Calling GetCustomerPhone API...')
      const response = await fetch(`http://eg.localhost:7167/api/v1/ActionsManager/subscription/${customerId}/GetCustomerPhone`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error getting customer phone data! status: ${response.status}`)
      }

      const phoneData = await response.json()
      console.log('✅ Customer phone data API response:', phoneData)

      const phoneArray = phoneData?.data || []
      console.log('📞 Customer phone numbers:', phoneArray)
      console.log('📞 Phone array structure:', JSON.stringify(phoneArray, null, 2))

      setChangeCustomerPhoneData(phoneArray)

      // Pre-populate the action data with current phone numbers
      const phoneNumbers = {
        mobile: '',
        workPhone: '',
        homePhone: '',
        otherPhone: ''
      }

      phoneArray.forEach(phone => {
        const phoneType = phone.phoneType
        if (phoneType === 'Mobile') {
          phoneNumbers.mobile = phone.phone || ''
        } else if (phoneType === 'Work Phone') {
          phoneNumbers.workPhone = phone.phone || ''
        } else if (phoneType === 'Home Phone') {
          phoneNumbers.homePhone = phone.phone || ''
        } else if (phoneType === 'Other Phone') {
          phoneNumbers.otherPhone = phone.phone || ''
        }
      })

      console.log('📞 Pre-populated phone numbers:', phoneNumbers)
      setActionData(prev => ({ ...prev, ...phoneNumbers }))

    } catch (error) {
      console.error('❌ Error loading customer phone data:', error)
      setChangeCustomerPhoneData([])
      // Fallback to empty phone numbers if API fails
      setActionData(prev => ({
        ...prev,
        mobile: '',
        workPhone: '',
        homePhone: '',
        otherPhone: ''
      }))
    } finally {
      setLoadingChangeCustomerPhone(false)
    }
  }

  // Load customer address data for change address action
  const loadChangeCustomerAddressData = async () => {
    const customerId = subscriptionData?.subscriptionHeader?.customerId || subscriptionData?.subscriptionHeader?.customerID
    const currentSubscriptionId = subscriptionData?.subscriptionHeader?.subscriptionId || subscriptionData?.subscriptionHeader?.id

    if (!customerId) {
      console.error('❌ No customer ID found for loading customer address data')
      setChangeCustomerAddressData([])
      return
    }

    if (!currentSubscriptionId) {
      console.error('❌ No subscription ID found for loading customer address data')
      setChangeCustomerAddressData([])
      return
    }

    setLoadingChangeCustomerAddress(true)
    console.log('🏠 Loading customer address data for customer ID:', customerId)
    console.log('🏠 Using subscription ID:', currentSubscriptionId)

    try {
      // Load customer address data and all branches
      console.log('📡 Calling GetCustomerAdress and branches APIs...')
      const [addressResponse, branchesResponse] = await Promise.all([
        fetch(`http://eg.localhost:7167/api/v1/ActionsManager/subscription/${customerId}/GetCustomerAdress`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://eg.localhost:7167/api/v1/ActionsManager/branches`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      ])

      if (!addressResponse.ok) {
        throw new Error(`HTTP error getting customer address data! status: ${addressResponse.status}`)
      }

      if (!branchesResponse.ok) {
        throw new Error(`HTTP error getting branches data! status: ${branchesResponse.status}`)
      }

      const addressData = await addressResponse.json()
      const branchesData = await branchesResponse.json()

      console.log('🏠 Customer address response:', addressData)
      console.log('🏢 Branches response:', branchesData)

      const addressArray = addressData?.data || []
      const branchesArray = branchesData?.data || []

      console.log('🏠 Customer addresses:', addressArray)
      console.log('🏢 Branches:', branchesArray)

      setChangeCustomerAddressData(addressArray)
      setBranches(branchesArray)

      // Pre-populate form with existing address data
      const addressFormData = {}

      // Find the default address or use the first one
      const defaultAddress = addressArray.find(addr => addr.isDefault) || addressArray[0]

      if (defaultAddress) {
        addressFormData.branch = defaultAddress.branchId || ''
        addressFormData.area = defaultAddress.areaId || ''
        addressFormData.address = defaultAddress.address || ''
        addressFormData.isDefault = defaultAddress.isDefault || false

        // If there's a branch ID, load areas for that branch
        if (defaultAddress.branchId) {
          loadAreasForBranch(defaultAddress.branchId)
        }
      }

      console.log('🏠 Pre-populated address data:', addressFormData)
      setActionData(prev => ({ ...prev, ...addressFormData }))

    } catch (error) {
      console.error('❌ Error loading customer address data:', error)
      setChangeCustomerAddressData([])
      setBranches([])
      setAreas([])
      // Fallback to empty address data if API fails
      setActionData(prev => ({
        ...prev,
        branch: '',
        area: '',
        address: '',
        isDefault: false
      }))
    } finally {
      setLoadingChangeCustomerAddress(false)
    }
  }

  // Load areas for a specific branch
  const loadAreasForBranch = async (branchId) => {
    if (!branchId) {
      setAreas([])
      return
    }

    try {
      console.log('📡 Loading areas for branch ID:', branchId)
      const response = await fetch(`http://eg.localhost:7167/api/v1/ActionsManager/areas/${branchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error getting areas for branch! status: ${response.status}`)
      }

      const areasData = await response.json()
      console.log('🌍 Areas for branch response:', areasData)

      const areasArray = areasData?.data || []
      console.log('🌍 Areas for branch:', areasArray)
      setAreas(areasArray)

    } catch (error) {
      console.error('❌ Error loading areas for branch:', error)
      setAreas([])
    }
  }

  // Helper functions for address management
  const addNewAddress = () => {
    const { branch, area, address, isDefault } = actionData

    if (!branch || !area || !address.trim()) {
      alert('Please fill in all required fields (Branch, Area, and Address)')
      return
    }

    const branchName = branches.find(b => b.branchID == branch)?.branchName || 'Unknown Branch'
    const areaName = areas.find(a => a.areaID == area)?.areaName || 'Unknown Area'

    // If this address is being set as default, unset all other addresses
    if (isDefault) {
      // Update existing addresses to not be default
      setChangeCustomerAddressData(prev =>
        prev.map(addr => ({ ...addr, isDefault: false }))
      )
      // Update new addresses to not be default
      setNewAddresses(prev =>
        prev.map(addr => ({ ...addr, isDefault: false }))
      )
    }

    const newAddress = {
      id: 0, // New address
      areaId: parseInt(area),
      areaName: areaName,
      branchId: parseInt(branch),
      branchName: branchName,
      adress: address.trim(),
      address: address.trim(), // Keep both for compatibility
      isDefault: isDefault || false,
      isNew: true
    }

    setNewAddresses(prev => [...prev, newAddress])

    // Clear form
    setActionData(prev => ({
      ...prev,
      branch: '',
      area: '',
      address: '',
      isDefault: false
    }))
    setAreas([])
  }

  const editAddress = (index, isExisting = true) => {
    const addressToEdit = isExisting ? changeCustomerAddressData[index] : newAddresses[index]

    setEditAddressData({
      address: addressToEdit.adress || addressToEdit.address || '',
      isDefault: addressToEdit.isDefault || false
    })

    setEditingAddressIndex(isExisting ? `existing_${index}` : `new_${index}`)
    setShowEditAddressDialog(true)
  }

  const updateAddress = () => {
    const { address, isDefault } = editAddressData

    if (!address.trim()) {
      alert('Please enter an address')
      return
    }

    // If this address is being set as default, unset all other addresses
    if (isDefault) {
      // Update existing addresses to not be default
      setChangeCustomerAddressData(prev =>
        prev.map(addr => ({ ...addr, isDefault: false }))
      )
      // Update new addresses to not be default
      setNewAddresses(prev =>
        prev.map(addr => ({ ...addr, isDefault: false }))
      )
    }

    if (editingAddressIndex?.startsWith('existing_')) {
      const index = parseInt(editingAddressIndex.replace('existing_', ''))
      const updatedAddresses = [...changeCustomerAddressData]
      updatedAddresses[index] = {
        ...updatedAddresses[index],
        adress: address.trim(),
        address: address.trim(), // Keep both for compatibility
        isDefault: isDefault || false
      }
      setChangeCustomerAddressData(updatedAddresses)
    } else if (editingAddressIndex?.startsWith('new_')) {
      const index = parseInt(editingAddressIndex.replace('new_', ''))
      const updatedAddresses = [...newAddresses]
      updatedAddresses[index] = {
        ...updatedAddresses[index],
        adress: address.trim(),
        address: address.trim(), // Keep both for compatibility
        isDefault: isDefault || false
      }
      setNewAddresses(updatedAddresses)
    }

    // Close dialog and clear editing state
    setShowEditAddressDialog(false)
    setEditAddressData({
      address: '',
      isDefault: false
    })
    setEditingAddressIndex(null)
  }

  const deleteAddress = async (index, isExisting = true) => {
    if (isExisting) {
      const addressToDelete = changeCustomerAddressData[index]

      // Check if address can be deleted (only for existing addresses with ID)
      const subscriptionId = subscriptionData?.subscriptionHeader?.subscriptionId ||
                           subscriptionData?.subscriptionHeader?.sid ||
                           subscriptionData?.subscriptionHeader?.id

      if (addressToDelete.id && addressToDelete.id > 0 && subscriptionId) {
        // Try different possible property names for the delivery address ID
        const deliveryAddressId = addressToDelete.deliveryAdress ||
                                 addressToDelete.deliveryAddressId ||
                                 addressToDelete.addressId ||
                                 addressToDelete.id

        console.log('🔍 Checking if address can be deleted:', {
          addressId: addressToDelete.id,
          deliveryAdress: addressToDelete.deliveryAdress,
          deliveryAddressId: deliveryAddressId,
          subscriptionId: subscriptionId,
          addressToDelete: addressToDelete,
          availableIds: {
            subscriptionId: subscriptionData?.subscriptionHeader?.subscriptionId,
            sid: subscriptionData?.subscriptionHeader?.sid,
            id: subscriptionData?.subscriptionHeader?.id
          }
        })

        try {
          setIsLoading(true)
          const response = await apiService.checkCustomerAddress(deliveryAddressId)

          console.log('📡 API Response:', response)

          // If response is false or success is false, address cannot be deleted
          if (response === false || response.success === false) {
            showError('This address is currently in use and cannot be deleted.')
            return
          }
        } catch (error) {
          console.error('❌ Error checking address:', error)
          showError('Error checking if address can be deleted. Please try again.')
          return
        } finally {
          setIsLoading(false)
        }
      } else {
        console.log('⚠️ Skipping API check - missing data:', {
          hasId: !!addressToDelete.id,
          idValue: addressToDelete.id,
          hasSubscriptionId: !!subscriptionId,
          subscriptionIdValue: subscriptionId,
          availableFields: {
            subscriptionId: subscriptionData?.subscriptionHeader?.subscriptionId,
            sid: subscriptionData?.subscriptionHeader?.sid,
            id: subscriptionData?.subscriptionHeader?.id
          }
        })
      }

      // Add to delete list if it has an ID (existing address)
      if (addressToDelete.id && addressToDelete.id > 0) {
        setAddressesToDelete(prev => [...prev, addressToDelete.id])
      }

      // Remove from current list
      setChangeCustomerAddressData(prev => prev.filter((_, i) => i !== index))
    } else {
      // Remove from new addresses list (no validation needed for new addresses)
      setNewAddresses(prev => prev.filter((_, i) => i !== index))
    }
  }

  const cancelEdit = () => {
    setActionData(prev => ({
      ...prev,
      branch: '',
      area: '',
      address: '',
      isDefault: false
    }))
    setEditingAddressIndex(null)
    setAreas([])
  }

  const cancelEditAddress = () => {
    setShowEditAddressDialog(false)
    setEditAddressData({
      address: '',
      isDefault: false
    })
    setEditingAddressIndex(null)
  }

  const resetAddressManagement = () => {
    setChangeCustomerAddressData([])
    setNewAddresses([])
    setAddressesToDelete([])
    setEditingAddressIndex(null)
    setShowEditAddressDialog(false)
    setAreas([])
    setActionData(prev => ({
      ...prev,
      branch: '',
      area: '',
      address: '',
      isDefault: false
    }))
    setEditAddressData({
      address: '',
      isDefault: false
    })
  }

  // Load meal types when renew dialog opens
  useEffect(() => {
    console.log('🔍 useEffect triggered - selectedAction:', selectedAction)
    console.log('🔍 useEffect triggered - subscriptionData:', subscriptionData)
    console.log('🔍 useEffect triggered - subscriptionHeader:', subscriptionData?.subscriptionHeader)
    console.log('🔍 useEffect triggered - planID:', subscriptionData?.subscriptionHeader?.planID)

    // Check all possible plan ID field names
    const possiblePlanIds = {
      planID: subscriptionData?.subscriptionHeader?.planID,
      planId: subscriptionData?.subscriptionHeader?.planId,
      plan_id: subscriptionData?.subscriptionHeader?.plan_id,
      PlanID: subscriptionData?.subscriptionHeader?.PlanID,
      PlanId: subscriptionData?.subscriptionHeader?.PlanId
    }
    console.log('🔍 All possible plan ID fields:', possiblePlanIds)

    if (selectedAction?.type === 'renew') {
      console.log('✅ Renew action detected!')

      const planId = subscriptionData?.subscriptionHeader?.planID ||
                     subscriptionData?.subscriptionHeader?.planId ||
                     subscriptionData?.subscriptionHeader?.plan_id ||
                     subscriptionData?.subscriptionHeader?.PlanID ||
                     subscriptionData?.subscriptionHeader?.PlanId

      const planName = subscriptionData?.subscriptionHeader?.planName
      // IMPORTANT: Prioritize numeric planID over planName for API calls
      const planIdentifier = planId || planName

      if (planIdentifier) {
        console.log('✅ Plan identifier found:', planIdentifier, '(type:', typeof planIdentifier, ') loading meal types...')
        loadMealTypesForRenew()
      } else {
        console.log('❌ No plan ID found in subscription data')
        console.log('🔍 Full subscription data:', subscriptionData)
        console.log('🔍 Subscription header keys:', Object.keys(subscriptionData?.subscriptionHeader || {}))

        // Log each field and its value to find the plan ID
        const header = subscriptionData?.subscriptionHeader || {}
        Object.keys(header).forEach(key => {
          console.log(`🔍 Field "${key}":`, header[key])
        })
      }
    } else {
      console.log('❌ Not a renew action, selectedAction type:', selectedAction?.type)
    }
  }, [selectedAction, subscriptionData])

  // Mock subscription data for demonstration
  const mockSubscriptionData = {
    subscriptionHeader: {
      customerId: 'CUST001',
      customerName: 'John Doe',
      phoneNumber: '+1234567890',
      email: 'john.doe@example.com',
      address: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      joinDate: '2023-12-15',
      subscriptionId: 'SUB001',
      planName: 'Premium Meal Plan',
      planType: 'Weekly',
      status: 'Active',
      startDate: '2024-01-15',
      endDate: '2024-12-15',
      nextDelivery: '2024-02-01',
      deliveryDays: ['Monday', 'Wednesday', 'Friday'],
      deliveryTime: '12:00 PM - 2:00 PM',
      deliveryAddress: '123 Main Street, Apt 4B, New York, NY 10001',
      totalMeals: 12,
      remainingMeals: 8,
      monthlyPrice: 299.99,
      totalPaid: 2399.92,
      paymentMethod: 'Credit Card (**** 1234)',
      lastPayment: '2024-01-15',
      nextPayment: '2024-02-15'
    },
    subscriptionDetails: [
      {
        id: 1,
        date: '2024-01-29',
        mealType: 'Breakfast',
        status: 'Delivered',
        deliveryTime: '08:30 AM',
        items: ['Oatmeal Bowl', 'Fresh Fruits', 'Green Tea']
      },
      {
        id: 2,
        date: '2024-01-29',
        mealType: 'Lunch',
        status: 'Delivered',
        deliveryTime: '12:00 PM',
        items: ['Grilled Chicken Salad', 'Quinoa', 'Sparkling Water']
      },
      {
        id: 3,
        date: '2024-01-31',
        mealType: 'Dinner',
        status: 'Scheduled',
        deliveryTime: '06:00 PM',
        items: ['Salmon Fillet', 'Roasted Vegetables', 'Brown Rice']
      },
      {
        id: 4,
        date: '2024-02-01',
        mealType: 'Breakfast',
        status: 'Scheduled',
        deliveryTime: '08:30 AM',
        items: ['Protein Smoothie', 'Granola', 'Herbal Tea']
      }
    ]
  }

  // View options for tabs - in the exact sequence requested
  const viewOptions = [
    { id: 'details', label: 'Subscription Details', icon: Package },
    { id: 'customerLog', label: 'Customer Log', icon: User },
    { id: 'invoiceLog', label: 'Invoice Log', icon: FileText },
    { id: 'deliveryLog', label: 'Delivery Log', icon: Truck },
    { id: 'deliveryNotesLog', label: 'Delivery Notes Log', icon: Edit },
    { id: 'dislikeMealsLog', label: 'Dislike Meals Log', icon: X },
    { id: 'mealsLog', label: 'Meals Log', icon: Calendar }
  ]



  // Status colors
  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Expired': 'bg-red-100 text-red-800',
      'Hold': 'bg-yellow-100 text-yellow-800',
      'Restricted': 'bg-orange-100 text-orange-800',
      'PackUp': 'bg-blue-100 text-blue-800',
      'Refund': 'bg-purple-100 text-purple-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Delivery Status Colors - Based on DeliveryStatus enum
  const getDeliveryStatusColor = (status, type = 'badge') => {
    const statusLower = status?.toLowerCase() || 'pending'

    const colorMap = {
      'pending': {
        badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50',
        button: {
          selected: 'bg-yellow-500 dark:bg-yellow-600 text-white shadow-sm',
          default: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/70'
        }
      },
      'deliveried': {
        badge: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50',
        button: {
          selected: 'bg-green-500 dark:bg-green-600 text-white shadow-sm',
          default: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70'
        }
      },
      'delivered': {
        badge: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50',
        button: {
          selected: 'bg-green-500 dark:bg-green-600 text-white shadow-sm',
          default: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70'
        }
      },
      'notdelivered': {
        badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/50',
        button: {
          selected: 'bg-red-500 dark:bg-red-600 text-white shadow-sm',
          default: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/70'
        }
      },
      'hold': {
        badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800/50',
        button: {
          selected: 'bg-orange-500 dark:bg-orange-600 text-white shadow-sm',
          default: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/70'
        }
      },
      'resticited': {
        badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/50',
        button: {
          selected: 'bg-rose-600 dark:bg-rose-700 text-white shadow-sm',
          default: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/70'
        }
      },
      'restricted': {
        badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/50',
        button: {
          selected: 'bg-rose-600 dark:bg-rose-700 text-white shadow-sm',
          default: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/70'
        }
      },
      'canceld': {
        badge: 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600',
        button: {
          selected: 'bg-gray-500 dark:bg-gray-600 text-white shadow-sm',
          default: 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/70'
        }
      },
      'cancelled': {
        badge: 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600',
        button: {
          selected: 'bg-gray-500 dark:bg-gray-600 text-white shadow-sm',
          default: 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/70'
        }
      },
      'pickedup': {
        badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
        button: {
          selected: 'bg-purple-500 dark:bg-purple-600 text-white shadow-sm',
          default: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/70'
        }
      },
      'refund': {
        badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50',
        button: {
          selected: 'bg-indigo-500 dark:bg-indigo-600 text-white shadow-sm',
          default: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/70'
        }
      },
      'prepared': {
        badge: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800/50',
        button: {
          selected: 'bg-teal-500 dark:bg-teal-600 text-white shadow-sm',
          default: 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/70'
        }
      }
    }

    const defaultColors = {
      badge: 'bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-600',
      button: {
        selected: 'bg-slate-500 dark:bg-slate-600 text-white shadow-sm',
        default: 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-900/70'
      }
    }

    return colorMap[statusLower]?.[type] || defaultColors[type]
  }

  // Get unique meal types from subscription data
  const getUniqueMealTypes = (subscriptionData) => {
    console.log('🔍 Checking subscription data for meal types:', subscriptionData)

    const mealTypes = new Set()

    // Method 1: Get from subscriptionHeader.mealTypes (string format)
    if (subscriptionData?.subscriptionHeader?.mealTypes) {
      const headerMealTypes = subscriptionData.subscriptionHeader.mealTypes.split('|')
      console.log('📋 Meal types from header:', headerMealTypes)
      headerMealTypes.forEach(type => {
        if (type.trim()) {
          mealTypes.add(type.trim())
        }
      })
    }

    // Method 2: Get from individual meal details (backup)
    if (subscriptionData?.subscriptionDetails) {
      console.log('📊 Number of meals:', subscriptionData.subscriptionDetails.length)
      subscriptionData.subscriptionDetails.forEach((meal, index) => {
        const mealType = meal.mealTypeName || meal.mealType
        if (mealType) {
          mealTypes.add(mealType)
        }
      })
    }

    console.log('🎯 Found meal types:', Array.from(mealTypes))

    // Sort meal types in a logical order
    const typeOrder = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK 1', 'SNACK 2', 'SNACK 3', 'SNACK 4', 'SNACK 5']
    const sortedTypes = Array.from(mealTypes).sort((a, b) => {
      const aIndex = typeOrder.indexOf(a)
      const bIndex = typeOrder.indexOf(b)
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })

    console.log('✅ Final sorted meal types:', sortedTypes)
    return sortedTypes
  }

  // Group meals by delivery date AND delivery status
  const groupMealsByDate = (subscriptionDetails) => {
    if (!subscriptionDetails) return []

    console.log('🔄 Grouping meals by date AND delivery status. Input data:', subscriptionDetails)

    const grouped = {}
    subscriptionDetails.forEach((meal, index) => {
      console.log(`🍽️ Processing meal ${index}:`, meal)
      console.log(`📅 Date: ${meal.deliveryDate || meal.date}`)

      // Debug: Check all possible status fields
      console.log(`🔍 Available fields:`, Object.keys(meal))
      console.log(`📦 meal.deliveryStatus: ${meal.deliveryStatus}`)
      console.log(`📦 meal.status: ${meal.status}`)
      console.log(`📦 meal.deliveryState: ${meal.deliveryState}`)
      console.log(`📦 meal.state: ${meal.state}`)

      // Try both mealTypeName and mealType fields
      const mealType = meal.mealTypeName || meal.mealType
      console.log(`🏷️ Meal type: ${mealType} (from ${meal.mealTypeName ? 'mealTypeName' : 'mealType'})`)
      console.log(`🍴 Meal name: ${meal.mealName}`)

      const dateKey = meal.deliveryDate || meal.date
      // Try multiple possible status field names
      const statusKey = meal.deliveryStatus || meal.status || meal.deliveryState || meal.state || 'Unknown'
      console.log(`📦 Final status used: ${statusKey}`)

      // Create composite key: date + status
      const compositeKey = `${dateKey}|${statusKey}`
      console.log(`🔑 Composite key: ${compositeKey}`)

      if (!grouped[compositeKey]) {
        grouped[compositeKey] = {
          date: dateKey,
          dayName: meal.dayName,
          dayNumberCount: meal.dayNumberCount,
          deliveryStatus: statusKey,
          lineState: meal.lineState,
          meals: {}
        }
        console.log(`✨ Created new group for: ${compositeKey}`)
      }

      // Only add meal if it has a valid meal type
      if (mealType) {
        grouped[compositeKey].meals[mealType] = meal
      }
    })

    const result = Object.values(grouped).sort((a, b) => {
      // First sort by date, then by status
      const dateCompare = new Date(a.date) - new Date(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.deliveryStatus.localeCompare(b.deliveryStatus)
    })

    console.log('📊 Final grouped result (by date + status):', result)
    console.log('📈 Total groups created:', result.length)
    console.log('📋 Groups summary:', result.map(g => `${g.date} - ${g.deliveryStatus} (${Object.keys(g.meals).length} meals)`))
    return result
  }

  // Transform phone search API data (enhanced with real API fields)
  const transformPhoneSearchData = (subscription) => {
    console.log('Transforming phone search data:', subscription)

    // Handle both direct subscription object and nested subscriptionHeader structure
    const header = subscription.subscriptionHeader || subscription
    const details = subscription.subscriptionDetails || []

    // DEBUG: Log the raw header to see if planID exists
    console.log('🔍 RAW PHONE SEARCH HEADER:', header)
    console.log('🔍 RAW phone header.planID:', header.planID)
    console.log('🔍 RAW phone header.planId:', header.planId)
    console.log('🔍 RAW phone header.planName:', header.planName)

    return {
      subscriptionHeader: {
        // Customer Info - using real API fields
        customerName: header.customerName || header.customer_name || header.name || 'N/A',
        phoneNumber: header.phoneNumber || header.phone_number || header.phone || searchQuery || 'N/A',
        email: header.email || header.customer_email || 'N/A',
        customerId: header.customerId || header.customer_id || header.customerID || 'N/A',
        address: header.address || header.customer_address || 'N/A',
        city: header.city || header.customer_city || 'N/A',
        state: header.state || header.customer_state || 'N/A',
        zipCode: header.zipCode || header.zip_code || header.postal_code || 'N/A',
        joinDate: header.joinDate || header.join_date || header.createDate || header.created_at || new Date().toISOString(),
        branchName: header.branchName || header.branch_name || header.branch || 'N/A',

        // Subscription Info - using real API fields
        subscriptionId: header.subscriptionId || header.subscription_id || header.sid || header.id || 'N/A',
        planName: header.planName || header.plan_name || header.plan || 'N/A',
        planID: header.planID || header.planId || header.plan_id || null, // Add the missing planID field
        planType: header.planType || header.plan_type || header.type || 'N/A',
        deliveryDays: header.deliveryDays || header.delivery_days || [],
        deliveryTime: header.deliveryTime || header.delivery_time || 'N/A',
        nextDelivery: header.nextDelivery || header.next_delivery ||
                      (header.lastDeliveryDate && header.lastDeliveryDate !== "Not Start Delivery Yet!" ?
                       header.lastDeliveryDate : 'Delivery Not Started'),
        deliveryAddress: header.deliveryAddress || header.delivery_address || header.address || 'N/A',

        // Status & Billing - using real API fields
        status: header.status || header.subscription_status || 'Unknown',
        startDate: header.startDate || header.start_date || header.createDate || header.created_at || new Date().toISOString(),
        endDate: header.endDate || header.end_date || header.expiry_date || 'N/A',
        monthlyPrice: header.monthlyPrice || header.monthly_price || header.price || 0,
        totalPaid: header.totalPaid || header.total_paid || header.amount_paid || 0,
        paymentMethod: header.paymentMethod || header.payment_method || 'N/A',
        nextPayment: header.nextPayment || header.next_payment || 'N/A',

        // Meals Progress - using real API fields
        totalMeals: header.totalMeals || header.total_meals || header.meal_count || 0,
        deliveredMeals: header.deliveredMeals || header.delivered_meals || header.meals_delivered || 0,
        remainingMeals: header.remainingMeals || header.remaining_meals || header.meals_remaining || 0,

        // Duration & Progress - using real API fields
        duration: header.duration || header.durtions || header.subscription_duration || 0,
        remainingDays: header.remainingDays || header.remaingDays || header.remaining_days || header.days_remaining || 0,
        progress: header.progress || header.completion_percentage || 0,

        // Plan Details - using real API fields
        planFile: header.planFile || header.plan_file || header.planfile || null,

        // Additional fields that might be in the API
        subscriptionType: header.subscriptionType || header.subscription_type || 'N/A',
        frequency: header.frequency || header.delivery_frequency || 'N/A',
        notes: header.notes || header.customer_notes || '',
        lastModified: header.lastModified || header.last_modified || header.updated_at || new Date().toISOString()
      },
      subscriptionDetails: details // Include actual details if available
    }
  }

  // Transform API response to expected format
  const transformApiData = (apiResponse) => {
    if (!apiResponse?.data?.subscriptionHeader) return null

    const header = apiResponse.data.subscriptionHeader
    const details = apiResponse.data.subscriptionDetails || []

    // DEBUG: Log the raw header to see if planID exists
    console.log('🔍 RAW API HEADER in transformApiData:', header)
    console.log('🔍 RAW header.planID:', header.planID)
    console.log('🔍 RAW header.planId:', header.planId)
    console.log('🔍 RAW header.planName:', header.planName)

    // Parse delivery days from string
    const deliveryDays = header.deliveryDays ? header.deliveryDays.split('|') : []

    // Calculate total meals and remaining meals from details
    const totalMeals = details.length
    const deliveredMeals = details.filter(meal => meal.deliveryStatus === 'Delivered').length
    const remainingMeals = totalMeals - deliveredMeals

    return {
      subscriptionHeader: {
        // Customer Info
        customerName: header.customerName || header.subscriperName || 'N/A',
        phoneNumber: header.phone || 'N/A',
        email: 'N/A', // Not provided in API
        customerId: header.customerID || 'N/A',
        address: header.adress?.adress || 'N/A',
        city: 'N/A', // Not provided in API
        state: 'N/A', // Not provided in API
        zipCode: 'N/A', // Not provided in API
        joinDate: header.createDate || new Date().toISOString(),

        // Subscription Info
        subscriptionId: header.subscriptionID || header.subscriptionsID || 'N/A',
        planName: header.planName || header.plan || 'N/A',
        planID: header.planID || header.planId || null, // Add the missing planID field
        planType: 'N/A', // Not directly provided
        deliveryDays: deliveryDays,
        deliveryTime: 'N/A', // Not provided in API
        nextDelivery: header.lastDeliveryDay &&
                      header.lastDeliveryDay !== "Not Start Delivery Yet!" &&
                      header.lastDeliveryDay !== "Not Started" &&
                      header.lastDeliveryDay !== "N/A" ?
                      header.lastDeliveryDay : 'Delivery Not Started',
        deliveryAddress: header.adress?.adress || 'N/A',

        // Status & Billing
        status: header.status || 'Unknown',
        startDate: header.createDate || new Date().toISOString(),
        endDate: 'N/A', // Calculate from duration if needed
        monthlyPrice: 0, // Not provided in API
        totalPaid: 0, // Not provided in API
        paymentMethod: 'N/A', // Not provided in API
        nextPayment: 'N/A', // Not provided in API

        // Meals Progress
        totalMeals: totalMeals,
        remainingMeals: remainingMeals,

        // Additional Info
        branchName: header.branch?.branchName || 'N/A',
        driverName: header.driver?.driverName || 'N/A',
        duration: header.durations || 0,
        remainingDays: header.remaingDays || 0
      },
      subscriptionDetails: details.map(meal => ({
        id: meal.id,
        dayID: meal.dayID, // Add dayID field
        dayNumberCount: meal.dayNumberCount, // Add dayNumberCount field
        date: meal.deliveryDate,
        mealType: meal.mealTypeName,
        status: meal.deliveryStatus,
        deliveryTime: 'N/A', // Not provided
        items: [meal.mealName], // Single meal name as array
        mealName: meal.mealName,
        dayName: meal.dayName,
        driver: meal.driver,
        notes: meal.notes,
        deliveryNotes: meal.deliveryNotes
      }))
    }
  }

  // Delete days handler
  const handleDeleteDays = async () => {
    const selectedCount = selectedRows.length

    if (selectedCount === 0) {
      alert('Please select at least one day to delete')
      return
    }

    // Show custom confirmation dialog
    setDeleteConfirmData({
      count: selectedCount,
      message: `Are you sure you want to delete ${selectedCount} selected day${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`
    })
    setShowDeleteConfirm(true)
  }

  // Confirm delete days
  const confirmDeleteDays = async () => {
    const selectedCount = selectedRows.length

    // Close confirmation dialog
    setShowDeleteConfirm(false)
    setDeleteConfirmData(null)

    try {
      // Get selected day data for API call
      console.log('🔍 Debug - Selected row IDs:', selectedRows)
      console.log('🔍 Debug - All subscription details:', subscriptionData?.subscriptionDetails)
      console.log('🔍 Debug - Sample detail structure:', subscriptionData?.subscriptionDetails?.[0])

      // Try different possible ID fields for matching
      const selectedDays = subscriptionData?.subscriptionDetails
        ?.filter(detail => {
          // Try multiple possible ID fields
          const matchFound = selectedRows.includes(detail.dayID) ||
                           selectedRows.includes(detail.id) ||
                           selectedRows.includes(detail.dayId) ||
                           selectedRows.includes(String(detail.dayID)) ||
                           selectedRows.includes(String(detail.id))

          console.log(`🔍 Checking detail:`, {
            dayID: detail.dayID,
            id: detail.id,
            deliveryDate: detail.deliveryDate,
            matchFound: matchFound
          })

          return matchFound
        })
        ?.map(detail => {
          // Ensure the date is in the correct timestamp format
          const date = detail.deliveryDate || detail.date
          console.log('🔍 Processing date:', date)
          // If it's already a timestamp string, use it; otherwise convert
          return date && date.includes('T') ? date : `${date}T00:00:00.000Z`
        }) || []

      console.log('🔍 Debug - Filtered details count:', selectedDays.length)
      console.log('🔍 Debug - Selected days for API:', selectedDays)

      if (selectedDays.length === 0) {
        throw new Error('No valid days found for deletion')
      }

      const requestBody = {
        days: selectedDays,
        notes: "Days deleted via subscription management"
      }

      // Debug subscription data structure
      console.log('🔍 Debug - Full subscription data:', subscriptionData)
      console.log('🔍 Debug - Subscription header:', subscriptionData?.subscriptionHeader)
      console.log('🔍 Debug - Available keys:', Object.keys(subscriptionData || {}))

      const subscriptionId = subscriptionData?.subscriptionHeader?.subscriptionId ||
                           subscriptionData?.subscriptionHeader?.sid ||
                           subscriptionData?.sid ||
                           subscriptionData?.subscriptionId ||
                           subscriptionData?.id

      console.log('🔍 Debug - Found subscription ID:', subscriptionId)

      if (!subscriptionId) {
        console.error('❌ Subscription data structure:', subscriptionData)
        throw new Error('Subscription ID not found. Please ensure a subscription is loaded.')
      }

      console.log(`🗑️ Deleting ${selectedCount} days for subscription ${subscriptionId}`)
      console.log('📤 Request body:', requestBody)

      const response = await makeApiCall(`http://eg.localhost:7167/api/v1/ActionsManager/subscription/${subscriptionId}/plan-days`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Delete days failed:', response.status, errorText)
        throw new Error(`Failed to delete days: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Delete days successful:', result)

      // Clear selection
      setSelectedRows([])

      // Refresh subscription data
      console.log('🔄 Refreshing subscription data...')
      if (subscriptionId) {
        handleSearch(subscriptionId.toString(), 'sid')
      }

    } catch (error) {
      console.error('❌ Error deleting days:', error)
      alert(`Error deleting days: ${error.message}`)
    }
  }

  // Cancel delete confirmation
  const cancelDeleteDays = () => {
    setShowDeleteConfirm(false)
    setDeleteConfirmData(null)
  }

  // Handle Change Days Status Action
  const handleChangeDaysStatus = () => {
    if (!selectedRows.length) {
      alert('Please select days to change status')
      return
    }

    setSelectedStatus('')
    setStatusChangeNotes('')
    setShowChangeStatusDialog(true)
  }

  // Submit change status
  const submitChangeStatus = async () => {
    if (!selectedStatus) {
      alert('Please select a status')
      return
    }

    const selectedCount = selectedRows.length

    try {
      // Get selected day data for API call
      const selectedDays = subscriptionData?.subscriptionDetails
        ?.filter(detail => {
          const matchFound = selectedRows.includes(detail.dayID) ||
                           selectedRows.includes(detail.id) ||
                           selectedRows.includes(detail.dayId) ||
                           selectedRows.includes(String(detail.dayID)) ||
                           selectedRows.includes(String(detail.id))
          return matchFound
        })
        ?.map(detail => {
          const date = detail.deliveryDate || detail.date
          return date && date.includes('T') ? date : `${date}T00:00:00.000Z`
        }) || []

      if (selectedDays.length === 0) {
        throw new Error('No valid days found for status change')
      }

      // Get subscription ID from current subscription data
      console.log('🔍 Debug subscription header:', subscriptionData?.subscriptionHeader)

      const currentSubscriptionId = subscriptionData?.subscriptionHeader?.subscriptionId ||
                                   subscriptionData?.subscriptionHeader?.sid ||
                                   subscriptionData?.subscriptionHeader?.id

      console.log('🔍 Available ID fields:', {
        subscriptionId: subscriptionData?.subscriptionHeader?.subscriptionId,
        sid: subscriptionData?.subscriptionHeader?.sid,
        id: subscriptionData?.subscriptionHeader?.id
      })

      if (!currentSubscriptionId) {
        throw new Error('Subscription ID not found. Available fields: ' + Object.keys(subscriptionData?.subscriptionHeader || {}).join(', '))
      }

      console.log('🔍 Using subscription ID:', currentSubscriptionId)

      const requestBody = {
        days: selectedDays,
        status: getStatusValue(selectedStatus)
      }

      const notes = statusChangeNotes || "Days status changed via subscription management"

      console.log('🔄 Changing status for days:', requestBody)
      console.log('🔄 Notes:', notes)

      const response = await fetch(`http://eg.localhost:7167/api/v1/ActionsManager/subscription/${currentSubscriptionId}/change-days-status?nots=${encodeURIComponent(notes)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Change status failed:', response.status, errorText)
        throw new Error(`Failed to change status: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Change status successful:', result)

      // Close dialog and clear selection
      setShowChangeStatusDialog(false)
      setSelectedStatus('')
      setStatusChangeNotes('')
      setSelectedRows([])

      // Refresh subscription data
      if (currentSubscriptionId) {
        handleSearch(currentSubscriptionId.toString(), 'sid')
      }

    } catch (error) {
      console.error('❌ Error changing status:', error)
      alert(`Error changing status: ${error.message}`)
    }
  }

  // Get status value for API (convert display value to API value)
  const getStatusValue = (status) => {
    // Map display values to API values if needed
    const statusMap = {
      'Pending': 0,
      'Deliveried': 1,
      'NotDelivered': 2,
      'Hold': 3,
      'Resticited': 4,
      'Canceld': 5,
      'PickedUp': 7,
      'Refund': 8,
      'Prepared': 9
    }
    return statusMap[status] !== undefined ? statusMap[status] : status
  }

  // Cancel change status dialog
  const cancelChangeStatus = () => {
    setShowChangeStatusDialog(false)
    setSelectedStatus('')
    setStatusChangeNotes('')
  }

  // Handle Refund Action
  const handleRefundAction = async () => {
    if (!subscriptionData?.subscriptionHeader) {
      alert('No subscription data available')
      return
    }

    setLoadingInvoices(true)
    setShowRefundDialog(true)

    try {
      await fetchInvoicesData()
    } catch (error) {
      console.error('❌ Error fetching invoices:', error)
      alert('Failed to fetch invoices: ' + error.message)
      setShowRefundDialog(false)
    } finally {
      setLoadingInvoices(false)
    }
  }

  // Handle Individual Invoice Refund - Show Confirmation
  const handleInvoiceRefund = (invoice) => {
    setRefundConfirmData({
      invoice: invoice,
      invoiceNo: invoice.invoiceNo,
      invoiceSerial: invoice.invoiceSerial
    })
    setShowRefundConfirm(true)
  }

  // Confirm and Process Refund
  const confirmRefund = async () => {
    try {
      const invoice = refundConfirmData.invoice
      const subscriptionId = subscriptionData.subscriptionHeader.subscriptionId ||
                           subscriptionData.subscriptionHeader.sid ||
                           subscriptionData.subscriptionHeader.id

      if (!subscriptionId || !invoice.invoiceNo) {
        throw new Error('Missing subscription ID or invoice number')
      }

      console.log('💰 Processing refund for invoice:', invoice.invoiceNo)

      // Close confirmation dialog
      setShowRefundConfirm(false)
      setRefundConfirmData(null)

      const response = await fetch(`http://eg.localhost:7167/api/v1/ActionsManager/subscription/refund?Sid=${subscriptionId}&InvoiceNumber=${invoice.invoiceNo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Refund failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Refund successful:', result)

      // Refresh invoices data to show updated status
      await fetchInvoicesData()

    } catch (error) {
      console.error('❌ Error processing refund:', error)
      alert('Failed to process refund: ' + error.message)
    }
  }

  // Cancel refund confirmation
  const cancelRefundConfirm = () => {
    setShowRefundConfirm(false)
    setRefundConfirmData(null)
  }

  // Fetch invoices data (extracted for reuse)
  const fetchInvoicesData = async () => {
    const subscriptionId = subscriptionData.subscriptionHeader.subscriptionId ||
                         subscriptionData.subscriptionHeader.sid ||
                         subscriptionData.subscriptionHeader.id

    if (!subscriptionId) {
      throw new Error('Subscription ID not found')
    }

    console.log('🔍 Fetching invoices for subscription:', subscriptionId)

    const response = await fetch(`http://eg.localhost:7167/api/v1/ActionsManager/subscription/GetInvoices/${subscriptionId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch invoices: ${response.status}`)
    }

    const data = await response.json()
    console.log('📄 Invoices data:', data)

    setInvoicesData(data.data || [])
  }

  // Cancel refund dialog
  const cancelRefund = () => {
    setShowRefundDialog(false)
    setInvoicesData([])

    // Refresh subscription data like other actions
    const currentSubscriptionId = subscriptionData?.subscriptionHeader?.subscriptionId ||
                                 subscriptionData?.subscriptionHeader?.sid ||
                                 subscriptionData?.subscriptionHeader?.id

    if (currentSubscriptionId) {
      handleSearch(currentSubscriptionId.toString(), 'sid')
    }
  }

  // Search handlers
  const handleSearch = async (query, type) => {
    if (!query.trim()) return

    setIsLoading(true)
    // Clear previous results
    setSubscriptionData(null)
    setSubscriptionsList([])
    setSelectedSubscription(null)

    // Don't clear tab data - we'll refresh the active tab instead

    try {
      let data = null

      if (type === 'sid') {
        // Use the real API endpoint for SID search
        data = await getSubscriptionBySID(query.trim())

        if (data) {
          console.log('Raw SID API Response:', data)
          const transformedData = transformApiData(data)
          console.log('Transformed SID Data:', transformedData)

          if (transformedData) {
            setSubscriptionData(transformedData)

            // Debug: Log current tab state
            console.log(`🔍 Current selectedView: ${selectedView}`)
            console.log(`🔍 About to refresh tab data for SID: ${transformedData.subscriptionHeader.subscriptionId}`)

            // Auto-refresh the currently active tab data
            await refreshActiveTabData(transformedData.subscriptionHeader.subscriptionId)

            success(`Subscription found for SID: ${query}`)
          } else {
            showError(`Invalid subscription data format for SID: ${query}`)
          }
        } else {
          showError(`No subscription found for SID: ${query}`)
        }

      } else if (type === 'phone') {
        // Use the real API endpoint for phone search (returns array)
        data = await searchByPhone(query.trim())

        console.log('Raw Phone API Response:', data)
        console.log('Data type:', typeof data)
        console.log('Is Array:', Array.isArray(data))
        console.log('Data keys:', data ? Object.keys(data) : 'No data')

        // Handle different response formats
        let subscriptionsArray = null

        if (Array.isArray(data)) {
          subscriptionsArray = data
          console.log('✅ Using direct array structure')
        } else if (data && data.data && Array.isArray(data.data)) {
          subscriptionsArray = data.data
          console.log('✅ Using data.data array structure')
        } else if (data && data.subscriptions && Array.isArray(data.subscriptions)) {
          subscriptionsArray = data.subscriptions
          console.log('✅ Using data.subscriptions array structure')
        } else if (data && typeof data === 'object') {
          // If it's a single object, wrap it in an array
          subscriptionsArray = [data]
          console.log('✅ Converting single object to array')
        }

        if (subscriptionsArray && subscriptionsArray.length > 0) {
          console.log('📋 Processing subscriptions array:', subscriptionsArray)
          console.log('🔍 First subscription structure:', subscriptionsArray[0])
          console.log('🗝️ First subscription keys:', Object.keys(subscriptionsArray[0] || {}))

          // Transform each subscription in the array using phone search transformer
          const transformedSubscriptions = subscriptionsArray.map((subscription, index) => {
            console.log(`🔄 Processing subscription ${index}:`, subscription)
            console.log(`🗝️ Subscription ${index} keys:`, Object.keys(subscription || {}))

            // Use the specialized phone search transformer
            const transformed = transformPhoneSearchData(subscription)
            console.log(`✅ Transformed subscription ${index}:`, transformed)
            return transformed
          }).filter(Boolean) // Remove any null/undefined results

          console.log('🎉 Final transformed subscriptions:', transformedSubscriptions)
          console.log('📊 Total successful transformations:', transformedSubscriptions.length)

          if (transformedSubscriptions.length > 0) {
            setSubscriptionsList(transformedSubscriptions)
            success(`Found ${transformedSubscriptions.length} subscription(s) for phone: ${query}`)
          } else {
            // Show raw data for debugging
            console.error('Failed to transform subscriptions. Raw data:', subscriptionsArray)
            showError(`Could not process subscription data for phone: ${query}. Check console for raw data.`)
          }
        } else {
          console.log('No subscriptions found in response')
          showError(`No subscriptions found for phone: ${query}`)
        }
      }

      // Add to search history
      const newHistoryItem = {
        id: Date.now(),
        query: query.trim(),
        type,
        timestamp: new Date().toISOString()
      }
      setSearchHistory(prev => [newHistoryItem, ...prev.slice(0, 4)])

    } catch (error) {
      console.error('Error fetching subscription data:', error)
      showError(`Failed to fetch subscription data: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to refresh the currently active tab data
  const refreshActiveTabData = async (subscriptionId) => {
    if (!subscriptionId) return

    // Use selectedView instead of activeTab
    const currentTab = selectedView

    // If no active tab, default to subscriptions details (no API call needed)
    if (!currentTab || currentTab === 'subscriptions') {
      console.log(`ℹ️ No tab refresh needed for subscriptions details tab`)
      return
    }

    try {
      console.log(`🔄 Auto-refreshing active tab: ${currentTab} for SID: ${subscriptionId}`)

      switch (currentTab) {
        case 'customerLog':
          const customerLogData = await getCustomerLog(subscriptionId)
          setCustomerLogData(customerLogData)
          console.log(`✅ Auto-refreshed Customer Log data: ${customerLogData.length} items`)
          break

        case 'invoiceLog':
          const invoiceLogData = await getInvoiceLog(subscriptionId)
          setInvoiceLogData(invoiceLogData)
          console.log(`✅ Auto-refreshed Invoice Log data: ${invoiceLogData.length} items`)
          break

        case 'deliveryLog':
          const deliveryNotesData = await getDeliveryNotes(subscriptionId)
          setDeliveryNotesData(deliveryNotesData)
          console.log(`✅ Auto-refreshed Delivery Notes data: ${deliveryNotesData.length} items`)
          break

        case 'dislikeMealsLog':
          const dislikeMealsData = await getDislikeMeals(subscriptionId)
          setDislikeMealsData(dislikeMealsData)
          console.log(`✅ Auto-refreshed Dislike Meals data: ${dislikeMealsData.length} items`)
          break

        default:
          console.log(`ℹ️ No auto-refresh handler for tab: ${currentTab}`)
          break
      }
    } catch (error) {
      console.error(`❌ Error auto-refreshing tab ${currentTab}:`, error)
    }
  }

  // Handle selecting a subscription from phone search results
  const handleSelectSubscription = async (subscription) => {
    setSelectedSubscription(subscription)
    setSubscriptionData(subscription)

    // Don't clear tab data - just refresh the active tab with new subscription data
    // Auto-refresh the currently active tab data
    await refreshActiveTabData(subscription.subscriptionHeader.subscriptionId)

    success(`Selected subscription: ${subscription.subscriptionHeader.subscriptionId}`)
  }

  // Handle View Details button click - fetch full subscription data by SID
  const handleViewDetails = async (subscription) => {
    const subscriptionId = subscription.subscriptionHeader.subscriptionId

    if (!subscriptionId || subscriptionId === 'N/A') {
      showError('Invalid subscription ID')
      return
    }

    setIsLoading(true)
    setLoadingSubscriptionId(subscriptionId)
    try {
      console.log(`🔍 Fetching detailed data for SID: ${subscriptionId}`)

      // Call the SID search service to get full subscription details
      const detailedData = await getSubscriptionBySID(subscriptionId)

      console.log('📋 Detailed SID API Response:', detailedData)

      if (detailedData && detailedData.data) {
        // Transform the detailed API response
        const transformedData = transformApiData(detailedData)

        if (transformedData) {
          console.log('✅ Transformed detailed data:', transformedData)

          // Set the detailed subscription data
          setSubscriptionData(transformedData)
          setSelectedSubscription(transformedData)

          // Don't clear tab data - just refresh the active tab with new subscription data
          // Auto-refresh the currently active tab data
          await refreshActiveTabData(transformedData.subscriptionHeader.subscriptionId)

          // Keep the search results visible - don't clear the list

          success(`Loaded detailed data for SID: ${subscriptionId}`)
        } else {
          showError(`Failed to process detailed data for SID: ${subscriptionId}`)
        }
      } else {
        showError(`No detailed data found for SID: ${subscriptionId}`)
      }
    } catch (error) {
      console.error('❌ Error fetching detailed subscription data:', error)
      showError(`Failed to load details for SID: ${subscriptionId}. ${error.message}`)
    } finally {
      setIsLoading(false)
      setLoadingSubscriptionId(null)
    }
  }



  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  // Get unique meal types for dynamic table columns
  const uniqueMealTypes = React.useMemo(() => {
    const types = getUniqueMealTypes(subscriptionData)
    console.log('🍽️ Detected meal types:', types)
    return types
  }, [subscriptionData])

  // Group meals by delivery date for table rows
  const groupedMeals = React.useMemo(() => {
    const grouped = groupMealsByDate(subscriptionData?.subscriptionDetails)
    console.log('📅 Grouped meals by date:', grouped)
    return grouped
  }, [subscriptionData])

  // Calculate status counts by grouping by delivery date first
  const statusCounts = React.useMemo(() => {
    if (!groupedMeals || groupedMeals.length === 0) return {}

    const counts = { all: groupedMeals.length } // Count of delivery dates, not individual meals

    // Count delivery dates by their delivery status
    groupedMeals.forEach((group, index) => {
      const status = group.deliveryStatus || 'Unknown'
      console.log(`📊 Group ${index} status: "${status}" (from deliveryStatus: ${group.deliveryStatus})`)
      counts[status] = (counts[status] || 0) + 1
    })

    console.log('📊 Status counts by delivery date:', counts)
    console.log('📅 Total delivery dates:', groupedMeals.length)
    return counts
  }, [groupedMeals])

  // Get unique statuses from grouped delivery dates
  const availableStatuses = React.useMemo(() => {
    if (!groupedMeals || groupedMeals.length === 0) return []

    const statuses = new Set()
    groupedMeals.forEach((group, index) => {
      console.log(`📅 Group ${index}:`, {
        date: group.date,
        dayName: group.dayName,
        deliveryStatus: group.deliveryStatus,
        mealsCount: Object.keys(group.meals || {}).length
      })

      const status = group.deliveryStatus
      if (status) {
        statuses.add(status)
      }
    })

    console.log('📋 Available statuses from delivery dates:', Array.from(statuses))
    console.log('📊 Total groups processed:', groupedMeals.length)
    return Array.from(statuses).sort()
  }, [groupedMeals])

  // Filter data based on status
  const filteredData = React.useMemo(() => {
    if (!subscriptionData?.subscriptionDetails) return []

    if (statusFilter === 'all') {
      return subscriptionData.subscriptionDetails
    }

    return subscriptionData.subscriptionDetails.filter(meal => {
      return meal.status === statusFilter
    })
  }, [subscriptionData?.subscriptionDetails, statusFilter])

  // Filter grouped meals based on status
  const filteredGroupedMeals = React.useMemo(() => {
    if (!groupedMeals.length) return []

    if (statusFilter === 'all') {
      return groupedMeals
    }

    // Since we group by date + status, each group has a specific deliveryStatus
    const filtered = groupedMeals.filter(group => {
      return group.deliveryStatus === statusFilter
    })

    console.log(`🔍 Filtering by status: "${statusFilter}"`)
    console.log(`📊 Total groups: ${groupedMeals.length}, Filtered groups: ${filtered.length}`)
    console.log(`📋 Filtered groups:`, filtered.map(g => `${g.date} - ${g.deliveryStatus}`))

    return filtered
  }, [groupedMeals, statusFilter])

  // Handle row selection
  const handleRowSelect = (mealId) => {
    setSelectedRows(prev => {
      if (prev.includes(mealId)) {
        return prev.filter(id => id !== mealId)
      } else {
        return [...prev, mealId]
      }
    })
  }

  // Handle select all
  const handleSelectAll = React.useCallback(() => {
    if (selectAll) {
      setSelectedRows([])
    } else {
      const allFilteredMealIds = filteredGroupedMeals.map(group => {
        const firstMeal = Object.values(group.meals)[0]
        return firstMeal?.dayID || firstMeal?.id
      }).filter(id => id) || []
      setSelectedRows(allFilteredMealIds)
    }
    setSelectAll(!selectAll)
  }, [selectAll, filteredGroupedMeals])

  // Update selectAll state when individual rows are selected
  React.useEffect(() => {
    const totalFilteredRows = filteredGroupedMeals.length || 0
    const allFilteredMealIds = filteredGroupedMeals.map(group => {
      const firstMeal = Object.values(group.meals)[0]
      return firstMeal?.dayID || firstMeal?.id
    }).filter(id => id)

    const selectedFilteredCount = selectedRows.filter(id =>
      allFilteredMealIds.includes(id)
    ).length
    setSelectAll(selectedFilteredCount > 0 && selectedFilteredCount === totalFilteredRows)
  }, [selectedRows, filteredGroupedMeals])

  // Handle URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const sidFromUrl = urlParams.get('sid')
    const phoneFromUrl = urlParams.get('phone')

    if (sidFromUrl) {
      console.log('🔗 Found SID in URL:', sidFromUrl)
      setSearchQuery(sidFromUrl)
      setSearchType('sid')
      // Automatically search for the subscription
      handleSearch(sidFromUrl, 'sid')

      // Clean up URL parameters after processing
      navigate('/subscriptions/manage', { replace: true })
    } else if (phoneFromUrl) {
      console.log('🔗 Found phone in URL:', phoneFromUrl)
      setSearchQuery(phoneFromUrl)
      setSearchType('phone')
      // Automatically search for the subscription
      handleSearch(phoneFromUrl, 'phone')

      // Clean up URL parameters after processing
      navigate('/subscriptions/manage', { replace: true })
    }
  }, [location.search, navigate]) // Only run when URL search params change

  // Column Resize Handlers
  const handleMouseDown = (e, columnIndex) => {
    e.preventDefault()
    setIsResizing(true)
    setResizeColumn(columnIndex)

    const startX = e.clientX
    const table = e.target.closest('table')
    const th = table.querySelectorAll('th')[columnIndex]
    const startWidth = th.offsetWidth

    const handleMouseMove = (e) => {
      const currentX = e.clientX
      const diffX = currentX - startX
      const newWidth = Math.max(50, startWidth + diffX) // Minimum width of 50px
      th.style.width = `${newWidth}px`
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeColumn(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Helper functions to get current subscription data
  const getCurrentSubscriptionMealTypesWithAvailable = (availableMealTypesParam) => {
    // Try different possible field names for meal types
    const subscriptionHeader = subscriptionData?.subscriptionHeader
    if (!subscriptionHeader) return []

    // Check various possible field names
    const mealTypes = subscriptionHeader.mealTypes ||
                     subscriptionHeader.MealTypes ||
                     subscriptionHeader.meal_types ||
                     []

    console.log('🍽️ Getting current meal types from subscription:', mealTypes)
    console.log('🔍 Full subscription header:', subscriptionHeader)
    console.log('🔍 Available meal types for conversion:', availableMealTypesParam)

    // If mealTypes is an array of objects, extract IDs
    if (Array.isArray(mealTypes) && mealTypes.length > 0) {
      if (typeof mealTypes[0] === 'object' && mealTypes[0].id) {
        const extractedIds = mealTypes.map(mt => mt.id)
        console.log('🍽️ Extracted IDs from meal type objects:', extractedIds)
        return extractedIds
      }
      // If it's already an array of IDs
      if (typeof mealTypes[0] === 'number') {
        console.log('🍽️ Using existing meal type IDs:', mealTypes)
        return mealTypes
      }
    }

    // Fallback: extract from subscription details
    const subscriptionDetails = subscriptionData?.subscriptionDetails || []
    console.log('🔍 Subscription details count:', subscriptionDetails.length)
    console.log('🔍 Sample subscription detail:', subscriptionDetails[0])

    // Try to get meal type IDs first, then fall back to meal type names
    let uniqueMealTypeIds = [...new Set(
      subscriptionDetails
        .filter(detail => detail.mealTypeID)
        .map(detail => detail.mealTypeID)
    )]

    // If no mealTypeID found, try to get meal type names and convert to IDs
    if (uniqueMealTypeIds.length === 0) {
      const uniqueMealTypeNames = [...new Set(
        subscriptionDetails
          .filter(detail => detail.mealType || detail.mealTypeName)
          .map(detail => detail.mealType || detail.mealTypeName)
      )]

      console.log('🍽️ Found meal type names:', uniqueMealTypeNames)

      // Convert meal type names to IDs using available meal types
      if (availableMealTypesParam && availableMealTypesParam.length > 0) {
        uniqueMealTypeIds = uniqueMealTypeNames
          .map(name => {
            const mealType = availableMealTypesParam.find(mt =>
              mt.name?.toLowerCase() === name?.toLowerCase()
            )
            console.log(`🔍 Converting "${name}" to ID:`, mealType?.id)
            return mealType?.id
          })
          .filter(id => id !== undefined)

        console.log('🍽️ Converted meal type names to IDs:', uniqueMealTypeIds)
      } else {
        console.log('⚠️ No available meal types to convert names to IDs')
      }
    }

    console.log('🍽️ Final extracted meal types from subscription details:', uniqueMealTypeIds)
    return uniqueMealTypeIds
  }

  const getCurrentSubscriptionMealTypes = () => {
    // Try different possible field names for meal types
    const subscriptionHeader = subscriptionData?.subscriptionHeader
    if (!subscriptionHeader) return []

    // Check various possible field names
    const mealTypes = subscriptionHeader.mealTypes ||
                     subscriptionHeader.MealTypes ||
                     subscriptionHeader.meal_types ||
                     []

    console.log('🍽️ Getting current meal types from subscription:', mealTypes)
    console.log('🔍 Full subscription header:', subscriptionHeader)
    console.log('🔍 Full subscription details sample:', subscriptionData?.subscriptionDetails?.[0])

    // If mealTypes is an array of objects, extract IDs
    if (Array.isArray(mealTypes) && mealTypes.length > 0) {
      if (typeof mealTypes[0] === 'object' && mealTypes[0].id) {
        const extractedIds = mealTypes.map(mt => mt.id)
        console.log('🍽️ Extracted IDs from meal type objects:', extractedIds)
        return extractedIds
      }
      // If it's already an array of IDs
      if (typeof mealTypes[0] === 'number') {
        console.log('🍽️ Using existing meal type IDs:', mealTypes)
        return mealTypes
      }
    }

    // Fallback: extract from subscription details
    const subscriptionDetails = subscriptionData?.subscriptionDetails || []
    console.log('🔍 Subscription details count:', subscriptionDetails.length)
    console.log('🔍 Sample subscription detail:', subscriptionDetails[0])

    // Try to get meal type IDs first, then fall back to meal type names
    let uniqueMealTypeIds = [...new Set(
      subscriptionDetails
        .filter(detail => detail.mealTypeID)
        .map(detail => detail.mealTypeID)
    )]

    // If no mealTypeID found, try to get meal type names and convert to IDs
    if (uniqueMealTypeIds.length === 0) {
      const uniqueMealTypeNames = [...new Set(
        subscriptionDetails
          .filter(detail => detail.mealType || detail.mealTypeName)
          .map(detail => detail.mealType || detail.mealTypeName)
      )]

      console.log('🍽️ Found meal type names:', uniqueMealTypeNames)

      // Convert meal type names to IDs using available meal types
      if (availableMealTypes.length > 0) {
        uniqueMealTypeIds = uniqueMealTypeNames
          .map(name => {
            const mealType = availableMealTypes.find(mt =>
              mt.name?.toLowerCase() === name?.toLowerCase()
            )
            return mealType?.id
          })
          .filter(id => id !== undefined)

        console.log('🍽️ Converted meal type names to IDs:', uniqueMealTypeIds)
      } else {
        console.log('⚠️ No available meal types to convert names to IDs')
      }
    }

    console.log('🍽️ Final extracted meal types from subscription details:', uniqueMealTypeIds)
    return uniqueMealTypeIds
  }

  const getCurrentSubscriptionDeliveryDaysWithAvailable = (availableDeliveryDaysParam) => {
    // Try different possible field names for delivery days
    const subscriptionHeader = subscriptionData?.subscriptionHeader
    if (!subscriptionHeader) return []

    const deliveryDays = subscriptionHeader.deliveryDays ||
                        subscriptionHeader.DeliveryDays ||
                        subscriptionHeader.delivery_days ||
                        []

    console.log('📅 Getting current delivery days from subscription:', deliveryDays)
    console.log('🔍 Available delivery days for conversion:', availableDeliveryDaysParam)

    // If deliveryDays is an array of objects, extract IDs
    if (Array.isArray(deliveryDays) && deliveryDays.length > 0) {
      if (typeof deliveryDays[0] === 'object' && deliveryDays[0].id) {
        const extractedIds = deliveryDays.map(dd => dd.id)
        console.log('📅 Extracted IDs from delivery day objects:', extractedIds)
        return extractedIds
      }
      // If it's already an array of IDs
      if (typeof deliveryDays[0] === 'number') {
        console.log('📅 Using existing delivery day IDs:', deliveryDays)
        return deliveryDays
      }
    }

    // Fallback: extract from subscription details
    const subscriptionDetails = subscriptionData?.subscriptionDetails || []
    console.log('🔍 Subscription details count for delivery days:', subscriptionDetails.length)

    // Debug: Log the first few subscription details to see the structure
    console.log('🔍 First subscription detail structure:', subscriptionDetails[0])
    console.log('🔍 All subscription details keys:', subscriptionDetails.length > 0 ? Object.keys(subscriptionDetails[0]) : 'No details')

    // Try to get delivery day IDs first, then fall back to day names
    let uniqueDeliveryDayIds = [...new Set(
      subscriptionDetails
        .filter(detail => detail.dayID || detail.deliveryDayID || detail.deliveryDayId)
        .map(detail => detail.dayID || detail.deliveryDayID || detail.deliveryDayId)
    )]

    console.log('📅 Extracted delivery day IDs from subscription details (dayID field):', uniqueDeliveryDayIds)

    // If no deliveryDayID found, try to get day names and convert to IDs
    if (uniqueDeliveryDayIds.length === 0) {
      console.log('🔍 No dayID found in subscription details, trying day names...')
      const uniqueDayNames = [...new Set(
        subscriptionDetails
          .filter(detail => detail.deliveryDay || detail.dayName)
          .map(detail => detail.deliveryDay || detail.dayName)
      )]
      console.log('🔍 Day names found in subscription details:', uniqueDayNames)

      console.log('📅 Found delivery day names:', uniqueDayNames)

      // Convert day names to IDs using available delivery days
      if (availableDeliveryDaysParam && availableDeliveryDaysParam.length > 0) {
        console.log('🔍 Available delivery days for conversion:', availableDeliveryDaysParam.map(dd => ({
          id: dd.id,
          day_id: dd.day_id,
          name: dd.name,
          day_name: dd.day_name,
          dayName: dd.dayName
        })))

        uniqueDeliveryDayIds = uniqueDayNames
          .map(dayName => {
            console.log(`🔍 Looking for day name: "${dayName}"`)
            const deliveryDay = availableDeliveryDaysParam.find(dd => {
              const nameMatch = dd.name?.toLowerCase() === dayName?.toLowerCase()
              const dayNameMatch = dd.day_name?.toLowerCase() === dayName?.toLowerCase()
              const dayNameAltMatch = dd.dayName?.toLowerCase() === dayName?.toLowerCase()

              console.log(`  - Checking against: name="${dd.name}", day_name="${dd.day_name}", dayName="${dd.dayName}"`)
              console.log(`  - Matches: name=${nameMatch}, day_name=${dayNameMatch}, dayName=${dayNameAltMatch}`)

              return nameMatch || dayNameMatch || dayNameAltMatch
            })

            const resultId = deliveryDay?.id || deliveryDay?.day_id
            console.log(`🔍 Converting "${dayName}" to ID:`, resultId, 'from delivery day:', deliveryDay)
            return resultId
          })
          .filter(id => id !== undefined && id !== null)

        console.log('📅 Converted delivery day names to IDs:', uniqueDeliveryDayIds)
      } else {
        console.log('⚠️ No available delivery days to convert names to IDs')
      }
    }

    console.log('📅 Final extracted delivery days from subscription details:', uniqueDeliveryDayIds)
    return uniqueDeliveryDayIds
  }

  const getCurrentSubscriptionDeliveryDays = () => {
    // Try different possible field names for delivery days
    const subscriptionHeader = subscriptionData?.subscriptionHeader
    if (!subscriptionHeader) return []

    const deliveryDays = subscriptionHeader.deliveryDays ||
                        subscriptionHeader.DeliveryDays ||
                        subscriptionHeader.delivery_days ||
                        []

    console.log('📅 Getting current delivery days from subscription:', deliveryDays)

    // If deliveryDays is an array of objects, extract IDs
    if (Array.isArray(deliveryDays) && deliveryDays.length > 0) {
      if (typeof deliveryDays[0] === 'object' && deliveryDays[0].id) {
        return deliveryDays.map(dd => dd.id)
      }
      // If it's already an array of IDs
      if (typeof deliveryDays[0] === 'number') {
        return deliveryDays
      }
    }

    // Fallback: extract from subscription details
    const subscriptionDetails = subscriptionData?.subscriptionDetails || []
    console.log('🔍 Subscription details for delivery day extraction:', subscriptionDetails)

    const uniqueDeliveryDays = [...new Set(
      subscriptionDetails
        .filter(detail => detail.dayID || detail.dayId || detail.day_id || detail.deliveryDay)
        .map(detail => detail.dayID || detail.dayId || detail.day_id || detail.deliveryDay)
    )]

    console.log('📅 Extracted delivery days from subscription details:', uniqueDeliveryDays)
    return uniqueDeliveryDays
  }

  // Action Handlers
  const handleActionClick = (actionType, actionCategory) => {
    // Handle refund action specially
    if (actionType === 'refund') {
      handleRefundAction()
      return
    }

    // Handle change meal types action specially
    if (actionType === 'changeMealType') {
      loadChangeMealTypesData()
    }

    // Handle change delivery days action specially
    if (actionType === 'changeDeliveryDays') {
      loadChangeDeliveryDaysData()
    }

    // Handle change customer phone action specially
    if (actionType === 'changePhone') {
      loadChangeCustomerPhoneData()
    }

    // Handle change customer address action specially
    if (actionType === 'changeAddress') {
      loadChangeCustomerAddressData()
    }

    // Handle renew action specially - meal types will be pre-populated after they're loaded
    if (actionType === 'renew') {
      console.log('🔄 RENEW ACTION CLICKED - Meal types will be pre-populated after loading...')
      setActionData({}) // Start with empty data, will be populated after meal types load
    } else {
      setActionData({}) // Reset action data for other actions
    }

    setSelectedAction({ type: actionType, category: actionCategory })
    setShowActionDialog(true)
  }

  const handleActionSubmit = async (formData) => {
    console.log('🔧 Action submitted:', selectedAction, formData)

    setActionLoading(true)

    try {
      const subscriptionId = subscriptionData?.subscriptionHeader?.subscriptionId

      if (!subscriptionId) {
        showError('No subscription selected')
        return
      }

      // Handle Extend Days action
      if (selectedAction?.type === 'extendDays') {
        if (!formData.days || formData.days < 1) {
          showError('Please enter a valid number of days to extend')
          return
        }

        console.log(`🔄 Extending ${formData.days} days for subscription ${subscriptionId}`)

        const requestBody = {
          daysCount: formData.days,
          notes: formData.notes || 'string'
        }

        console.log('📤 Request body:', requestBody)
        console.log('📡 API URL:', `/api/v1/ActionsManager/subscription/${subscriptionId}/extend`)

        const response = await makeApiCall(`/api/v1/ActionsManager/subscription/${subscriptionId}/extend`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        console.log('📡 Response status:', response.status)
        console.log('📡 Response headers:', response.headers)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error Response:', errorText)
          throw new Error(`Failed to extend days: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log('✅ Extend days result:', result)

        success(`Successfully extended subscription by ${formData.days} days`)

        // Simulate clicking the search by SID button to refresh data
        console.log('🔄 Refreshing subscription data by simulating SID search...')
        await handleSearch(subscriptionId.toString(), 'sid')
      }

      // Handle Activate action
      if (selectedAction?.type === 'activate') {
        if (!formData.activeDate) {
          showError('Please select an active date')
          return
        }

        console.log(`🔄 Activating subscription ${subscriptionId} with date: ${formData.activeDate}`)

        const requestBody = {
          startDate: formData.activeDate,
          notes: formData.notes || 'string'
        }

        console.log('📤 Request body:', requestBody)
        console.log('📡 API URL:', `/api/v1/ActionsManager/subscription/${subscriptionId}/activate`)

        const response = await makeApiCall(`/api/v1/ActionsManager/subscription/${subscriptionId}/activate`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        console.log('📡 Response status:', response.status)
        console.log('📡 Response headers:', response.headers)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error Response:', errorText)
          throw new Error(`Failed to activate subscription: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log('✅ Activate subscription result:', result)

        success(`Successfully activated subscription with date: ${formData.activeDate}`)

        // Simulate clicking the search by SID button to refresh data
        console.log('🔄 Refreshing subscription data by simulating SID search...')
        await handleSearch(subscriptionId.toString(), 'sid')
      }

      // Handle Hold action
      if (selectedAction?.type === 'hold') {
        if (!formData.holdDate) {
          showError('Please select a hold date')
          return
        }

        console.log(`🔄 Holding subscription ${subscriptionId} with date: ${formData.holdDate}`)

        const requestBody = {
          startHoldDate: formData.holdDate,
          notes: formData.notes || 'string'
        }

        console.log('📤 Request body:', requestBody)
        console.log('📡 API URL:', `/api/v1/ActionsManager/subscription/${subscriptionId}/hold`)

        const response = await makeApiCall(`/api/v1/ActionsManager/subscription/${subscriptionId}/hold`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        console.log('📡 Response status:', response.status)
        console.log('📡 Response headers:', response.headers)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error Response:', errorText)
          throw new Error(`Failed to hold subscription: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log('✅ Hold subscription result:', result)

        success(`Successfully put subscription on hold with date: ${formData.holdDate}`)

        // Simulate clicking the search by SID button to refresh data
        console.log('🔄 Refreshing subscription data by simulating SID search...')
        await handleSearch(subscriptionId.toString(), 'sid')
      }

      // Handle Restrict action
      if (selectedAction?.type === 'restrict') {
        if (!formData.fromDate || !formData.toDate) {
          showError('Please select both from date and to date')
          return
        }

        // Validate that fromDate is before toDate
        if (new Date(formData.fromDate) >= new Date(formData.toDate)) {
          showError('From date must be before to date')
          return
        }

        console.log(`🔄 Restricting subscription ${subscriptionId} from ${formData.fromDate} to ${formData.toDate}`)

        const requestBody = {
          dateFrom: formData.fromDate,
          dateTo: formData.toDate,
          notes: formData.notes || 'string'
        }

        console.log('📤 Request body:', requestBody)
        console.log('📡 API URL:', `/api/v1/ActionsManager/subscription/${subscriptionId}/restrict`)

        const response = await makeApiCall(`/api/v1/ActionsManager/subscription/${subscriptionId}/restrict`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        console.log('📡 Response status:', response.status)
        console.log('📡 Response headers:', response.headers)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error Response:', errorText)
          throw new Error(`Failed to restrict subscription: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log('✅ Restrict subscription result:', result)

        success(`Successfully restricted subscription from ${formData.fromDate} to ${formData.toDate}`)

        // Simulate clicking the search by SID button to refresh data
        console.log('🔄 Refreshing subscription data by simulating SID search...')
        await handleSearch(subscriptionId.toString(), 'sid')
      }

      // Handle Unrestrict action
      if (selectedAction?.type === 'unrestrict') {
        if (!formData.selectedDays || formData.selectedDays.length === 0) {
          showError('Please select at least one restricted day to unrestrict')
          return
        }

        console.log(`🔄 Unrestricting subscription ${subscriptionId} for days:`, formData.selectedDays)

        // Get unique delivery dates from selected day IDs
        const selectedDayIds = formData.selectedDays
        const restrictedDaysRaw = subscriptionData?.subscriptionDetails
          ?.filter(detail => detail.status === 'Resticited' && selectedDayIds.includes(detail.id)) || []

        // Group by date and get unique dates in proper ISO format
        const uniqueDates = [...new Set(restrictedDaysRaw.map(detail => detail.date))]
          .filter(date => date) // Remove any null/undefined dates

        const requestBody = {
          days: uniqueDates
        }

        // Add notes as query parameter
        const notes = formData.notes || ''
        const queryParams = notes ? `?nots=${encodeURIComponent(notes)}` : ''

        console.log('📤 Request body:', requestBody)
        console.log('📡 API URL:', `/api/v1/ActionsManager/subscription/${subscriptionId}/unrestrict${queryParams}`)

        const response = await makeApiCall(`/api/v1/ActionsManager/subscription/${subscriptionId}/unrestrict${queryParams}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        console.log('📡 Response status:', response.status)
        console.log('📡 Response headers:', response.headers)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error Response:', errorText)
          throw new Error(`Failed to unrestrict subscription: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log('✅ Unrestrict subscription result:', result)

        success(`Successfully unrestricted ${formData.selectedDays.length} day(s) from subscription`)

        // Simulate clicking the search by SID button to refresh data
        console.log('🔄 Refreshing subscription data by simulating SID search...')
        await handleSearch(subscriptionId.toString(), 'sid')
      }

      // Handle Change Start Date action
      if (selectedAction?.type === 'changeStartDate') {
        if (!formData.startDate) {
          showError('Please select a start date')
          return
        }

        console.log(`🔄 Changing start date for subscription ${subscriptionId} to: ${formData.startDate}`)

        const requestBody = {
          startDate: formData.startDate,
          notes: formData.notes || 'string'
        }

        console.log('📤 Request body:', requestBody)
        console.log('📡 API URL:', `/api/v1/ActionsManager/subscription/${subscriptionId}/change-start-date`)

        const response = await makeApiCall(`/api/v1/ActionsManager/subscription/${subscriptionId}/change-start-date`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        console.log('📡 Response status:', response.status)
        console.log('📡 Response headers:', response.headers)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error Response:', errorText)
          throw new Error(`Failed to change start date: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log('✅ Change start date result:', result)

        success(`Successfully changed subscription start date to: ${formData.startDate}`)

        // Simulate clicking the search by SID button to refresh data
        console.log('🔄 Refreshing subscription data by simulating SID search...')
        await handleSearch(subscriptionId.toString(), 'sid')
      }

      // Handle Merge Days action
      if (selectedAction?.type === 'mergeUnmerge') {
        if (selectedRows.length === 0) {
          showError('Please select at least one day to merge')
          return
        }

        console.log(`🔄 Merging days for subscription ${subscriptionId}`)
        console.log('Selected rows:', selectedRows)
        console.log('Merge data:', actionData.mergeDays)

        // Prepare the days array with updated delivery dates
        const mergeDays = actionData.mergeDays || {}
        const daysToMerge = selectedRows.map(dayId => {
          const dayData = mergeDays[dayId]
          const originalDay = subscriptionData?.subscriptionDetails?.find(d => d.id === dayId)

          return {
            dayId: dayData?.dayId || originalDay?.dayID || dayId,
            deliveryDate: dayData?.deliveryDate || (originalDay?.date ? new Date(originalDay.date).toISOString().split('T')[0] : ''),
            dayNumber: dayData?.dayNumber || originalDay?.dayNumber || 1,
            dayName: dayData?.dayName || (originalDay?.date ? new Date(originalDay.date).toLocaleDateString('en-US', { weekday: 'long' }) : ''),
            deliveryStatus: dayData?.deliveryStatus || originalDay?.deliveryStatus || originalDay?.status || 'Pending'
          }
        })

        const requestBody = {
          days: daysToMerge,
          notes: formData.notes || 'string'
        }

        console.log('📤 Request body:', requestBody)
        console.log('📡 API URL:', `/api/v1/ActionsManager/subscription/${subscriptionId}/merge-days`)

        const response = await makeApiCall(`/api/v1/ActionsManager/subscription/${subscriptionId}/merge-days`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        console.log('📡 Response status:', response.status)
        console.log('📡 Response headers:', response.headers)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error Response:', errorText)
          throw new Error(`Failed to merge days: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log('✅ Merge days result:', result)

        success(`Successfully merged ${selectedRows.length} day(s)`)

        // Clear selected rows
        setSelectedRows([])
        setSelectAll(false)

        // Simulate clicking the search by SID button to refresh data
        console.log('🔄 Refreshing subscription data by simulating SID search...')
        await handleSearch(subscriptionId.toString(), 'sid')
      }

      // Handle Renew action
      if (selectedAction?.type === 'renew') {
        if (!actionData.startDate || !actionData.duration) {
          showError('Please fill in all required fields')
          return
        }

        if (!actionData.deliveryDays || actionData.deliveryDays.length === 0) {
          showError('Please select at least one delivery day')
          return
        }

        if (!actionData.mealTypes || actionData.mealTypes.length === 0) {
          showError('Please select at least one meal type')
          return
        }

        console.log('🔄 Processing renew action with data:', actionData)
        console.log('🔍 Available delivery days:', availableDeliveryDays)
        console.log('🔍 Selected delivery day IDs:', actionData.deliveryDays)

        // Transform meal types to the required format for the API
        const mealTypesArray = actionData.mealTypes.map(mealTypeId => {
          const mealType = availableMealTypes.find(mt => mt.id === mealTypeId)
          return {
            mealTypeCategoryID: mealType?.categoryId || mealType?.mealTypeCategoryID || 1,
            mealTypeCategoryName: mealType?.categoryName || mealType?.mealTypeCategoryName || "Meal",
            mealTypeID: mealType?.id || mealType?.mealTypeID || mealTypeId,
            mealTypeName: mealType?.name || mealType?.mealTypeName || "BREAKFAST"
          }
        })

        // Transform selected delivery days to the required format - ONLY include valid days
        const deliveryDaysArray = actionData.deliveryDays
          .filter(dayId => {
            const deliveryDay = availableDeliveryDays.find(dd => (dd.day_id || dd.id) === dayId)
            if (!deliveryDay) {
              console.warn('⚠️ Invalid delivery day ID found:', dayId, 'Available IDs:', availableDeliveryDays.map(dd => dd.day_id || dd.id))
              return false
            }
            return true
          })
          .map(dayId => {
            const deliveryDay = availableDeliveryDays.find(dd => (dd.day_id || dd.id) === dayId)
            return {
              day_id: dayId,
              day_name: deliveryDay.day_name || deliveryDay.name,
              show: true
            }
          })

        console.log('🔍 Final delivery days array:', deliveryDaysArray)

        // Validate that we have valid delivery days after filtering
        if (deliveryDaysArray.length === 0) {
          showError('No valid delivery days selected. Please select from the available delivery days.')
          return
        }

        // Prepare invoice object based on "With Out Invoice" checkbox
        let invoiceObject = null

        if (!actionData.withoutInvoice) {
          // Prepare uploadRequest from uploaded files
          let uploadRequest = null

          if (actionData.uploadedFiles && actionData.uploadedFiles.length > 0) {
            const file = actionData.uploadedFiles[0] // Take the first file
            const fileName = file.name
            const extension = fileName.split('.').pop() || ''

            // Convert file to base64
            const reader = new FileReader()
            const fileDataPromise = new Promise((resolve) => {
              reader.onload = () => {
                const base64Data = reader.result.split(',')[1] // Remove data:type;base64, prefix
                resolve(base64Data)
              }
              reader.readAsDataURL(file)
            })

            const fileData = await fileDataPromise

            uploadRequest = {
              fileName: fileName,
              extension: extension,
              uploadType: 1, // Assuming 1 is for invoice files
              data: fileData
            }
          } else {
            // Default uploadRequest when no file is uploaded
            uploadRequest = {
              fileName: "",
              extension: "",
              uploadType: 1,
              data: null
            }
          }

          // Determine the correct branch ID based on subscription type
          let branchId = 0
          const subscriptionType = actionData.subscriptionType !== undefined ?
            parseInt(actionData.subscriptionType) :
            parseInt(subscriptionData?.subscriptionHeader?.subscriptionType) || 0

          console.log('🔍 DEBUG - actionData:', actionData)
          console.log('🔍 DEBUG - subscriptionData.subscriptionHeader:', subscriptionData?.subscriptionHeader)
          console.log('🔍 DEBUG - subscriptionData.subscriptionHeader.branch:', subscriptionData?.subscriptionHeader?.branch)
          console.log('🔍 DEBUG - actionData.branchId:', actionData.branchId)

          if (subscriptionType === 2) {
            // Branch subscription type - use selected branch from form
            branchId = parseInt(actionData.branchId) || 0
            console.log('🏢 Branch type (2) - using actionData.branchId:', branchId)
          } else {
            // Web (0) or Mobile (1) - use branch from subscription header branch object
            branchId = parseInt(subscriptionData?.subscriptionHeader?.branch?.branchID) || 1
            console.log('🏢 Web/Mobile type - using header branch.branchID:', branchId)
          }

          console.log('🏢 Branch logic - subscriptionType:', subscriptionType, 'selected branchId:', actionData.branchId, 'header branchId:', subscriptionData?.subscriptionHeader?.branchId, 'final branchId:', branchId)

          // Create invoice object when "With Out Invoice" is NOT checked
          invoiceObject = {
            invoiceID: 0,
            customerId: parseInt(subscriptionData?.subscriptionHeader?.customerId) || 0,
            total: parseFloat(actionData.total) || 0,
            discount: parseFloat(actionData.discount) || 0,
            net: parseFloat(actionData.net) || 0,
            tax: parseFloat(actionData.taxAmount) || 0,
            subscriptionType: subscriptionType,
            subscripBranch: branchId,
            notes: actionData.notes || "string",
            manualDiscount: parseFloat(actionData.manualDiscount) || 0,
            url: "string",
            bageValue: parseFloat(actionData.bagValue) || 0,
            paymentDiscounts: null,
            paymentMethods: actionData.paymentMethod ? [{
              id: 0,
              paymentsDetailsId: 0,
              methodId: parseInt(actionData.paymentMethod) || 0,
              amount: parseFloat(actionData.total) || 0,
              refrenceId: actionData.referenceId || ""
            }] : [],
            uploadRequest: uploadRequest
          }
        }

        // Prepare renew data according to the API specification
        const renewData = {
          sid: parseInt(subscriptionId) || 0,
          planId: parseInt(subscriptionData?.subscriptionHeader?.planId || subscriptionData?.subscriptionHeader?.planID) || 0,
          startDate: actionData.startDate,
          mealsType: mealTypesArray,
          deliveryDays: deliveryDaysArray,
          duration: parseInt(actionData.duration) || 0,
          invoice: invoiceObject
        }

        console.log('📤 Sending renew request:', renewData)

        try {
          // Call the RenewPlan API endpoint
          const response = await fetch('http://eg.localhost:7167/api/v1/ActionsManager/subscription/RenewPlan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(renewData)
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const result = await response.json()
          console.log('✅ Renew response:', result)

          success('Subscription renewed successfully!')

          // Refresh subscription data
          console.log('🔄 Refreshing subscription data...')
          await handleSearch(subscriptionId.toString(), 'sid')
        } catch (apiError) {
          console.error('❌ API Error during renew:', apiError)
          throw new Error(`Failed to renew subscription: ${apiError.message}`)
        }
      }

      // Handle Change Meal Types action
      if (selectedAction?.type === 'changeMealType') {
        if (!formData.selectedMealTypes || formData.selectedMealTypes.length === 0) {
          showError('Please select at least one meal type')
          return
        }

        console.log('🍽️ Processing change meal types action with data:', formData)

        // Prepare request body according to the API specification
        const requestBody = {
          mealTypes: formData.selectedMealTypes.map(mealTypeId => ({
            mealTypeCategoryID: 1, // Will be filled from meal type data
            mealTypeCategoryName: "Meal", // Will be filled from meal type data
            mealTypeID: mealTypeId,
            mealTypeName: "BREAKFAST" // Will be filled from meal type data
          })),
          notes: formData.notes || "Meal types changed via subscription management"
        }

        // Enhance the meal types with category and name information
        if (changeMealTypesData && Object.keys(changeMealTypesData).length > 0) {
          requestBody.mealTypes = formData.selectedMealTypes.map(mealTypeId => {
            // Find the meal type details from the loaded data
            let mealTypeDetails = null
            Object.entries(changeMealTypesData).forEach(([category, mealTypes]) => {
              const found = mealTypes.find(mt => mt.id === mealTypeId)
              if (found) {
                mealTypeDetails = found
              }
            })

            return {
              mealTypeCategoryID: mealTypeDetails?.categoryId || 1,
              mealTypeCategoryName: mealTypeDetails?.categoryName || "Meal",
              mealTypeID: mealTypeId,
              mealTypeName: mealTypeDetails?.name || "BREAKFAST"
            }
          })
        }

        console.log('📤 Change meal types request body:', JSON.stringify(requestBody, null, 2))
        console.log('📡 API URL:', `/api/v1/ActionsManager/subscription/${subscriptionId}/change-meal-types`)
        console.log('📡 SID in headers:', subscriptionId)

        const response = await makeApiCall(`/api/v1/ActionsManager/subscription/${subscriptionId}/change-meal-types`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'sid': subscriptionId.toString()
          },
          body: JSON.stringify(requestBody)
        })

        console.log('📡 Change meal types response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error Response:', errorText)
          throw new Error(`Failed to change meal types: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log('✅ Change meal types result:', result)

        success('Meal types changed successfully!')

        // Refresh subscription data
        console.log('🔄 Refreshing subscription data by simulating SID search...')
        await handleSearch(subscriptionId.toString(), 'sid')
      }

      // Handle Change Delivery Days action
      if (selectedAction?.type === 'changeDeliveryDays') {
        if (!formData.selectedDeliveryDays || formData.selectedDeliveryDays.length === 0) {
          showError('Please select at least one delivery day')
          return
        }

        console.log('📅 Processing change delivery days action with data:', formData)

        // Prepare request body according to the API specification
        const requestBody = {
          deliveryDays: formData.selectedDeliveryDays.map(dayName => {
            // Find the delivery day details from the loaded data
            const dayDetails = changeDeliveryDaysData.find(day =>
              (day.day_name || day.dayName || day.name || day) === dayName
            )

            return {
              day_id: dayDetails?.day_id || dayDetails?.id || "",
              day_name: dayName,
              show: true
            }
          }),
          notes: formData.notes || "Delivery days changed via subscription management"
        }

        console.log('📤 Change delivery days request body:', JSON.stringify(requestBody, null, 2))
        console.log('📡 API URL:', `/api/v1/ActionsManager/subscription/${subscriptionId}/ChangeDeliveryDays`)
        console.log('📡 SID in headers:', subscriptionId)

        const response = await makeApiCall(`/api/v1/ActionsManager/subscription/${subscriptionId}/ChangeDeliveryDays`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'sid': subscriptionId.toString()
          },
          body: JSON.stringify(requestBody)
        })

        console.log('📡 Change delivery days response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error Response:', errorText)
          throw new Error(`Failed to change delivery days: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log('✅ Change delivery days result:', result)

        success('Delivery days changed successfully!')

        // Refresh subscription data
        console.log('🔄 Refreshing subscription data by simulating SID search...')
        await handleSearch(subscriptionId.toString(), 'sid')
      }

      // Handle Change Customer Name action
      if (selectedAction?.type === 'changeCustomerName') {
        if (!formData.customerName || formData.customerName.trim() === '') {
          showError('Please enter a new customer name')
          return
        }

        console.log('👤 Processing change customer name action with data:', formData)

        const customerId = subscriptionData?.subscriptionHeader?.customerId || subscriptionData?.subscriptionHeader?.customerID

        if (!customerId) {
          showError('Customer ID not found')
          return
        }

        // Prepare request body according to the API specification
        const requestBody = {
          customerName: formData.customerName.trim(),
          sid: subscriptionId
        }

        console.log('📤 Change customer name request body:', JSON.stringify(requestBody, null, 2))
        console.log('📡 API URL:', `/api/v1/ActionsManager/customer/${customerId}/name`)
        console.log('📡 Customer ID:', customerId)

        const response = await makeApiCall(`/api/v1/ActionsManager/customer/${customerId}/name`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })

        console.log('📡 Change customer name response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error Response:', errorText)
          throw new Error(`Failed to change customer name: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log('✅ Change customer name result:', result)

        success('Customer name changed successfully!')

        // Refresh subscription data
        console.log('🔄 Refreshing subscription data by simulating SID search...')
        await handleSearch(subscriptionId.toString(), 'sid')
      }

      // Handle Change Customer Phone action
      if (selectedAction?.type === 'changePhone') {
        console.log('📞 Processing change customer phone action with data:', formData)

        const customerId = subscriptionData?.subscriptionHeader?.customerId || subscriptionData?.subscriptionHeader?.customerID

        if (!customerId) {
          showError('Customer ID not found')
          return
        }

        // Prepare phone numbers array - include all phone types, send null for empty values
        const customerPhones = []

        // Helper function to find existing phone ID by type
        const findPhoneId = (phoneType) => {
          console.log('🔍 Looking for phone type:', phoneType)
          console.log('🔍 Available phone data:', changeCustomerPhoneData)
          console.log('🔍 Phone data length:', changeCustomerPhoneData?.length)

          if (!changeCustomerPhoneData || changeCustomerPhoneData.length === 0) {
            console.log('🔍 No phone data available, returning 0')
            return 0
          }

          // Map the form phone types to API phone types
          const phoneTypeMapping = {
            'Mobile': 'Mobile',
            'Work': 'Work Phone',
            'Home': 'Home Phone',
            'Other': 'Other Phone'
          }

          const apiPhoneType = phoneTypeMapping[phoneType] || phoneType
          console.log('🔍 Mapped phone type:', phoneType, '->', apiPhoneType)

          const existingPhone = changeCustomerPhoneData.find(phone => {
            console.log('🔍 Checking phone:', phone)
            console.log('🔍 Phone phoneType:', phone.phoneType)
            console.log('🔍 Phone id:', phone.id)
            const match = phone.phoneType === apiPhoneType
            console.log('🔍 Match result:', match, '(', phone.phoneType, '===', apiPhoneType, ')')
            return match
          })

          console.log('🔍 Found existing phone:', existingPhone)
          const phoneId = existingPhone?.id || 0
          console.log('🔍 Using phone ID:', phoneId, 'for type:', phoneType)

          return phoneId
        }

        // Always include all phone types, use empty string for empty values
        customerPhones.push({
          id: findPhoneId("Mobile"),
          phone: (formData.mobile && formData.mobile.trim()) ? formData.mobile.trim() : "",
          phoneType: "Mobile"
        })

        customerPhones.push({
          id: findPhoneId("Work"),
          phone: (formData.workPhone && formData.workPhone.trim()) ? formData.workPhone.trim() : "",
          phoneType: "Work"
        })

        customerPhones.push({
          id: findPhoneId("Home"),
          phone: (formData.homePhone && formData.homePhone.trim()) ? formData.homePhone.trim() : "",
          phoneType: "Home"
        })

        customerPhones.push({
          id: findPhoneId("Other"),
          phone: (formData.otherPhone && formData.otherPhone.trim()) ? formData.otherPhone.trim() : "",
          phoneType: "Other"
        })

        // Prepare request body according to the API specification
        const requestBody = {
          customerPhones: customerPhones,
          sid: subscriptionId
        }

        console.log('📤 Change customer phone request body:', JSON.stringify(requestBody, null, 2))
        console.log('📤 Customer phones array:', customerPhones)
        console.log('📤 Change customer phone data state:', changeCustomerPhoneData)
        console.log('📡 API URL:', `/api/v1/ActionsManager/customer/${customerId}/phones`)
        console.log('📡 Customer ID:', customerId)

        const response = await makeApiCall(`/api/v1/ActionsManager/customer/${customerId}/phones`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })

        console.log('📡 Change customer phone response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error Response:', errorText)
          throw new Error(`Failed to change customer phone: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log('✅ Change customer phone result:', result)

        success('Customer phone numbers updated successfully!')

        // Refresh subscription data
        console.log('🔄 Refreshing subscription data by simulating SID search...')
        await handleSearch(subscriptionId.toString(), 'sid')
      }

      // Handle Change Customer Address action
      if (selectedAction?.type === 'changeAddress') {
        console.log('🏠 Processing change customer address action')
        console.log('🏠 Existing addresses:', changeCustomerAddressData)
        console.log('🏠 New addresses:', newAddresses)
        console.log('🏠 Addresses to delete:', addressesToDelete)

        const customerId = subscriptionData?.subscriptionHeader?.customerId || subscriptionData?.subscriptionHeader?.customerID

        if (!customerId) {
          showError('Customer ID not found')
          return
        }

        // Prepare addresses array - combine existing (modified) and new addresses
        const customerAddresses = []

        // Add all existing addresses (these may have been modified)
        changeCustomerAddressData.forEach(existingAddr => {
          customerAddresses.push({
            id: existingAddr.id || 0,
            areaId: existingAddr.areaId || 0,
            adress: existingAddr.adress || existingAddr.address || "",
            defaultAdress: Boolean(existingAddr.isDefault || existingAddr.defaultAdress),
            customerID: customerId || 0,
            branchID: existingAddr.branchID || 0,
            driverID: existingAddr.driverID || 0,
            areaName: existingAddr.areaName || ""
          })
        })

        // Add all new addresses (with id: 0 to indicate they're new)
        newAddresses.forEach(newAddr => {
          customerAddresses.push({
            id: 0, // New address
            areaId: newAddr.areaId || 0,
            adress: newAddr.adress || newAddr.address || "",
            defaultAdress: Boolean(newAddr.isDefault || newAddr.defaultAdress),
            customerID: customerId || 0,
            branchID: newAddr.branchID || 0,
            driverID: newAddr.driverID || 0,
            areaName: newAddr.areaName || ""
          })
        })

        if (customerAddresses.length === 0) {
          showError('Please provide at least one address')
          return
        }

        // Ensure only one default address - find the last one marked as default and unset others
        let defaultFound = false
        for (let i = customerAddresses.length - 1; i >= 0; i--) {
          if (customerAddresses[i].defaultAdress && !defaultFound) {
            // Keep this as the default
            defaultFound = true
          } else {
            // Unset default for all others
            customerAddresses[i].defaultAdress = false
          }
        }

        // Prepare request body according to the API specification
        const requestBody = {
          Addresses: customerAddresses,
          sid: subscriptionId
        }

        console.log('📤 Change customer address request body:', JSON.stringify(requestBody, null, 2))
        console.log('📤 Customer addresses array:', customerAddresses)
        console.log('📤 Change customer address data state:', changeCustomerAddressData)
        console.log('📡 API URL:', `/ActionsManager/subscription/${customerId}/address`)
        console.log('📡 Customer ID:', customerId)

        const result = await apiService.submitChangeAddress(customerId, requestBody)
        console.log('✅ Change customer address result:', result)

        success('Customer address changed successfully!')

        // Reset address management state
        resetAddressManagement()

        // Refresh subscription data
        console.log('🔄 Refreshing subscription data by simulating SID search...')
        await handleSearch(subscriptionId.toString(), 'sid')
      }

      // TODO: Implement other actions here

    } catch (error) {
      console.error('❌ Error submitting action:', error)
      showError(`Failed to ${selectedAction?.type}: ${error.message}`)
    } finally {
      setActionLoading(false)
      setShowActionDialog(false)
      setSelectedAction(null)
      setActionData({})
    }
  }

  const handleActionCancel = () => {
    setShowActionDialog(false)
    setSelectedAction(null)
    setActionData({})

    // Reset address management state if it was a change address action
    if (selectedAction?.type === 'changeAddress') {
      resetAddressManagement()
    }
  }

  // Fetch tab data when tab is selected
  const fetchTabData = async (tabId) => {
    const subscriptionId = subscriptionData?.subscriptionHeader?.subscriptionId
    console.log('fetchTabData called:', {
      tabId,
      subscriptionId,
      hasSubscriptionData: !!subscriptionData,
      subscriptionHeader: subscriptionData?.subscriptionHeader
    })

    if (!subscriptionId) {
      console.log('No subscription ID found, cannot fetch tab data')
      console.log('Available subscription data:', subscriptionData)
      return
    }

    console.log(`Starting to fetch ${tabId} data for subscription ${subscriptionId}`)
    setTabLoading(prev => ({ ...prev, [tabId]: true }))

    try {
      switch (tabId) {
        case 'customerLog':
          console.log('Fetching customer log data...')
          const customerData = await getCustomerLog(subscriptionId)
          console.log('Setting customer log data:', customerData)
          console.log('Customer data length:', customerData?.length)
          setCustomerLogData(customerData)
          break
        case 'invoiceLog':
          console.log('Fetching invoice log data...')
          const invoiceData = await getInvoiceLog(subscriptionId)
          setInvoiceLogData(invoiceData)
          break
        case 'deliveryNotesLog':
          console.log('Fetching delivery notes data...')
          const deliveryData = await getDeliveryNotes(subscriptionId)
          setDeliveryNotesData(deliveryData)
          break
        case 'dislikeMealsLog':
          console.log('Fetching dislike meals data...')
          const mealsData = await getDislikeMeals(subscriptionId)
          setDislikeMealsData(mealsData)
          break
        default:
          break
      }
    } catch (error) {
      console.error(`Error fetching ${tabId} data:`, error)
      showError(`Failed to load ${tabId} data`)
    } finally {
      setTabLoading(prev => ({ ...prev, [tabId]: false }))
    }
  }

  // Handle tab selection with data fetching
  const handleTabSelect = (tabId) => {
    console.log('Tab selected:', tabId)
    setSelectedView(tabId)
    fetchTabData(tabId)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="w-full mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {/* Clean Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              Subscription Management
            </h1>
          </div>
          <p className="text-sm sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
            Search and manage customer subscriptions with powerful tools
          </p>
        </div>

        {/* Modern Search Interface */}
        <div className="mb-8 sm:mb-12 lg:mb-20">

          {/* Search Cards Container */}
          <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">

              {/* Search by SID Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8 hover:shadow-md dark:hover:shadow-lg transition-all duration-200">
                {/* Card Header */}
                <div className="flex items-center mb-4 sm:mb-6 lg:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/50 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Search by SID</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Find subscription by ID</p>
                  </div>
                </div>

                {/* Search Input with Integrated Button */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Subscription ID..."
                    className="w-full h-10 sm:h-12 pl-3 sm:pl-4 pr-10 sm:pr-12 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg sm:rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:outline-none transition-all duration-200 text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500"
                    value={searchType === 'sid' ? searchQuery : ''}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setSearchType('sid')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        handleSearch(searchQuery, 'sid')
                      }
                    }}
                  />
                  <button
                    onClick={() => handleSearch(searchQuery, 'sid')}
                    disabled={isLoading || !searchQuery.trim()}
                    className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-md sm:rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {isLoading && searchType === 'sid' ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Search by Phone Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8 hover:shadow-md dark:hover:shadow-lg transition-all duration-200">
                {/* Card Header */}
                <div className="flex items-center mb-4 sm:mb-6 lg:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 dark:bg-green-900/50 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                    <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Search by Phone</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Find subscription by phone number</p>
                  </div>
                </div>

                {/* Search Input with Integrated Button */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Phone Number..."
                    className="w-full h-10 sm:h-12 pl-3 sm:pl-4 pr-10 sm:pr-12 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg sm:rounded-xl focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/50 focus:outline-none transition-all duration-200 text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500"
                    value={searchType === 'phone' ? searchQuery : ''}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setSearchType('phone')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        handleSearch(searchQuery, 'phone')
                      }
                    }}
                  />
                  <button
                    onClick={() => handleSearch(searchQuery, 'phone')}
                    disabled={isLoading || !searchQuery.trim()}
                    className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-green-600 dark:bg-green-500 text-white rounded-md sm:rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {isLoading && searchType === 'phone' ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phone Search Results - Multiple Subscriptions */}
        {subscriptionsList.length > 0 && (
          <div className="w-full mt-6 sm:mt-8 lg:mt-12 animate-fadeIn">
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Search Results</h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Found <span className="font-semibold text-blue-600 dark:text-blue-400">{subscriptionsList.length}</span> subscription(s) for phone:
                  <span className="font-semibold text-gray-900 dark:text-white ml-1">{searchQuery}</span>
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Active: {subscriptionsList.filter(s => s.subscriptionHeader.status === 'Active').length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Expired: {subscriptionsList.filter(s => s.subscriptionHeader.status === 'Expired').length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Other: {subscriptionsList.filter(s => !['Active', 'Expired'].includes(s.subscriptionHeader.status)).length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptionsList.map((subscription, index) => (
                <div
                  key={subscription.subscriptionHeader.subscriptionId || index}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">SID: {subscription.subscriptionHeader.subscriptionId}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{subscription.subscriptionHeader.planName}</p>
                        {subscription.subscriptionHeader.subscriptionType !== 'N/A' && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{subscription.subscriptionHeader.subscriptionType}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscription.subscriptionHeader.status)}`}>
                      {subscription.subscriptionHeader.status}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3 mb-4">
                    {subscription.subscriptionHeader.customerName !== 'N/A' && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{subscription.subscriptionHeader.customerName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{subscription.subscriptionHeader.phoneNumber}</span>
                    </div>
                    {subscription.subscriptionHeader.branchName !== 'N/A' && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{subscription.subscriptionHeader.branchName}</span>
                      </div>
                    )}
                    {subscription.subscriptionHeader.email !== 'N/A' && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700 truncate">{subscription.subscriptionHeader.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {subscription.subscriptionHeader.duration > 0 ?
                          `${subscription.subscriptionHeader.duration} days` :
                          'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {subscription.subscriptionHeader.remainingDays > 0 ?
                          `${subscription.subscriptionHeader.remainingDays} days` :
                          'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Additional Info Row */}
                  {(subscription.subscriptionHeader.totalMeals > 0 || subscription.subscriptionHeader.monthlyPrice > 0) && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {subscription.subscriptionHeader.totalMeals > 0 && (
                        <div>
                          <p className="text-xs text-gray-500">Total Meals</p>
                          <p className="text-sm font-semibold text-gray-900">{subscription.subscriptionHeader.totalMeals}</p>
                        </div>
                      )}
                      {subscription.subscriptionHeader.monthlyPrice > 0 && (
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="text-sm font-semibold text-gray-900">${subscription.subscriptionHeader.monthlyPrice}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Next Delivery Info */}
                  {subscription.subscriptionHeader.nextDelivery !== 'N/A' && subscription.subscriptionHeader.nextDelivery !== 'Delivery Not Started' && (
                    <div className="mt-3 p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs text-green-600 font-medium">Next Delivery</p>
                          <p className="text-xs text-green-700">{subscription.subscriptionHeader.nextDelivery}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => handleViewDetails(subscription)}
                      disabled={loadingSubscriptionId === subscription.subscriptionHeader.subscriptionId}
                      className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      {loadingSubscriptionId === subscription.subscriptionHeader.subscriptionId ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          Loading Details...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          View Details
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscription Data Display */}
        {subscriptionData && (
          <div className="w-full mt-6 sm:mt-8 lg:mt-12 animate-fadeIn">
            {/* Header with Prominent Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 lg:mb-12 gap-4 sm:gap-6">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Subscription Details</h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">Complete customer and subscription overview</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Enhanced Compact Status Badge */}
                <div className="flex items-center gap-3">
                  <div className={`group relative flex items-center gap-3 px-6 py-3 rounded-full font-semibold text-sm shadow-lg border transition-all duration-300 hover:scale-105 transform cursor-pointer backdrop-blur-sm ${
                    subscriptionData?.subscriptionHeader?.status === 'Active' ?
                      'bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-100 text-emerald-900 border-emerald-300 shadow-emerald-200/50 hover:shadow-emerald-300/60' :
                    subscriptionData?.subscriptionHeader?.status === 'Expired' ?
                      'bg-gradient-to-r from-red-50 via-rose-50 to-red-100 text-red-900 border-red-300 shadow-red-200/50 hover:shadow-red-300/60' :
                    subscriptionData?.subscriptionHeader?.status === 'Hold' ?
                      'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 text-amber-900 border-amber-300 shadow-amber-200/50 hover:shadow-amber-300/60' :
                    subscriptionData?.subscriptionHeader?.status === 'Restricted' ?
                      'bg-gradient-to-r from-orange-50 via-orange-50 to-orange-100 text-orange-900 border-orange-300 shadow-orange-200/50 hover:shadow-orange-300/60' :
                    subscriptionData?.subscriptionHeader?.status === 'PackUp' ?
                      'bg-gradient-to-r from-purple-50 via-violet-50 to-purple-100 text-purple-900 border-purple-300 shadow-purple-200/50 hover:shadow-purple-300/60' :
                    subscriptionData?.subscriptionHeader?.status === 'Refund' ?
                      'bg-gradient-to-r from-slate-50 via-gray-50 to-slate-100 text-slate-900 border-slate-300 shadow-slate-200/50 hover:shadow-slate-300/60' :
                      'bg-gradient-to-r from-slate-50 via-gray-50 to-slate-100 text-slate-900 border-slate-300 shadow-slate-200/50 hover:shadow-slate-300/60'
                  }`}>

                    {/* Compact Animated Status Indicator */}
                    <div className="relative flex items-center">
                      <div className={`w-3 h-3 rounded-full shadow-sm transition-all duration-300 group-hover:scale-110 ${
                        subscriptionData?.subscriptionHeader?.status === 'Active' ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-400/50' :
                        subscriptionData?.subscriptionHeader?.status === 'Expired' ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-400/50' :
                        subscriptionData?.subscriptionHeader?.status === 'Hold' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 shadow-amber-400/50' :
                        subscriptionData?.subscriptionHeader?.status === 'Restricted' ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-400/50' :
                        subscriptionData?.subscriptionHeader?.status === 'PackUp' ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-400/50' :
                        subscriptionData?.subscriptionHeader?.status === 'Refund' ? 'bg-gradient-to-r from-slate-500 to-gray-600 shadow-slate-400/50' :
                        'bg-gradient-to-r from-slate-400 to-gray-500 shadow-slate-400/50'
                      }`}>
                        {/* Inner glow effect */}
                        <div className={`absolute inset-0.5 rounded-full ${
                          subscriptionData?.subscriptionHeader?.status === 'Active' ? 'bg-gradient-to-r from-emerald-300 to-green-400' :
                          subscriptionData?.subscriptionHeader?.status === 'Expired' ? 'bg-gradient-to-r from-red-300 to-red-400' :
                          subscriptionData?.subscriptionHeader?.status === 'Hold' ? 'bg-gradient-to-r from-amber-300 to-yellow-400' :
                          subscriptionData?.subscriptionHeader?.status === 'Restricted' ? 'bg-gradient-to-r from-orange-300 to-orange-400' :
                          subscriptionData?.subscriptionHeader?.status === 'PackUp' ? 'bg-gradient-to-r from-purple-300 to-purple-400' :
                          subscriptionData?.subscriptionHeader?.status === 'Refund' ? 'bg-gradient-to-r from-slate-300 to-gray-400' :
                          'bg-gradient-to-r from-slate-300 to-gray-400'
                        } opacity-60`}></div>
                      </div>

                      {/* Compact pulse animation for Active status */}
                      {subscriptionData?.subscriptionHeader?.status === 'Active' && (
                        <>
                          <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-60"></div>
                          <div className="absolute -inset-0.5 w-4 h-4 bg-emerald-200 rounded-full animate-ping opacity-30 animation-delay-300"></div>
                        </>
                      )}

                      {/* Subtle pulse for other statuses */}
                      {subscriptionData?.subscriptionHeader?.status !== 'Active' && (
                        <div className={`absolute inset-0 w-3 h-3 rounded-full animate-pulse opacity-30 ${
                          subscriptionData?.subscriptionHeader?.status === 'Expired' ? 'bg-red-300' :
                          subscriptionData?.subscriptionHeader?.status === 'Hold' ? 'bg-amber-300' :
                          subscriptionData?.subscriptionHeader?.status === 'Restricted' ? 'bg-orange-300' :
                          subscriptionData?.subscriptionHeader?.status === 'PackUp' ? 'bg-purple-300' :
                          subscriptionData?.subscriptionHeader?.status === 'Refund' ? 'bg-slate-300' :
                          'bg-slate-300'
                        }`}></div>
                      )}
                    </div>

                    {/* Enhanced Status Text */}
                    <span className="text-xl font-black uppercase tracking-wider transition-all duration-300 group-hover:tracking-widest drop-shadow-sm">
                      {subscriptionData?.subscriptionHeader?.status || 'Unknown'}
                    </span>

                    {/* Enhanced Status Icons */}
                    <div className="flex items-center transition-all duration-300 group-hover:scale-110">
                      {subscriptionData?.subscriptionHeader?.status === 'Active' && (
                        <CheckCircle className="h-7 w-7 text-emerald-700 drop-shadow-sm filter group-hover:drop-shadow-md transition-all duration-300" />
                      )}
                      {subscriptionData?.subscriptionHeader?.status === 'Expired' && (
                        <XCircle className="h-7 w-7 text-red-700 drop-shadow-sm filter group-hover:drop-shadow-md transition-all duration-300" />
                      )}
                      {subscriptionData?.subscriptionHeader?.status === 'Hold' && (
                        <Pause className="h-7 w-7 text-amber-700 drop-shadow-sm filter group-hover:drop-shadow-md transition-all duration-300" />
                      )}
                      {subscriptionData?.subscriptionHeader?.status === 'Restricted' && (
                        <Shield className="h-7 w-7 text-orange-700 drop-shadow-sm filter group-hover:drop-shadow-md transition-all duration-300" />
                      )}
                      {subscriptionData?.subscriptionHeader?.status === 'PackUp' && (
                        <Package className="h-7 w-7 text-purple-700 drop-shadow-sm filter group-hover:drop-shadow-md transition-all duration-300" />
                      )}
                      {subscriptionData?.subscriptionHeader?.status === 'Refund' && (
                        <DollarSign className="h-7 w-7 text-slate-700 drop-shadow-sm filter group-hover:drop-shadow-md transition-all duration-300" />
                      )}
                    </div>

                    {/* Enhanced glow effects */}
                    {subscriptionData?.subscriptionHeader?.status === 'Active' && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 blur-2xl -z-10 animate-pulse"></div>
                        <div className="absolute inset-0 rounded-full bg-green-300 opacity-15 blur-3xl -z-20 animate-pulse animation-delay-500"></div>
                      </>
                    )}

                    {/* Subtle glow for other statuses */}
                    {subscriptionData?.subscriptionHeader?.status !== 'Active' && (
                      <div className={`absolute inset-0 rounded-full opacity-10 blur-xl -z-10 ${
                        subscriptionData?.subscriptionHeader?.status === 'Expired' ? 'bg-red-400' :
                        subscriptionData?.subscriptionHeader?.status === 'Hold' ? 'bg-amber-400' :
                        subscriptionData?.subscriptionHeader?.status === 'Restricted' ? 'bg-orange-400' :
                        subscriptionData?.subscriptionHeader?.status === 'PackUp' ? 'bg-purple-400' :
                        subscriptionData?.subscriptionHeader?.status === 'Refund' ? 'bg-slate-400' :
                        'bg-slate-400'
                      }`}></div>
                    )}

                    {/* Floating particles effect for Active status */}
                    {subscriptionData?.subscriptionHeader?.status === 'Active' && (
                      <div className="absolute inset-0 overflow-hidden rounded-full -z-5">
                        <div className="absolute top-2 left-4 w-1 h-1 bg-emerald-300 rounded-full animate-bounce opacity-60 animation-delay-100"></div>
                        <div className="absolute top-4 right-6 w-1 h-1 bg-green-300 rounded-full animate-bounce opacity-60 animation-delay-300"></div>
                        <div className="absolute bottom-3 left-6 w-1 h-1 bg-emerald-400 rounded-full animate-bounce opacity-60 animation-delay-500"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">Just now</p>
                </div>
              </div>
            </div>

            {/* Modern Information Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">

              {/* Customer Overview Card */}
              <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 dark:border-blue-800">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{subscriptionData?.subscriptionHeader?.customerName || 'Unknown Customer'}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 sm:mt-2">
                        <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">Customer #{subscriptionData?.subscriptionHeader?.customerId || 'N/A'}</p>
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg border border-blue-200 dark:border-blue-700 w-fit">
                          <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300">SID: {subscriptionData?.subscriptionHeader?.subscriptionId || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(subscriptionData?.subscriptionHeader?.status || 'Unknown')}`}>
                    {subscriptionData?.subscriptionHeader?.status || 'Unknown'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Phone</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{subscriptionData?.subscriptionHeader?.phoneNumber || 'N/A'}</p>
                          {subscriptionData?.subscriptionHeader?.phoneNumber && subscriptionData.subscriptionHeader.phoneNumber !== 'N/A' && (
                            <button
                              onClick={() => copyToClipboard(subscriptionData.subscriptionHeader.phoneNumber)}
                              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                              title="Copy phone number"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Branch</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{subscriptionData?.subscriptionHeader?.branchName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Member Since</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {subscriptionData?.subscriptionHeader?.joinDate ?
                            new Date(subscriptionData.subscriptionHeader.joinDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Driver</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{subscriptionData?.subscriptionHeader?.driverName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {subscriptionData?.subscriptionHeader?.address && subscriptionData.subscriptionHeader.address !== 'N/A' && (
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Address</p>
                        <p className="text-sm text-gray-700 dark:text-gray-200">{subscriptionData.subscriptionHeader.address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Subscription Details Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded-xl flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Subscription</h3>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">Plan Details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Subscription ID</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{subscriptionData?.subscriptionHeader?.subscriptionId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Plan Name</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{subscriptionData?.subscriptionHeader?.planName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Delivery Days</p>
                    <div className="flex flex-wrap gap-1">
                      {subscriptionData?.subscriptionHeader?.deliveryDays?.length > 0 ?
                        subscriptionData.subscriptionHeader.deliveryDays.map((day, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                            {day.substring(0, 3)}
                          </span>
                        )) :
                        <span className="text-xs text-gray-500 dark:text-gray-400">No delivery days set</span>
                      }
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Next Delivery</p>
                    <div className="flex items-center gap-2">
                      {subscriptionData?.subscriptionHeader?.nextDelivery === 'Delivery Not Started' ||
                       subscriptionData?.subscriptionHeader?.nextDelivery === 'Not Scheduled' ? (
                        <>
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                            {subscriptionData?.subscriptionHeader?.nextDelivery || 'Not Scheduled'}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {subscriptionData?.subscriptionHeader?.nextDelivery || 'Not Scheduled'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Meal Types</p>
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        // Get meal types from API response
                        const mealTypesString = subscriptionData?.subscriptionHeader?.mealTypes ||
                                              subscriptionData?.subscriptionHeader?.meal_types ||
                                              uniqueMealTypes?.join('|') || ''

                        if (mealTypesString) {
                          // Split by | or comma and clean up
                          const mealTypes = mealTypesString.split(/[|,]/).map(type => type.trim()).filter(Boolean)

                          return mealTypes.length > 0 ?
                            mealTypes.map((mealType, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                {mealType}
                              </span>
                            )) :
                            <span className="text-xs text-gray-500 dark:text-gray-400">No meal types available</span>
                        } else {
                          // Fallback to detected meal types from table
                          return uniqueMealTypes?.length > 0 ?
                            uniqueMealTypes.map((mealType, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                {mealType}
                              </span>
                            )) :
                            <span className="text-xs text-gray-500 dark:text-gray-400">No meal types detected</span>
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration & Progress Card */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500 dark:bg-purple-600 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Duration</h3>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Time & Progress</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Total Duration</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{subscriptionData?.subscriptionHeader?.duration || 0} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">days</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Remaining Days</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{subscriptionData?.subscriptionHeader?.remainingDays || 0} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">days</span></p>
                  </div>

                  {/* Progress Bar */}
                  {subscriptionData?.subscriptionHeader?.duration > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Progress</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold">
                          {Math.round(((subscriptionData.subscriptionHeader.duration - subscriptionData.subscriptionHeader.remainingDays) / subscriptionData.subscriptionHeader.duration) * 100)}%
                        </p>
                      </div>
                      <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-2">
                        <div
                          className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.round(((subscriptionData.subscriptionHeader.duration - subscriptionData.subscriptionHeader.remainingDays) / subscriptionData.subscriptionHeader.duration) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Start Date</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {subscriptionData?.subscriptionHeader?.startDate ?
                        new Date(subscriptionData.subscriptionHeader.startDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Actions Panel */}
            <div className="mt-4 sm:mt-6 lg:mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Subscription Actions</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Manage subscription settings and customer details</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">

                  {/* Subscription Status Actions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Status Actions
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleActionClick('activate', 'status')}
                        className="w-full text-left px-3 py-2 text-sm bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Activate
                      </button>
                      <button
                        onClick={() => handleActionClick('hold', 'status')}
                        className="w-full text-left px-3 py-2 text-sm bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Pause className="h-4 w-4" />
                        Hold
                      </button>
                      <button
                        onClick={() => handleActionClick('restrict', 'status')}
                        className="w-full text-left px-3 py-2 text-sm bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Restrict
                      </button>
                      {/* Unrestrict button - only visible when there are restricted delivery statuses */}
                      {(() => {
                        const hasRestrictedDays = subscriptionData?.subscriptionDetails?.some(detail => {
                          // Check both 'status' and 'deliveryStatus' properties
                          const status1 = (detail.status || '').toLowerCase()
                          const status2 = (detail.deliveryStatus || '').toLowerCase()

                          const isRestricted = status1.includes('restrict') ||
                                             status2.includes('restrict') ||
                                             status1 === 'restricted' ||
                                             status1 === 'resticit' ||
                                             status1 === 'resticited' ||
                                             status2 === 'restricted' ||
                                             status2 === 'resticit' ||
                                             status2 === 'resticited'

                          return isRestricted
                        })

                        console.log('🔍 Should show unrestrict button:', hasRestrictedDays)
                        return hasRestrictedDays
                      })() && (
                        <button
                          onClick={() => handleActionClick('unrestrict', 'status')}
                          className="w-full text-left px-3 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Unrestrict
                        </button>
                      )}
                      <button
                        onClick={() => handleActionClick('refund', 'status')}
                        className="w-full text-left px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <DollarSign className="h-4 w-4" />
                        Refund
                      </button>
                      {/* Change Start Date button - only visible when no deliveries have been made */}
                      {(() => {
                        const hasDeliveredDays = subscriptionData?.subscriptionDetails?.some(detail => {
                          // Check both 'status' and 'deliveryStatus' properties
                          const status1 = (detail.status || '').toLowerCase()
                          const status2 = (detail.deliveryStatus || '').toLowerCase()

                          const isDelivered = status1.includes('deliver') ||
                                            status2.includes('deliver') ||
                                            status1 === 'delivered' ||
                                            status1 === 'deliveried' ||
                                            status2 === 'delivered' ||
                                            status2 === 'deliveried'

                          return isDelivered
                        })

                        console.log('🔍 Should show change start date button:', !hasDeliveredDays)
                        return !hasDeliveredDays
                      })() && (
                        <button
                          onClick={() => handleActionClick('changeStartDate', 'status')}
                          className="w-full text-left px-3 py-2 text-sm bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4" />
                          Change Start Date
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RemainingDays Actions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      RemainingDays Actions
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleActionClick('extendDays', 'days')}
                        className="w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Extend Days
                      </button>
                      <button
                        onClick={() => handleActionClick('renew', 'days')}
                        className="w-full text-left px-3 py-2 text-sm bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Renew Subscription
                      </button>
                    </div>
                  </div>

                  {/* Meal Type Actions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Meal Actions
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleActionClick('changeMealType', 'meal')}
                        className="w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Change Meal Type
                      </button>
                      <button
                        onClick={() => handleActionClick('addDislikeMeals', 'meal')}
                        className="w-full text-left px-3 py-2 text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Add Dislike Meals
                      </button>
                      <button
                        onClick={() => handleActionClick('autoDislikeMeals', 'meal')}
                        className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Zap className="h-4 w-4" />
                        Auto Dislike Meals
                      </button>
                    </div>
                  </div>

                  {/* Delivery Actions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Delivery Actions
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleActionClick('changeDeliveryDays', 'delivery')}
                        className="w-full text-left px-3 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Change Delivery Days
                      </button>
                      <button
                        onClick={() => handleActionClick('changeStartDate', 'delivery')}
                        className="w-full text-left px-3 py-2 text-sm bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Change Start Date
                      </button>
                    </div>
                  </div>

                  {/* Customer & Global Actions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      Customer & Global
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleActionClick('changeCustomerName', 'customer')}
                        className="w-full text-left px-3 py-2 text-sm bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:hover:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Change Customer Name
                      </button>
                      <button
                        onClick={() => handleActionClick('changeAddress', 'customer')}
                        className="w-full text-left px-3 py-2 text-sm bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Change Address
                      </button>
                      <button
                        onClick={() => handleActionClick('changePhone', 'customer')}
                        className="w-full text-left px-3 py-2 text-sm bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Change Phone
                      </button>

                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Tabbed Content Section */}
            <div className="mt-4 sm:mt-6 lg:mt-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-4 sm:space-x-6 lg:space-x-8 px-3 sm:px-4 lg:px-6 overflow-x-auto">
                  {viewOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleTabSelect(option.id)}
                      className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        selectedView === option.id
                          ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-3 sm:p-4 lg:p-6">
                {selectedView === 'details' && (
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {/* Delivery Status Overview */}
                    <div className="bg-white dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Delivery Status Overview</h3>

                      {/* Overall Summary - Counts by Delivery Date Status */}
                      <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-7 gap-2">
                        {/* Total Button */}
                        <button
                          onClick={() => setStatusFilter('all')}
                          className={`p-2 rounded-md transition-all duration-200 ${
                            statusFilter === 'all'
                              ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-sm'
                              : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/70'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold">
                              {statusCounts.all || 0}
                            </div>
                            <div className="text-xs font-medium">
                              Total
                            </div>
                          </div>
                        </button>

                        {/* Dynamic Status Buttons */}
                        {availableStatuses.map((status) => {
                          const getStatusStyles = (status) => {
                            const buttonColors = getDeliveryStatusColor(status, 'button')
                            return {
                              selected: buttonColors.selected,
                              textSelected: 'text-white',
                              default: buttonColors.default
                            }
                          }

                          const styles = getStatusStyles(status)
                          const isSelected = statusFilter === status

                          return (
                            <button
                              key={status}
                              onClick={() => setStatusFilter(status)}
                              className={`p-2 rounded-md transition-all duration-200 ${
                                isSelected ? styles.selected : styles.default
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-lg font-bold">
                                  {statusCounts[status] || 0}
                                </div>
                                <div className="text-xs font-medium">
                                  {status}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Bulk Actions Bar - Shows when items are selected */}
                    {selectedRows.length > 0 && (
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-white">
                              {selectedRows.length} item{selectedRows.length > 1 ? 's' : ''} selected
                            </span>
                            <button
                              onClick={() => setSelectedRows([])}
                              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                            >
                              Clear selection
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleDeleteDays}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                            >
                              Delete Days
                            </button>
                            <button
                              onClick={handleChangeDaysStatus}
                              className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                            >
                              Change Day Status
                            </button>
                            <button
                              onClick={() => handleActionClick('mergeUnmerge', 'days')}
                              className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                            >
                              Merge Days
                            </button>
                            <button className="px-3 py-1.5 bg-slate-500 text-white rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors">
                              Change Delivery Details
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Filter and Status Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Showing:</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {filteredGroupedMeals.length} of {groupedMeals.length} delivery days
                          </span>
                          {statusFilter !== 'all' && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize">
                              {statusFilter} only
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Filter"
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>Day ID (+9 others)</option>
                        </select>
                      </div>
                    </div>

                    {/* Table */}
                    {filteredGroupedMeals.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <table className="w-full" style={{ tableLayout: 'fixed' }}>
                          <thead className="bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-8 relative group">
                                <input
                                  type="checkbox"
                                  checked={selectAll}
                                  onChange={handleSelectAll}
                                  className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2 focus:ring-offset-0"
                                />
                                <div
                                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => handleMouseDown(e, 0)}
                                ></div>
                              </th>
                              <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-8 relative group">
                                #
                                <div
                                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => handleMouseDown(e, 1)}
                                ></div>
                              </th>
                              <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-12 relative group">
                                Actions
                                <div
                                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => handleMouseDown(e, 2)}
                                ></div>
                              </th>
                              <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-20 relative group">
                                Delivery Date
                                <div
                                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => handleMouseDown(e, 3)}
                                ></div>
                              </th>
                              <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-10 relative group">
                                dayID
                                <div
                                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => handleMouseDown(e, 4)}
                                ></div>
                              </th>
                              <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-12 relative group">
                                Day Count
                                <div
                                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => handleMouseDown(e, 5)}
                                ></div>
                              </th>
                              <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-32 relative group">
                                Status
                                <div
                                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => handleMouseDown(e, 6)}
                                ></div>
                              </th>
                              {/* Dynamic Meal Type Columns */}
                              {uniqueMealTypes.map((mealType, mealTypeIndex) => (
                                <th key={mealType} className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs min-w-[100px] max-w-[120px] relative group">
                                  <div className="truncate" title={mealType}>
                                    {mealType}
                                  </div>
                                  <div
                                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onMouseDown={(e) => handleMouseDown(e, 7 + mealTypeIndex)}
                                  ></div>
                                </th>
                              ))}

                              <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-12 relative group">
                                Invoice #
                                <div
                                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => handleMouseDown(e, 7 + uniqueMealTypes.length)}
                                ></div>
                              </th>
                              <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-12 relative group">
                                Line State
                                <div
                                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => handleMouseDown(e, 8 + uniqueMealTypes.length)}
                                ></div>
                              </th>
                              <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-12 relative group">
                                Actions
                                <div
                                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => handleMouseDown(e, 9 + uniqueMealTypes.length)}
                                ></div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredGroupedMeals.map((group, index) => {
                              // Get the first meal for row-level data (date, status, etc.)
                              const firstMeal = Object.values(group.meals)[0]
                              const rowId = `group-${group.date}-${index}`

                              // Get dayID and dayNumberCount from the first meal in this group
                              const dayID = firstMeal?.dayID || 'N/A'
                              const dayNumberCount = firstMeal?.dayNumberCount || (index + 1)

                              // Debug: Log the first meal structure to see available fields
                              if (index === 0) {
                                console.log('🔍 First meal structure:', firstMeal)
                                console.log('🔍 Available fields:', Object.keys(firstMeal || {}))
                                console.log('🔍 dayID field:', firstMeal?.dayID)
                                console.log('🔍 dayNumberCount field:', firstMeal?.dayNumberCount)
                                console.log('🔍 id field:', firstMeal?.id)
                              }

                              return (
                                <tr
                                  key={rowId}
                                  className={`
                                    transition-all duration-200 ease-in-out
                                    ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-white dark:bg-gray-800/50'}
                                    hover:bg-gray-100/70 dark:hover:bg-gray-700/50
                                    ${selectedRows.includes(firstMeal?.dayID || firstMeal?.id) ? 'bg-blue-50/80 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800' : ''}
                                  `}
                                >
                                  <td className="py-3 px-2 w-8">
                                    <input
                                      type="checkbox"
                                      checked={selectedRows.includes(firstMeal?.dayID || firstMeal?.id)}
                                      onChange={() => handleRowSelect(firstMeal?.dayID || firstMeal?.id)}
                                      className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2 focus:ring-offset-0"
                                    />
                                  </td>
                                  <td className="py-3 px-2 text-xs font-medium text-gray-900 dark:text-gray-100">{index + 1}</td>
                                  <td className="py-3 px-2 text-center">
                                    <button className="p-1 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                      <MoreVertical className="h-3 w-3" />
                                    </button>
                                  </td>
                                  <td className="py-3 px-2">
                                    <div className="space-y-1">
                                      <div className="font-semibold text-gray-900 dark:text-gray-100 text-xs">{group.dayName || 'Wed'}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {group.date ? new Date(group.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '6/23'}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-2 text-center text-xs font-medium text-gray-900 dark:text-gray-100">{dayID}</td>
                                  <td className="py-3 px-2 text-center text-xs font-medium text-gray-900 dark:text-gray-100">{dayNumberCount}</td>
                                  <td className="py-3 px-2 text-center">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border shadow-sm ${
                                      getDeliveryStatusColor(group.deliveryStatus || 'Pending', 'badge')
                                    }`}>
                                      {group.deliveryStatus || 'Pending'}
                                    </span>
                                  </td>
                                  {/* Dynamic Meal Type Columns */}
                                  {uniqueMealTypes.map((mealType) => {
                                    const meal = group.meals[mealType]
                                    return (
                                      <td key={mealType} className="py-3 px-2">
                                        {meal ? (
                                          <div className="text-xs text-gray-900 dark:text-gray-100 font-medium leading-tight break-words">
                                            {meal.mealName}
                                          </div>
                                        ) : (
                                          <div className="text-xs text-gray-400 dark:text-gray-500 italic">
                                            -
                                          </div>
                                        )}
                                      </td>
                                    )
                                  })}

                                  <td className="py-3 px-2 text-center text-xs font-medium text-gray-900 dark:text-gray-100">1906</td>
                                  <td className="py-3 px-2 text-center">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border shadow-sm ${
                                      getDeliveryStatusColor(group.lineState || 'Done', 'badge')
                                    }`}>
                                      {(group.lineState || 'Done').substring(0, 4)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2 text-center">
                                    <button className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 shadow-sm">
                                      Hold
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No meal details available</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedView === 'customerLog' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Log</h3>
                      </div>
                      {tabLoading.customerLog && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Loading...
                        </div>
                      )}
                    </div>

                    {!subscriptionData?.subscriptionHeader?.subscriptionId ? (
                      <div className="text-center py-12">
                        <User className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Subscription Selected</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Please search for and select a subscription first</p>
                      </div>
                    ) : tabLoading.customerLog ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Customer Log</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Fetching customer activity data...</p>
                      </div>
                    ) : customerLogData ? (
                        <div className="overflow-x-auto">
                          {(() => {
                            console.log('Rendering customer log table with data:', customerLogData);
                            console.log('Is array:', Array.isArray(customerLogData));
                            console.log('Length:', customerLogData?.length);
                            return null;
                          })()}
                          {Array.isArray(customerLogData) && customerLogData.length > 0 ? (
                            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                              <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SID</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action Type</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remain Days</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Day ID</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Delivery Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {customerLogData.map((log, index) => {
                                  // Extract date and time from the datetime string
                                  const dateTime = log.date ? new Date(log.date) : null;
                                  const dateStr = dateTime ? dateTime.toLocaleDateString() : 'N/A';
                                  const timeStr = dateTime ? dateTime.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true
                                  }) : 'N/A';

                                  // Format delivery date if available
                                  const deliveryDateTime = log.deliveryDate ? new Date(log.deliveryDate) : null;
                                  const deliveryDateStr = deliveryDateTime ? deliveryDateTime.toLocaleDateString() : 'N/A';

                                  return (
                                    <tr key={log.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        {log.id || 'N/A'}
                                      </td>
                                      <td className="px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                                        {log.sid || 'N/A'}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {dateStr}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                                        {timeStr}
                                      </td>
                                      <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getActionTypeColor(log.actionstypes)}`}>
                                          {log.actionstypes || 'N/A'}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                                        <div className="truncate" title={log.action || 'N/A'}>
                                          {log.action || 'N/A'}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {log.user || 'System'}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                                        <div className="truncate" title={log.notes || 'No notes'}>
                                          {log.notes || '-'}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">
                                        {log.remaingDays !== undefined ? log.remaingDays : 'N/A'}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                                        {log.dayID || 'N/A'}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {deliveryDateStr}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          ) : (
                            <div className="text-center py-8">
                              <User className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                              <p className="text-gray-500 dark:text-gray-400">No customer log entries found</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <User className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No customer log entries found or failed to load data</p>
                          <button
                            onClick={() => fetchTabData('customerLog')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            Retry Loading Data
                          </button>
                        </div>
                      )}
                  </div>
                )}

                {selectedView === 'invoiceLog' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Log</h3>
                      </div>
                      {tabLoading.invoiceLog && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          Loading...
                        </div>
                      )}
                    </div>

                    {invoiceLogData ? (
                      <div className="overflow-x-auto">
                        {Array.isArray(invoiceLogData) && invoiceLogData.length > 0 ? (
                          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Method</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                              {invoiceLogData.map((invoice, index) => (
                                <tr key={invoice.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                    #{invoice.invoiceNumber || invoice.id || index + 1}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {invoice.date || invoice.invoiceDate ?
                                      new Date(invoice.date || invoice.invoiceDate).toLocaleDateString() :
                                      'N/A'
                                    }
                                  </td>
                                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                                    ${invoice.amount || invoice.total || '0.00'}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      invoice.status === 'paid' || invoice.status === 'Paid' ?
                                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                      invoice.status === 'pending' || invoice.status === 'Pending' ?
                                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                    }`}>
                                      {invoice.status || 'Unknown'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {invoice.dueDate ?
                                      new Date(invoice.dueDate).toLocaleDateString() :
                                      'N/A'
                                    }
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {invoice.paymentMethod || 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No invoice records found</p>
                          </div>
                        )}
                      </div>
                    ) : !tabLoading.invoiceLog ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Click to load invoice data</p>
                      </div>
                    ) : null}
                  </div>
                )}

                {selectedView === 'deliveryLog' && (
                  <div className="text-center py-12">
                    <Truck className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delivery Log</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Delivery status and tracking information</p>
                    <div className="mt-4 text-xs text-gray-400">Feature coming soon</div>
                  </div>
                )}

                {selectedView === 'deliveryNotesLog' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Edit className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Notes Log</h3>
                      </div>
                      {tabLoading.deliveryNotesLog && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          Loading...
                        </div>
                      )}
                    </div>

                    {deliveryNotesData ? (
                      <div className="overflow-x-auto">
                        {Array.isArray(deliveryNotesData) && deliveryNotesData.length > 0 ? (
                          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Note</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Added By</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                              {deliveryNotesData.map((note, index) => (
                                <tr key={note.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                    {note.id || index + 1}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {note.date || note.createdAt ?
                                      new Date(note.date || note.createdAt).toLocaleDateString() :
                                      'N/A'
                                    }
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs">
                                    <div className="truncate" title={note.note || note.message || note.instructions}>
                                      {note.note || note.message || note.instructions || 'No note content'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {note.type || note.category || 'General'}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      note.priority === 'high' || note.priority === 'urgent' ?
                                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                      note.priority === 'medium' ?
                                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    }`}>
                                      {note.priority || 'Normal'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {note.addedBy || note.user || 'System'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-center py-8">
                            <Edit className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No delivery notes found</p>
                          </div>
                        )}
                      </div>
                    ) : !tabLoading.deliveryNotesLog ? (
                      <div className="text-center py-12">
                        <Edit className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Click to load delivery notes</p>
                      </div>
                    ) : null}
                  </div>
                )}

                {selectedView === 'dislikeMealsLog' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dislike Meals Log</h3>
                      </div>
                      {tabLoading.dislikeMealsLog && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          Loading...
                        </div>
                      )}
                    </div>

                    {dislikeMealsData ? (
                      <div className="overflow-x-auto">
                        {Array.isArray(dislikeMealsData) && dislikeMealsData.length > 0 ? (
                          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Meal ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Meal Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Added</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Added By</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                              {dislikeMealsData.map((meal, index) => (
                                <tr key={meal.id || meal.mealId || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                    {meal.mealId || meal.id || 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                    {meal.mealName || meal.name || `Meal ${index + 1}`}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded text-xs">
                                      {meal.category || meal.type || 'General'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                                    <div className="truncate" title={meal.reason}>
                                      {meal.reason || 'No reason provided'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {meal.dateAdded || meal.createdAt ?
                                      new Date(meal.dateAdded || meal.createdAt).toLocaleDateString() :
                                      'N/A'
                                    }
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {meal.addedBy || 'System'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-center py-8">
                            <X className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No disliked meals found</p>
                            <p className="text-xs text-gray-400 mt-2">Customer has no meal preferences recorded</p>
                          </div>
                        )}
                      </div>
                    ) : !tabLoading.dislikeMealsLog ? (
                      <div className="text-center py-12">
                        <X className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Click to load disliked meals</p>
                      </div>
                    ) : null}
                  </div>
                )}

                {selectedView === 'mealsLog' && (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Meals Log</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Complete meal history and scheduling</p>
                    <div className="mt-4 text-xs text-gray-400">Feature coming soon</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!subscriptionData && subscriptionsList.length === 0 && (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Ready to Search</h3>
            <p className="text-gray-600 max-w-lg mx-auto mb-8 text-lg leading-relaxed">
              Enter a Subscription ID or Phone Number above to get started with subscription management.
            </p>
            <div className="flex justify-center gap-8">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Package className="h-4 w-4" />
                <span>SID Search</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-4 w-4" />
                <span>Phone Search</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Dialog */}
        {showActionDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${
              selectedAction?.type === 'unrestrict' ? 'max-w-lg' :
              selectedAction?.type === 'mergeUnmerge' ? 'max-w-5xl' :
              selectedAction?.type === 'renew' ? 'max-w-5xl' :
              selectedAction?.type === 'changeMealType' ? 'max-w-2xl' :
              selectedAction?.type === 'changeDeliveryDays' ? 'max-w-2xl' :
              selectedAction?.type === 'changeCustomerName' ? 'max-w-md' :
              selectedAction?.type === 'changePhone' ? 'max-w-md' :
              selectedAction?.type === 'changeAddress' ? 'max-w-2xl' : 'max-w-md'
            }`}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedAction?.type === 'activate' && 'Activate Subscription'}
                      {selectedAction?.type === 'hold' && 'Hold Subscription'}
                      {selectedAction?.type === 'restrict' && 'Restrict Subscription'}
                      {selectedAction?.type === 'refund' && 'Process Refund'}
                      {selectedAction?.type === 'extendDays' && 'Extend Days'}
                      {selectedAction?.type === 'detact' && 'Remove Days'}
                      {selectedAction?.type === 'mergeUnmerge' && 'Merge/Unmerge Days'}
                      {selectedAction?.type === 'changeMealType' && 'Change Meal Type'}
                      {selectedAction?.type === 'addDislikeMeals' && 'Add Dislike Meals'}
                      {selectedAction?.type === 'autoDislikeMeals' && 'Auto Dislike Meals'}
                      {selectedAction?.type === 'changeDeliveryDay' && 'Change Delivery Day'}
                      {selectedAction?.type === 'changeStartDate' && 'Change Start Date'}
                      {selectedAction?.type === 'changeCustomerName' && 'Change Customer Name'}
                      {selectedAction?.type === 'changeAddress' && 'Change Address'}
                      {selectedAction?.type === 'changePhone' && 'Change Phone Number'}
                      {selectedAction?.type === 'changeDayStatus' && 'Change Day Status'}
                      {selectedAction?.type === 'deleteDays' && 'Delete Days'}
                      {selectedAction?.type === 'renew' && 'Renew Subscription'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedAction?.category === 'status' && 'Modify subscription status'}
                      {selectedAction?.category === 'days' && 'Manage subscription days'}
                      {selectedAction?.category === 'delivery' && 'Adjust delivery settings'}
                      {selectedAction?.category === 'customer' && 'Update customer information'}
                      {selectedAction?.category === 'global' && 'Global subscription changes'}
                      {selectedAction?.type === 'renew' && `Plan: ${subscriptionData?.subscriptionHeader?.planName || 'Current Plan'} • SID: ${subscriptionData?.subscriptionHeader?.subscriptionId}`}
                    </p>
                  </div>
                  <button
                    onClick={handleActionCancel}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Dialog Content */}
                <div className="space-y-3">
                  {/* Extend Days Form */}
                  {selectedAction?.type === 'extendDays' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Extend Days
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={actionData.days || ''}
                          onChange={(e) => setActionData({ ...actionData, days: parseInt(e.target.value) || '' })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                          placeholder="Enter number of days to extend"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </label>
                        <textarea
                          value={actionData.notes || ''}
                          onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-none"
                          placeholder="Add notes about this extension..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Active Subscriptions Form */}
                  {selectedAction?.type === 'activate' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Active Date
                        </label>
                        <input
                          type="date"
                          value={actionData.activeDate || ''}
                          onChange={(e) => setActionData({ ...actionData, activeDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </label>
                        <textarea
                          value={actionData.notes || ''}
                          onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-none"
                          placeholder="Add notes about activating this subscription..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Hold Action Form */}
                  {selectedAction?.type === 'hold' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hold Date
                        </label>
                        <input
                          type="date"
                          value={actionData.holdDate || ''}
                          onChange={(e) => setActionData({ ...actionData, holdDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </label>
                        <textarea
                          value={actionData.notes || ''}
                          onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-none"
                          placeholder="Add notes about holding this subscription..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Restrict Subscriptions Form */}
                  {selectedAction?.type === 'restrict' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            From Date
                          </label>
                          <input
                            type="date"
                            value={actionData.fromDate || ''}
                            onChange={(e) => setActionData({ ...actionData, fromDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            To Date
                          </label>
                          <input
                            type="date"
                            value={actionData.toDate || ''}
                            onChange={(e) => setActionData({ ...actionData, toDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </label>
                        <textarea
                          value={actionData.notes || ''}
                          onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-none"
                          placeholder="Add notes about restricting this subscription..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Unrestrict Days Form */}
                  {selectedAction?.type === 'unrestrict' && (
                    <div className="space-y-6">
                      {/* Show restricted days grouped by delivery date */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Unrestrict Days
                        </h3>
                        <div className="max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                              <tr>
                                <th className="px-4 py-3 text-left w-16">
                                  <input
                                    type="checkbox"
                                    checked={(() => {
                                      const restrictedDays = subscriptionData?.subscriptionDetails?.filter(detail =>
                                        detail.status === 'Resticited'
                                      ) || []
                                      return actionData.selectedDays?.length === restrictedDays.length && restrictedDays.length > 0
                                    })()}
                                    onChange={(e) => {
                                      const restrictedDays = subscriptionData?.subscriptionDetails?.filter(detail =>
                                        detail.status === 'Resticited'
                                      ) || []
                                      setActionData({
                                        ...actionData,
                                        selectedDays: e.target.checked ? restrictedDays.map(day => day.id) : []
                                      })
                                    }}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white w-40">DeliveryDay</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">DeliveryStatus</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {(() => {
                                // Debug: Check current subscription data
                                if (subscriptionData?.subscriptionDetails) {
                                  const allStatuses = subscriptionData.subscriptionDetails.map(d => d.deliveryStatus)
                                  const uniqueStatuses = [...new Set(allStatuses)]
                                  console.log('🔍 Current subscription statuses:', uniqueStatuses)
                                  console.log('🔍 Total subscription details:', subscriptionData.subscriptionDetails.length)

                                  // Check for 'Restricted' matches
                                  const restrictedMatches = subscriptionData.subscriptionDetails.filter(d => d.deliveryStatus === 'Restricted')
                                  console.log('🔍 "Restricted" matches:', restrictedMatches.length)

                                  // Show detailed structure of first restricted item
                                  const firstRestrictedItem = subscriptionData.subscriptionDetails.find(detail => detail.status === 'Resticited')
                                  if (firstRestrictedItem) {
                                    console.log('🔍 Restricted item keys:', Object.keys(firstRestrictedItem))
                                    console.log('🔍 Restricted item data:', firstRestrictedItem)
                                    console.log('🔍 dayID field:', firstRestrictedItem.dayID)
                                    console.log('🔍 deliveryDate field:', firstRestrictedItem.deliveryDate)
                                    console.log('🔍 date field:', firstRestrictedItem.date)
                                  }
                                }

                                // SELECT date, status, COUNT(*) as count
                                // WHERE status = 'Resticited'
                                // GROUP BY date
                                const restrictedDaysRaw = subscriptionData?.subscriptionDetails
                                  ?.filter(detail => detail.status === 'Resticited') || []

                                // Group by delivery date
                                const groupedByDate = restrictedDaysRaw.reduce((groups, detail) => {
                                  const date = detail.date?.split('T')[0] // Extract date part only
                                  if (!groups[date]) {
                                    groups[date] = {
                                      deliveryDate: date,
                                      count: 0,
                                      ids: []
                                    }
                                  }
                                  groups[date].count++
                                  groups[date].ids.push(detail.id)
                                  return groups
                                }, {})

                                const restrictedDays = Object.values(groupedByDate)

                                console.log('🔍 Found Resticited days:', restrictedDays.length)
                                console.log('🔍 Sample restricted day data:', restrictedDays[0])

                                // Sort dates
                                const sortedDays = restrictedDays.sort((a, b) => {
                                  if (!a.deliveryDate) return 1
                                  if (!b.deliveryDate) return -1
                                  return new Date(a.deliveryDate) - new Date(b.deliveryDate)
                                })

                                return sortedDays.map((day, index) => (
                                    <tr key={`${day.deliveryDate}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                      <td className="px-4 py-3">
                                        <input
                                          type="checkbox"
                                          checked={day.ids?.every(id => actionData.selectedDays?.includes(id)) || false}
                                          onChange={(e) => {
                                            const currentSelected = actionData.selectedDays || []
                                            setActionData({
                                              ...actionData,
                                              selectedDays: e.target.checked
                                                ? [...currentSelected, ...day.ids]
                                                : currentSelected.filter(id => !day.ids.includes(id))
                                            })
                                          }}
                                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                      </td>

                                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                                        {day.deliveryDate ? new Date(day.deliveryDate).toLocaleDateString('en-GB') : 'N/A'}
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                          Restricted
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </label>
                        <textarea
                          value={actionData.notes || ''}
                          onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-none"
                          placeholder="Add notes about unrestricting these days..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Change Start Date Form */}
                  {selectedAction?.type === 'changeStartDate' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={actionData.startDate || ''}
                          onChange={(e) => setActionData({ ...actionData, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </label>
                        <textarea
                          value={actionData.notes || ''}
                          onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-none"
                          placeholder="Add notes about changing the start date..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Merge Days Form */}
                  {selectedAction?.type === 'mergeUnmerge' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Merge Days
                        </h3>
                        <div className="max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                              <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">DeliveryDay</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Day ID</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">DayNumber</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">DayName</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">DeliveryStatus</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {(() => {
                                // Get selected days from subscription details
                                const selectedDays = subscriptionData?.subscriptionDetails?.filter(detail => {
                                  const matchFound = selectedRows.includes(detail.dayID) ||
                                                   selectedRows.includes(detail.id) ||
                                                   selectedRows.includes(detail.dayId) ||
                                                   selectedRows.includes(String(detail.dayID)) ||
                                                   selectedRows.includes(String(detail.id))
                                  return matchFound
                                }) || []

                                console.log('🔍 Selected days for merge:', selectedDays)

                                return selectedDays.map((day, index) => (
                                  <tr key={day.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-4 py-3">
                                      <input
                                        type="date"
                                        value={(() => {
                                          // Get the current delivery date for this day
                                          const mergeData = actionData.mergeDays || {}
                                          const dayData = mergeData[day.id]
                                          if (dayData?.deliveryDate) {
                                            return dayData.deliveryDate
                                          }
                                          // Default to original date
                                          if (day.date) {
                                            return new Date(day.date).toISOString().split('T')[0]
                                          }
                                          return ''
                                        })()}
                                        onChange={(e) => {
                                          const currentMergeData = actionData.mergeDays || {}
                                          setActionData({
                                            ...actionData,
                                            mergeDays: {
                                              ...currentMergeData,
                                              [day.id]: {
                                                ...currentMergeData[day.id],
                                                deliveryDate: e.target.value,
                                                dayId: day.dayID || day.id,
                                                dayNumber: day.dayNumber || index + 1,
                                                dayName: day.dayName || new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
                                                deliveryStatus: day.deliveryStatus || day.status
                                              }
                                            }
                                          })
                                        }}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                                      {day.dayID || day.id}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                                      {day.dayNumber || index + 1}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                                      {day.dayName || (day.date ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }) : 'N/A')}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        {day.deliveryStatus || day.status || 'Pending'}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              })()}
                            </tbody>
                          </table>
                        </div>
                        {selectedRows.length === 0 && (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>Please select days from the subscription details table to merge</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Renew Subscription Form */}
                  {selectedAction?.type === 'renew' && (
                    <div className="space-y-4">
                      {console.log('🎯 Renew form is rendering!', { selectedAction, actionData })}


                      {/* Schedule & Duration Section */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule & Duration</h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Set start date and subscription duration</p>
                        </div>


                        <div className="p-4">
                          <div className="space-y-4">
                            {/* Labels Row */}
                            <div className="grid grid-cols-2 gap-6">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Start Date *
                              </label>
                              <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Duration * {loadingRenewData && <span className="text-xs text-gray-500">(Loading...)</span>}
                                </label>
                                {!loadingRenewData && (
                                  <div className="flex rounded-lg bg-gray-700 p-1">
                                    <button
                                      type="button"
                                      onClick={() => setActionData(prev => ({ ...prev, durationMode: 'plan' }))}
                                      className={`px-4 py-1 text-sm font-medium rounded-md transition-all ${
                                        (actionData.durationMode || 'plan') === 'plan'
                                          ? 'bg-blue-600 text-white shadow-sm'
                                          : 'text-gray-300 hover:text-white'
                                      }`}
                                    >
                                      From Plan
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setActionData(prev => ({ ...prev, durationMode: 'custom', duration: '' }))}
                                      className={`px-4 py-1 text-sm font-medium rounded-md transition-all ${
                                        actionData.durationMode === 'custom'
                                          ? 'bg-blue-600 text-white shadow-sm'
                                          : 'text-gray-300 hover:text-white'
                                      }`}
                                    >
                                      Custom
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Inputs Row */}
                            {loadingRenewData ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-6">
                                {/* Start Date Input */}
                                <div>
                                  <input
                                    type="date"
                                    value={actionData.startDate || ''}
                                    onChange={(e) => setActionData(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    placeholder="dd/mm/yyyy"
                                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                  />
                                </div>

                                {/* Duration Input */}
                                <div className="space-y-3">
                                  <div className="relative">
                                    {(actionData.durationMode || 'plan') === 'plan' ? (
                                      <select
                                        value={actionData.duration || subscriptionData?.subscriptionHeader?.duration || ''}
                                        onChange={(e) => {
                                          console.log('🔄 Duration dropdown changed:', e.target.value)
                                          const newDuration = parseInt(e.target.value)
                                          const newActionData = { ...actionData, duration: newDuration }
                                          setActionData(prev => ({ ...prev, duration: newDuration }))
                                          triggerPlanPriceUpdate(newActionData)
                                        }}
                                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                                      >
                                        <option value="">Choose duration...</option>
                                        {availableDurations.map((duration) => (
                                          <option key={duration.value} value={duration.value}>
                                            {duration.label}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        type="number"
                                        min="1"
                                        value={actionData.duration || ''}
                                        onChange={(e) => {
                                          const newDuration = parseInt(e.target.value) || ''
                                          const newActionData = { ...actionData, duration: newDuration }
                                          setActionData(prev => ({ ...prev, duration: newDuration }))
                                          if (newDuration) triggerPlanPriceUpdate(newActionData)
                                        }}
                                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                        placeholder="Enter custom duration in days"
                                      />
                                    )}
                                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>

                                  {/* Plan Options Indicator */}
                                  {(actionData.durationMode || 'plan') === 'plan' && availableDurations.length > 0 && (
                                    <p className="text-xs text-blue-400 font-medium">
                                      {availableDurations.length} options available from plan
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Meal Types Section */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meal Types</h3>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Select Meal Types {loadingRenewData && <span className="text-xs text-gray-500">(Loading...)</span>}
                            </label>
                            {!loadingRenewData && availableMealTypes.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const allMealTypeIds = availableMealTypes.map(mealType => mealType.id)
                                    const newActionData = { ...actionData, mealTypes: allMealTypeIds }
                                    setActionData(prev => ({ ...prev, mealTypes: allMealTypeIds }))
                                    triggerPlanPriceUpdate(newActionData)
                                  }}
                                  className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md transition-colors font-medium"
                                >
                                  Select All
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newActionData = { ...actionData, mealTypes: [] }
                                    setActionData(prev => ({ ...prev, mealTypes: [] }))
                                    triggerPlanPriceUpdate(newActionData)
                                  }}
                                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors font-medium"
                                >
                                  Unselect All
                                </button>
                              </div>
                            )}
                          </div>
                          {loadingRenewData ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {availableMealTypes.length > 0 ? availableMealTypes.map(mealType => {
                                  // Get current subscription meal types (IDs) or use actionData if modified
                                  const currentSubscriptionMealIds = getCurrentSubscriptionMealTypes()
                                  const selectedMealIds = actionData.mealTypes || currentSubscriptionMealIds
                                  const isChecked = selectedMealIds.includes(mealType.id)

                                  return (
                                    <label key={mealType.id} className="flex items-center space-x-3 cursor-pointer hover:bg-white dark:hover:bg-gray-600 p-3 rounded-lg transition-colors">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          console.log('🍽️ Meal type changed:', mealType.name, e.target.checked)
                                          let newMealTypes
                                          if (e.target.checked) {
                                            newMealTypes = [...(actionData.mealTypes || currentSubscriptionMealIds).filter(id => id !== mealType.id), mealType.id]
                                          } else {
                                            newMealTypes = (actionData.mealTypes || currentSubscriptionMealIds).filter(id => id !== mealType.id)
                                          }
                                          const newActionData = { ...actionData, mealTypes: newMealTypes }
                                          setActionData(prev => ({ ...prev, mealTypes: newMealTypes }))
                                          triggerPlanPriceUpdate(newActionData)
                                        }}
                                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                      />
                                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{mealType.name}</span>
                                    </label>
                                  )
                                }) : (
                                  <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <p>No meal types available for this plan</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery Days Section */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Days</h3>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Select Delivery Days {loadingRenewData && <span className="text-xs text-gray-500">(Loading...)</span>}
                            </label>
                            {!loadingRenewData && availableDeliveryDays.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const allDayIds = availableDeliveryDays.map(day => day.day_id || day.id)
                                    const newActionData = { ...actionData, deliveryDays: allDayIds }
                                    setActionData(newActionData)
                                    triggerPlanPriceUpdate(newActionData)
                                  }}
                                  className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md transition-colors font-medium"
                                >
                                  Select All
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newActionData = { ...actionData, deliveryDays: [] }
                                    setActionData(newActionData)
                                    triggerPlanPriceUpdate(newActionData)
                                  }}
                                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors font-medium"
                                >
                                  Unselect All
                                </button>
                              </div>
                            )}
                          </div>
                          {loadingRenewData ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {availableDeliveryDays.length > 0 ? availableDeliveryDays.map(deliveryDay => {
                                  // Get current subscription delivery days (IDs) or use actionData if modified
                                  const currentSubscriptionDayIds = getCurrentSubscriptionDeliveryDays()
                                  const selectedDayIds = actionData.deliveryDays || currentSubscriptionDayIds
                                  const isChecked = selectedDayIds.includes(deliveryDay.day_id || deliveryDay.id)

                                  return (
                                    <label key={deliveryDay.day_id || deliveryDay.id} className="flex items-center space-x-3 cursor-pointer hover:bg-white dark:hover:bg-gray-600 p-3 rounded-lg transition-colors">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const dayId = deliveryDay.day_id || deliveryDay.id
                                          let newDeliveryDays
                                          if (e.target.checked) {
                                            newDeliveryDays = [...(actionData.deliveryDays || currentSubscriptionDayIds).filter(id => id !== dayId), dayId]
                                          } else {
                                            newDeliveryDays = (actionData.deliveryDays || currentSubscriptionDayIds).filter(id => id !== dayId)
                                          }
                                          const newActionData = { ...actionData, deliveryDays: newDeliveryDays }
                                          setActionData(newActionData)
                                          triggerPlanPriceUpdate(newActionData)
                                        }}
                                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                      />
                                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{deliveryDay.day_name || deliveryDay.name}</span>
                                    </label>
                                  )
                                }) : (
                                  <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                                    </svg>
                                    <p>No delivery days available</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Without Invoice Checkbox */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="withoutInvoice"
                                checked={actionData.withoutInvoice || false}
                                onChange={(e) => {
                                  const isChecked = e.target.checked
                                  setActionData(prev => ({
                                    ...prev,
                                    withoutInvoice: isChecked,
                                    // Reset billing fields when enabling "without invoice"
                                    ...(isChecked ? {
                                      total: 0,
                                      taxAmount: 0,
                                      manualDiscount: 0,
                                      bagValue: 0
                                    } : {})
                                  }))
                                }}
                                className="rounded border-2 border-gray-300 dark:border-gray-600 text-green-600 focus:outline-none focus:border-green-500 dark:focus:border-green-400 transition-colors"
                              />
                              <label htmlFor="withoutInvoice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                With Out Invoice
                              </label>
                            </div>

                            {/* Info message when without invoice is selected */}
                            {actionData.withoutInvoice && (
                              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                <div className="flex items-center space-x-2">
                                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                                    Billing disabled - Payment, Pricing & Attach Files sections are hidden
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {!actionData.withoutInvoice && (
                      <>
                      {/* Gift Code Section - Hidden */}
                      {false && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gift Code</h3>
                          </div>
                        </div>

                        <div className="p-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Gift Code (Optional)
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={actionData.giftCode || ''}
                                onChange={(e) => setActionData(prev => ({ ...prev, giftCode: e.target.value }))}
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-pink-500 dark:focus:border-pink-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                placeholder="Enter gift code..."
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                              </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Enter a valid gift code to apply discounts or special offers to this subscription.
                            </p>
                          </div>
                        </div>
                      </div>
                      )}

                      {/* Payment & Settings Section */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment & Settings</h3>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Subscription From */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Subscription From
                              </label>
                              <select
                                value={actionData.subscriptionType !== undefined ? actionData.subscriptionType : (subscriptionData?.subscriptionHeader?.subscriptionType || 0)}
                                onChange={async (e) => {
                                  const newSubscriptionType = parseInt(e.target.value)

                                  setActionData(prev => ({
                                    ...prev,
                                    subscriptionType: newSubscriptionType,
                                    branchId: newSubscriptionType === 2 ? prev.branchId : null // Reset branch if not Branch type
                                  }))

                                  // Determine branch ID based on subscription type
                                  let branchId = 0

                                  if (newSubscriptionType === 2) {
                                    // Branch type - use selected branch or 0
                                    branchId = actionData.branchId || 0
                                  } else {
                                    // Web (0) or Mobile Application (1) - fetch branches and use first one
                                    try {
                                      console.log('🏢 Fetching branches for Web/Mobile subscription type...')
                                      const response = await fetch('http://eg.localhost:7167/api/v1/ActionsManager/branches', {
                                        method: 'GET',
                                        headers: {
                                          'Content-Type': 'application/json'
                                        }
                                      })

                                      if (response.ok) {
                                        const result = await response.json()
                                        const branchesData = result?.data || []
                                        console.log('🏢 Fetched branches:', branchesData)

                                        if (branchesData.length > 0) {
                                          branchId = branchesData[0].branchID
                                          console.log('🏢 Using first branch ID:', branchId, branchesData[0].branchName)
                                        }
                                      } else {
                                        console.error('❌ Failed to fetch branches:', response.status)
                                      }
                                    } catch (error) {
                                      console.error('❌ Error fetching branches:', error)
                                    }
                                  }

                                  // Reload payment methods with determined branch ID
                                  console.log('💳 Loading payment methods for subscriptionType:', newSubscriptionType, 'branchId:', branchId)
                                  loadPaymentMethods(newSubscriptionType, branchId)
                                }}
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                              >
                                <option value={0}>Web</option>
                                <option value={1}>Mobile Application</option>
                                <option value={2}>Branch</option>
                              </select>
                            </div>

                            {/* Payment Method */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Payment Method {loadingRenewData && <span className="text-xs text-gray-500">(Loading...)</span>}
                              </label>
                              {loadingRenewData ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                              ) : (
                                <select
                                  value={actionData.paymentMethod !== undefined ? actionData.paymentMethod : (subscriptionData?.subscriptionHeader?.paymentMethod || '')}
                                  onChange={(e) => setActionData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                >
                                  <option value="">Select payment method...</option>
                                  {availablePaymentTypes.map((paymentType) => (
                                    <option key={paymentType.paymentID || paymentType.id} value={paymentType.paymentID || paymentType.id}>
                                      {paymentType.paymentName || paymentType.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>

                            {/* Reference ID */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Reference ID
                              </label>
                              <input
                                type="text"
                                value={actionData.referenceId || ''}
                                onChange={(e) => setActionData(prev => ({ ...prev, referenceId: e.target.value }))}
                                placeholder="Enter reference ID..."
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                              />
                            </div>
                          </div>

                          {/* Branch - Only show when Branch is selected */}
                          {(actionData.subscriptionType === 2 || (actionData.subscriptionType === undefined && subscriptionData?.subscriptionHeader?.subscriptionType === 2)) && (
                            <div className="mt-6">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Branch *
                              </label>
                              <select
                                value={actionData.branchId !== undefined ? actionData.branchId : (subscriptionData?.subscriptionHeader?.branchId || '')}
                                onChange={(e) => {
                                  const newBranchId = parseInt(e.target.value) || null
                                  setActionData(prev => ({
                                    ...prev,
                                    branchId: newBranchId,
                                    branchName: branches.find(b => b.branchID === newBranchId)?.branchName || ''
                                  }))

                                  // Reload payment methods with new branch
                                  const subscriptionType = actionData.subscriptionType !== undefined ? actionData.subscriptionType : (subscriptionData?.subscriptionHeader?.subscriptionType || 0)
                                  loadPaymentMethods(subscriptionType, newBranchId || 0)
                                }}
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                              >
                                <option value="">Choose a branch...</option>
                                {branches.map((branch) => (
                                  <option key={branch.branchID} value={branch.branchID}>
                                    {branch.branchName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                      </>
                      )}

                      {!actionData.withoutInvoice && (
                      <>
                      {/* Pricing Section */}
                      <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4 space-y-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white">Pricing & Discounts</h4>
                          {loadingPlanPrice && (
                            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-xs">Calculating price...</span>
                            </div>
                          )}
                        </div>



                        {!actionData.withoutInvoice && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Total
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={(() => {
                                // Use actionData.total if set, otherwise use API's planAmount
                                if (actionData.total !== undefined && actionData.total !== '') {
                                  return actionData.total
                                }
                                return planPriceData.planAmount || ''
                              })()}
                              onChange={(e) => {
                                const value = e.target.value
                                console.log('💰 Total input changed by user:', value)
                                // Allow empty string, zero, and valid numbers
                                if (value === '') {
                                  setActionData(prev => ({ ...prev, total: '', _totalAutoUpdated: false }))
                                } else {
                                  const numValue = parseFloat(value)
                                  setActionData(prev => ({ ...prev, total: isNaN(numValue) ? '' : numValue, _totalAutoUpdated: false }))
                                }
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Tax Amount
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={(() => {
                                // Use actionData value if user has set it, otherwise use planPriceData
                                if (actionData.taxAmount !== undefined && actionData.taxAmount !== '') {
                                  return actionData.taxAmount
                                }
                                return planPriceData.taxAmount || ''
                              })()}
                              onChange={(e) => {
                                const value = e.target.value
                                console.log('💰 Tax Amount input changed by user:', value)
                                // Allow empty string, zero, and valid numbers
                                if (value === '') {
                                  setActionData(prev => ({ ...prev, taxAmount: '', _taxAmountAutoUpdated: false }))
                                } else {
                                  const numValue = parseFloat(value)
                                  setActionData(prev => ({ ...prev, taxAmount: isNaN(numValue) ? '' : numValue, _taxAmountAutoUpdated: false }))
                                }
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Discount
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={actionData.manualDiscount !== undefined ? actionData.manualDiscount : ''}
                              onChange={(e) => {
                                const value = e.target.value
                                // Allow empty string, zero, and valid numbers
                                if (value === '') {
                                  setActionData(prev => ({ ...prev, manualDiscount: '' }))
                                } else {
                                  const numValue = parseFloat(value)
                                  setActionData(prev => ({ ...prev, manualDiscount: isNaN(numValue) ? '' : numValue }))
                                }
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Bag Value
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={actionData.bagValue !== undefined ? actionData.bagValue : ''}
                              onChange={(e) => {
                                const value = e.target.value
                                // Allow empty string, zero, and valid numbers
                                if (value === '') {
                                  setActionData(prev => ({ ...prev, bagValue: '' }))
                                } else {
                                  const numValue = parseFloat(value)
                                  setActionData(prev => ({ ...prev, bagValue: isNaN(numValue) ? '' : numValue }))
                                }
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                        )}



                        {/* Plan Summary Section */}
                        {Object.keys(planPriceData).length > 0 && !actionData.withoutInvoice && (
                          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <span className="mr-2">💰</span>
                              Plan Summary
                            </h4>

                            {loadingPlanPrice ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="ml-3 text-gray-600 dark:text-gray-400">Calculating plan price...</span>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* Simple Summary List */}
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan Amount</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                      ${(() => {
                                        // Use user's total input if available, otherwise use API planAmount
                                        if (actionData.total !== undefined && actionData.total !== '') {
                                          return parseFloat(actionData.total).toFixed(2)
                                        }
                                        return (planPriceData.planAmount || 0).toFixed(2)
                                      })()}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Tax ({((planPriceData.taxRate || 0) * 100).toFixed(1)}%)
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                      ${(() => {
                                        // Use user's tax amount input if available, otherwise use API taxAmount
                                        if (actionData.taxAmount !== undefined && actionData.taxAmount !== '') {
                                          return parseFloat(actionData.taxAmount).toFixed(2)
                                        }
                                        return (planPriceData.taxAmount || 0).toFixed(2)
                                      })()}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount</span>
                                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                      -${(actionData.manualDiscount !== undefined && actionData.manualDiscount !== '' ? actionData.manualDiscount : 0).toFixed(2)}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Fees</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                      ${(planPriceData.deliveryFees || 0).toFixed(2)}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bag Value</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                      ${(actionData.bagValue !== undefined && actionData.bagValue !== '' ? actionData.bagValue : 0).toFixed(2)}
                                    </span>
                                  </div>
                                </div>

                                {/* Total Amount */}
                                <div className="mt-4 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center">
                                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount</span>
                                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        ${(() => {
                                          // Use user's total input for planAmount if available, otherwise use API planAmount
                                          const planAmount = (actionData.total !== undefined && actionData.total !== '')
                                            ? parseFloat(actionData.total) || 0
                                            : (planPriceData.planAmount || 0)
                                          // Use user's tax amount input if available, otherwise use API taxAmount
                                          const taxAmount = (actionData.taxAmount !== undefined && actionData.taxAmount !== '')
                                            ? parseFloat(actionData.taxAmount) || 0
                                            : (planPriceData.taxAmount || 0)
                                          const deliveryFees = planPriceData.deliveryFees || 0
                                          const bagValue = actionData.bagValue || 0
                                          const manualDiscount = actionData.manualDiscount || 0
                                          const calculatedTotal = planAmount + taxAmount + deliveryFees + bagValue - manualDiscount
                                          return calculatedTotal.toFixed(2)
                                        })()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      </>
                      )}

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </label>
                        <textarea
                          value={actionData.notes || ''}
                          onChange={(e) => setActionData(prev => ({ ...prev, notes: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter any additional notes..."
                        />
                      </div>

                      {!actionData.withoutInvoice && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Attach Files
                        </label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                          <input
                            type="file"
                            multiple
                            onChange={(e) => setActionData(prev => ({ ...prev, uploadedFiles: Array.from(e.target.files) }))}
                            className="hidden"
                            id="renewFileUpload"
                          />
                          <label htmlFor="renewFileUpload" className="cursor-pointer">
                            <div className="text-gray-500 dark:text-gray-400">
                              <p className="text-sm">Click To Add Attach</p>
                              <p className="text-xs mt-1">Upload invoice or related documents</p>
                            </div>
                          </label>
                          {actionData.uploadedFiles && actionData.uploadedFiles.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-green-600 dark:text-green-400">
                                {actionData.uploadedFiles.length} file(s) selected
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      )}
                    </div>
                  )}

                  {/* Change Meal Types Form */}
                  {selectedAction?.type === 'changeMealType' && (
                    <div className="space-y-6">
                      {console.log('🎯 Change meal types form is rendering!', { selectedAction, changeMealTypesData, actionData })}

                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-4">
                          {/* Show currently selected meal types */}
                          {!loadingChangeMealTypes && actionData.currentlySelectedNames && actionData.currentlySelectedNames.length > 0 && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Currently Selected: {actionData.currentlySelectedNames.join(', ')}
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                ({actionData.currentlySelectedNames.length} of {Object.values(changeMealTypesData).flat().length} available meal types)
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          {loadingChangeMealTypes ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading meal types...</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Meal Category Column */}
                              <div>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 h-48 flex items-center justify-center">
                                  <div className="text-center">
                                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Meal Category</h4>
                                    {Object.keys(changeMealTypesData).map(category => (
                                      <div key={category} className="mb-2">
                                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                                          {category}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Meal Types with Checkboxes Column */}
                              <div>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-2 text-center">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Meal Type</h4>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Select</h4>
                                  </div>

                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {Object.entries(changeMealTypesData).map(([category, mealTypes]) =>
                                      mealTypes.map(mealType => {
                                        const isCurrentlySelected = (actionData.selectedMealTypes || []).includes(mealType.id)
                                        const isSelected = (actionData.selectedMealTypes || []).includes(mealType.id)
                                        return (
                                          <div key={mealType.id} className="grid grid-cols-2 gap-2 items-center">
                                            {/* Meal Type Name */}
                                            <div className={`p-2 rounded-lg border transition-all ${
                                              isCurrentlySelected
                                                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
                                                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                            }`}>
                                              <div className="flex items-center justify-center">
                                                <span className={`text-sm font-medium ${
                                                  isCurrentlySelected
                                                    ? 'text-blue-900 dark:text-blue-100'
                                                    : 'text-gray-900 dark:text-white'
                                                }`}>
                                                  {mealType.name}
                                                </span>
                                                {isCurrentlySelected && (
                                                  <span className="ml-1 text-xs bg-blue-600 text-white px-1 py-0.5 rounded">
                                                    Current
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            {/* Checkbox */}
                                            <div className="flex justify-center">
                                              <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => {
                                                  const currentSelected = actionData.selectedMealTypes || []
                                                  let newSelected
                                                  if (e.target.checked) {
                                                    newSelected = [...currentSelected, mealType.id]
                                                  } else {
                                                    newSelected = currentSelected.filter(id => id !== mealType.id)
                                                  }
                                                  setActionData(prev => ({ ...prev, selectedMealTypes: newSelected }))
                                                }}
                                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                              />
                                            </div>
                                          </div>
                                        )
                                      })
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Selected meal types summary */}
                          {!loadingChangeMealTypes && actionData.selectedMealTypes && actionData.selectedMealTypes.length > 0 && (
                            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                Selected: ({Object.entries(changeMealTypesData).flatMap(([category, mealTypes]) =>
                                  mealTypes.filter(mt => actionData.selectedMealTypes.includes(mt.id)).map(mt => mt.name)
                                ).join('_')})
                              </p>
                            </div>
                          )}

                          {/* Notes */}
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Notes
                            </label>
                            <textarea
                              value={actionData.notes || ''}
                              onChange={(e) => setActionData(prev => ({ ...prev, notes: e.target.value }))}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                              placeholder="Enter any additional notes..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Change Delivery Days Form */}
                  {selectedAction?.type === 'changeDeliveryDays' && (
                    <div className="space-y-6">
                      {console.log('📅 Change delivery days form is rendering!', { selectedAction, changeDeliveryDaysData, actionData })}

                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-4">
                          {/* Show currently selected delivery days */}
                          {!loadingChangeDeliveryDays && actionData.currentlySelectedDeliveryDays && actionData.currentlySelectedDeliveryDays.length > 0 && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Currently Selected: {actionData.currentlySelectedDeliveryDays.join(', ')}
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                ({actionData.currentlySelectedDeliveryDays.length} of {changeDeliveryDaysData.length} available delivery days)
                              </p>
                            </div>
                          )}

                          {loadingChangeDeliveryDays ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading delivery days...</span>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-center">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Day Name</h4>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Select</h4>
                              </div>

                              <div className="space-y-2">
                                {changeDeliveryDaysData.map(day => {
                                  const dayName = day.day_name || day.dayName || day.name || day
                                  const isCurrentlySelected = (actionData.currentlySelectedDeliveryDays || []).includes(dayName)
                                  const isSelected = (actionData.selectedDeliveryDays || []).includes(dayName)
                                  return (
                                    <div key={dayName} className="grid grid-cols-2 gap-2 items-center">
                                      {/* Day Name */}
                                      <div className={`p-2 rounded-lg border transition-all ${
                                        isCurrentlySelected
                                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
                                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                      }`}>
                                        <div className="flex items-center justify-center">
                                          <span className={`text-sm font-medium ${
                                            isCurrentlySelected
                                              ? 'text-blue-900 dark:text-blue-100'
                                              : 'text-gray-900 dark:text-white'
                                          }`}>
                                            {dayName}
                                          </span>
                                          {isCurrentlySelected && (
                                            <span className="ml-1 text-xs bg-blue-600 text-white px-1 py-0.5 rounded">
                                              Current
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Checkbox */}
                                      <div className="flex justify-center">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            const currentSelected = actionData.selectedDeliveryDays || []
                                            let newSelected
                                            if (e.target.checked) {
                                              newSelected = [...currentSelected, dayName]
                                            } else {
                                              newSelected = currentSelected.filter(name => name !== dayName)
                                            }
                                            setActionData(prev => ({ ...prev, selectedDeliveryDays: newSelected }))
                                          }}
                                          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Selected delivery days summary */}
                          {!loadingChangeDeliveryDays && actionData.selectedDeliveryDays && actionData.selectedDeliveryDays.length > 0 && (
                            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                Selected: ({actionData.selectedDeliveryDays.join(', ')})
                              </p>
                            </div>
                          )}

                          {/* Notes */}
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Notes
                            </label>
                            <textarea
                              value={actionData.notes || ''}
                              onChange={(e) => setActionData(prev => ({ ...prev, notes: e.target.value }))}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                              placeholder="Enter any additional notes..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Change Customer Name Form */}
                  {selectedAction?.type === 'changeCustomerName' && (
                    <div className="space-y-6">
                      {console.log('👤 Change customer name form is rendering!', { selectedAction, subscriptionData, actionData })}

                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-4">
                          {/* Show current customer name */}
                          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              Current Name: {subscriptionData?.subscriptionHeader?.customerName || 'Not Available'}
                            </p>
                          </div>

                          {/* New Customer Name Input */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              New Customer Name
                            </label>
                            <input
                              type="text"
                              value={actionData.customerName || ''}
                              onChange={(e) => setActionData(prev => ({ ...prev, customerName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                              placeholder="Enter new customer name..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Change Customer Address Form */}
                  {selectedAction?.type === 'changeAddress' && (
                    <div className="space-y-6">
                      {console.log('🏠 Change customer address form is rendering!', { selectedAction, subscriptionData, actionData, changeCustomerAddressData, areas })}

                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-4">
                          {/* Address Form */}
                          <div className="space-y-4">
                            {/* Form Header */}
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Add New Address
                              </h4>
                              <button
                                type="button"
                                onClick={() => {
                                  setActionData(prev => ({ ...prev, branch: '', area: '', address: '', isDefault: false }))
                                  setAreas([])
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Clear Form
                              </button>
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Branch Selection */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Branch
                                </label>
                                <select
                                  value={actionData.branch || ''}
                                  onChange={(e) => {
                                    const branchId = e.target.value
                                    setActionData(prev => ({
                                      ...prev,
                                      branch: branchId,
                                      area: '' // Clear area when branch changes
                                    }))
                                    // Load areas for the selected branch
                                    if (branchId) {
                                      loadAreasForBranch(branchId)
                                    } else {
                                      setAreas([])
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                  <option value="">Select Branch</option>
                                  {branches.map(branch => (
                                    <option key={branch.branchID} value={branch.branchID}>
                                      {branch.branchName}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Area Selection */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Area
                                </label>
                                <select
                                  value={actionData.area || ''}
                                  onChange={(e) => setActionData(prev => ({ ...prev, area: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                  disabled={!actionData.branch}
                                >
                                  <option value="">
                                    {!actionData.branch ? 'Select Branch First' : 'Select Area'}
                                  </option>
                                  {areas.map(area => (
                                    <option key={area.areaID} value={area.areaID}>
                                      {area.areaName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Address Details */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Address Details
                              </label>
                              <textarea
                                value={actionData.address || ''}
                                onChange={(e) => setActionData(prev => ({ ...prev, address: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter full address details..."
                              />
                            </div>

                            {/* Default Address Checkbox */}
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="defaultAddress"
                                checked={actionData.isDefault || false}
                                onChange={(e) => {
                                  const isChecked = e.target.checked
                                  setActionData(prev => ({ ...prev, isDefault: isChecked }))

                                  // If setting this as default, unset all other addresses
                                  if (isChecked) {
                                    // Update existing addresses to not be default
                                    setChangeCustomerAddressData(prev =>
                                      prev.map(addr => ({ ...addr, isDefault: false, defaultAdress: false }))
                                    )
                                    // Update new addresses to not be default
                                    setNewAddresses(prev =>
                                      prev.map(addr => ({ ...addr, isDefault: false, defaultAdress: false }))
                                    )
                                  }
                                }}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded accent-green-600"
                              />
                              <label htmlFor="defaultAddress" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                Set as default address
                              </label>
                            </div>

                            {/* Add Address Button */}
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={addNewAddress}
                                disabled={!actionData.branch || !actionData.area || !actionData.address?.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                              >
                                Add Address
                              </button>
                            </div>
                          </div>

                          {/* Addresses Management Table */}
                          {(changeCustomerAddressData.length > 0 || newAddresses.length > 0) && (
                            <div className="mt-6">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Manage Addresses</h4>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                  <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Area Name</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Address</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Default</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Edit</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Delete</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {/* Existing Addresses */}
                                    {changeCustomerAddressData.map((address, index) => (
                                      <tr key={`existing_${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{address.areaName || 'Unknown Area'}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{address.adress || address.address || 'No details'}</td>
                                        <td className="px-4 py-2 text-sm">
                                          <div className="flex justify-center">
                                            {(address.isDefault || address.defaultAdress) ? (
                                              <div className="h-5 w-5 bg-green-600 border-2 border-green-600 rounded flex items-center justify-center">
                                                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                              </div>
                                            ) : (
                                              <div className="h-5 w-5 border-2 border-gray-400 rounded bg-transparent"></div>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                          <button
                                            type="button"
                                            onClick={() => editAddress(index, true)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            title="Edit Address"
                                          >
                                            ✏️
                                          </button>
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                          <button
                                            type="button"
                                            onClick={() => deleteAddress(index, true)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            title="Delete Address"
                                          >
                                            🗑️
                                          </button>
                                        </td>
                                      </tr>
                                    ))}

                                    {/* New Addresses */}
                                    {newAddresses.map((address, index) => (
                                      <tr key={`new_${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 bg-blue-50 dark:bg-blue-900/20">
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{address.areaName || 'New Area'}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{address.address}</td>
                                        <td className="px-4 py-2 text-sm">
                                          <div className="flex justify-center">
                                            {(address.isDefault || address.defaultAdress) ? (
                                              <div className="h-5 w-5 bg-green-600 border-2 border-green-600 rounded flex items-center justify-center">
                                                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                              </div>
                                            ) : (
                                              <div className="h-5 w-5 border-2 border-gray-400 rounded bg-transparent"></div>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                          <button
                                            type="button"
                                            onClick={() => editAddress(index, false)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            title="Edit Address"
                                          >
                                            ✏️
                                          </button>
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                          <button
                                            type="button"
                                            onClick={() => deleteAddress(index, false)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            title="Delete Address"
                                          >
                                            🗑️
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Edit Address Dialog */}
                      {showEditAddressDialog && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                  Edit Address
                                </h3>
                                <button
                                  type="button"
                                  onClick={cancelEditAddress}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                  ✕
                                </button>
                              </div>

                              <div className="space-y-4">
                                {/* Address Details */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Address Details
                                  </label>
                                  <textarea
                                    value={editAddressData.address || ''}
                                    onChange={(e) => setEditAddressData(prev => ({ ...prev, address: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter full address details..."
                                  />
                                </div>

                                {/* Default Address Checkbox */}
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="editDefaultAddress"
                                    checked={editAddressData.isDefault || false}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked
                                      setEditAddressData(prev => ({ ...prev, isDefault: isChecked }))

                                      // If setting this as default, unset all other addresses
                                      if (isChecked) {
                                        // Update existing addresses to not be default
                                        setChangeCustomerAddressData(prev =>
                                          prev.map(addr => ({ ...addr, isDefault: false, defaultAdress: false }))
                                        )
                                        // Update new addresses to not be default
                                        setNewAddresses(prev =>
                                          prev.map(addr => ({ ...addr, isDefault: false, defaultAdress: false }))
                                        )
                                      }
                                    }}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded accent-green-600"
                                  />
                                  <label htmlFor="editDefaultAddress" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Set as default address
                                  </label>
                                </div>
                              </div>

                              {/* Dialog Actions */}
                              <div className="flex justify-end gap-3 mt-6">
                                <button
                                  type="button"
                                  onClick={cancelEditAddress}
                                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={updateAddress}
                                  disabled={!editAddressData.address?.trim()}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                  Update Address
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Change Customer Phone Form */}
                  {selectedAction?.type === 'changePhone' && (
                    <div className="space-y-6">
                      {console.log('📞 Change customer phone form is rendering!', { selectedAction, changeCustomerPhoneData, actionData })}

                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-4">
                          {loadingChangeCustomerPhone ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading phone numbers...</span>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Mobile Phone */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Mobile
                                </label>
                                <input
                                  type="text"
                                  value={actionData.mobile || ''}
                                  onChange={(e) => setActionData(prev => ({ ...prev, mobile: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                                  placeholder="Enter mobile number..."
                                />
                              </div>

                              {/* Work Phone */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Work Phone
                                </label>
                                <input
                                  type="text"
                                  value={actionData.workPhone || ''}
                                  onChange={(e) => setActionData(prev => ({ ...prev, workPhone: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                                  placeholder="Enter work phone number..."
                                />
                              </div>

                              {/* Home Phone */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Home Phone
                                </label>
                                <input
                                  type="text"
                                  value={actionData.homePhone || ''}
                                  onChange={(e) => setActionData(prev => ({ ...prev, homePhone: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                                  placeholder="Enter home phone number..."
                                />
                              </div>

                              {/* Other Phone */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Other Phone
                                </label>
                                <input
                                  type="text"
                                  value={actionData.otherPhone || ''}
                                  onChange={(e) => setActionData(prev => ({ ...prev, otherPhone: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                                  placeholder="Enter other phone number..."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Placeholder for other actions */}
                  {selectedAction?.type !== 'extendDays' &&
                   selectedAction?.type !== 'activate' &&
                   selectedAction?.type !== 'hold' &&
                   selectedAction?.type !== 'restrict' &&
                   selectedAction?.type !== 'unrestrict' &&
                   selectedAction?.type !== 'changeStartDate' &&
                   selectedAction?.type !== 'mergeUnmerge' &&
                   selectedAction?.type !== 'renew' &&
                   selectedAction?.type !== 'changeMealType' &&
                   selectedAction?.type !== 'changeDeliveryDays' &&
                   selectedAction?.type !== 'changeCustomerName' &&
                   selectedAction?.type !== 'changePhone' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              Action: {selectedAction?.type}
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              Category: {selectedAction?.category}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dialog Actions */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleActionCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleActionSubmit(actionData)}
                    disabled={actionLoading ||
                      (selectedAction?.type === 'extendDays' && (!actionData.days || actionData.days < 1)) ||
                      (selectedAction?.type === 'activate' && !actionData.activeDate) ||
                      (selectedAction?.type === 'hold' && !actionData.holdDate) ||
                      (selectedAction?.type === 'restrict' && (!actionData.fromDate || !actionData.toDate)) ||
                      (selectedAction?.type === 'unrestrict' && (!actionData.selectedDays || actionData.selectedDays.length === 0)) ||
                      (selectedAction?.type === 'changeStartDate' && !actionData.startDate) ||
                      (selectedAction?.type === 'mergeUnmerge' && selectedRows.length === 0) ||
                      (selectedAction?.type === 'renew' && (!actionData.startDate || !actionData.duration)) ||
                      (selectedAction?.type === 'changeMealType' && (!actionData.selectedMealTypes || actionData.selectedMealTypes.length === 0))
                    }
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                  >
                    {actionLoading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {actionLoading ? 'Processing...' : (selectedAction?.type === 'renew' ? 'Renew' : 'Submit')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Confirm Delete
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 dark:text-gray-300">
                    {deleteConfirmData?.message}
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cancelDeleteDays}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteDays}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Delete {deleteConfirmData?.count} Day{deleteConfirmData?.count > 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Status Dialog */}
        {showChangeStatusDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Change Days Status
                  </h3>
                  <button
                    onClick={cancelChangeStatus}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={statusChangeNotes}
                    onChange={(e) => setStatusChangeNotes(e.target.value)}
                    placeholder="Enter notes for this status change..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={cancelChangeStatus}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitChangeStatus}
                    disabled={!selectedStatus}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Submit {selectedRows.length} Day{selectedRows.length > 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refund Dialog */}
        {showRefundDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Refund Management
                </h3>
                <button
                  onClick={cancelRefund}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {loadingInvoices ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Loading invoices...</p>
                    </div>
                  </div>
                ) : invoicesData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">No invoices found for this subscription.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Invoice Number</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Invoice Serial</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Remaining Days</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Creation Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Last Delivery</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoicesData.map((invoice, index) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-3 px-4 text-gray-900 dark:text-white">{invoice.invoiceNo || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{invoice.invoiceSerial || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{invoice.remaingDays || 0}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                invoice.status === 'Done'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : invoice.status === 'Refund'
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {invoice.status || 'Unknown'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                              {invoice.createOn ? new Date(invoice.createOn).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                              {(() => {
                                if (!invoice.lastDeliveryDay ||
                                    invoice.lastDeliveryDay === 'Not Start Delivery Yet' ||
                                    invoice.lastDeliveryDay === 'Not Started' ||
                                    invoice.lastDeliveryDay === '') {
                                  return 'Not Started'
                                }

                                // Try to parse as date
                                try {
                                  const date = new Date(invoice.lastDeliveryDay)
                                  if (isNaN(date.getTime())) {
                                    return invoice.lastDeliveryDay // Return as-is if not a valid date
                                  }
                                  return date.toLocaleDateString()
                                } catch (error) {
                                  return invoice.lastDeliveryDay // Return as-is if parsing fails
                                }
                              })()}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleInvoiceRefund(invoice)}
                                disabled={invoice.status === 'Refund'}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                  invoice.status === 'Refund'
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                                }`}
                              >
                                {invoice.status === 'Refund' ? 'Refunded' : 'Refund'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={cancelRefund}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Refund Confirmation Dialog */}
        {showRefundConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Refund
                </h3>
                <button
                  onClick={cancelRefundConfirm}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Are you sure you want to process a refund for this invoice?
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Invoice Number:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{refundConfirmData?.invoiceNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Invoice Serial:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{refundConfirmData?.invoiceSerial}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                  <p className="text-sm text-orange-800 dark:text-orange-300">
                    <strong>Warning:</strong> This action cannot be undone. The invoice will be marked as refunded.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={cancelRefundConfirm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRefund}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                >
                  Confirm Refund
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageSubscriptions
