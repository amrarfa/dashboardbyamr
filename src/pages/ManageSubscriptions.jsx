import React, { useState } from 'react'
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
  Info,
  Calendar as CalendarIcon,
  BarChart3,
  X,
  Plus,
  Minus,
  Mail
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { getSubscriptionBySID, searchByPhone } from '../services/manageSubscriptionApi'

const ManageSubscriptions = () => {
  const { success, error: showError, info } = useToast()

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

  // View options for tabs
  const viewOptions = [
    { id: 'details', label: 'Subscription Details', icon: Package },
    { id: 'invoices', label: 'Invoice Log', icon: FileText },
    { id: 'logs', label: 'Customer Log', icon: Activity }
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

  // Group meals by delivery date
  const groupMealsByDate = (subscriptionDetails) => {
    if (!subscriptionDetails) return []

    console.log('🔄 Grouping meals by date. Input data:', subscriptionDetails)

    const grouped = {}
    subscriptionDetails.forEach((meal, index) => {
      console.log(`🍽️ Processing meal ${index}:`, meal)
      console.log(`📅 Date: ${meal.deliveryDate || meal.date}`)

      // Try both mealTypeName and mealType fields
      const mealType = meal.mealTypeName || meal.mealType
      console.log(`🏷️ Meal type: ${mealType} (from ${meal.mealTypeName ? 'mealTypeName' : 'mealType'})`)
      console.log(`🍴 Meal name: ${meal.mealName}`)

      const dateKey = meal.deliveryDate || meal.date
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          dayName: meal.dayName,
          dayNumberCount: meal.dayNumberCount,
          deliveryStatus: meal.deliveryStatus,
          lineState: meal.lineState,
          meals: {}
        }
      }

      // Only add meal if it has a valid meal type
      if (mealType) {
        grouped[dateKey].meals[mealType] = meal
      }
    })

    const result = Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date))
    console.log('📊 Final grouped result:', result)
    return result
  }

  // Transform phone search API data (enhanced with real API fields)
  const transformPhoneSearchData = (subscription) => {
    console.log('Transforming phone search data:', subscription)

    // Handle both direct subscription object and nested subscriptionHeader structure
    const header = subscription.subscriptionHeader || subscription
    const details = subscription.subscriptionDetails || []

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

  // Search handlers
  const handleSearch = async (query, type) => {
    if (!query.trim()) return

    setIsLoading(true)
    // Clear previous results
    setSubscriptionData(null)
    setSubscriptionsList([])
    setSelectedSubscription(null)

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

  // Handle selecting a subscription from phone search results
  const handleSelectSubscription = async (subscription) => {
    setSelectedSubscription(subscription)
    setSubscriptionData(subscription)
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

  // Calculate status counts dynamically from API data
  const statusCounts = React.useMemo(() => {
    if (!subscriptionData?.subscriptionDetails) return {}

    const counts = { all: subscriptionData.subscriptionDetails.length }

    // Group by actual statuses from API
    subscriptionData.subscriptionDetails.forEach(meal => {
      const status = meal.status || 'Unknown'
      counts[status] = (counts[status] || 0) + 1
    })

    return counts
  }, [subscriptionData?.subscriptionDetails])

  // Get unique statuses from API data
  const availableStatuses = React.useMemo(() => {
    if (!subscriptionData?.subscriptionDetails) return []

    const statuses = new Set()
    subscriptionData.subscriptionDetails.forEach(meal => {
      if (meal.status) {
        statuses.add(meal.status)
      }
    })

    return Array.from(statuses).sort()
  }, [subscriptionData?.subscriptionDetails])

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

    return groupedMeals.filter(group => {
      // Check if any meal in the group matches the status filter
      return Object.values(group.meals).some(meal => meal.deliveryStatus === statusFilter)
    })
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
      const allFilteredMealIds = filteredData.map(meal => meal.id) || []
      setSelectedRows(allFilteredMealIds)
    }
    setSelectAll(!selectAll)
  }, [selectAll, filteredData])

  // Update selectAll state when individual rows are selected
  React.useEffect(() => {
    const totalFilteredRows = filteredData.length || 0
    const selectedFilteredCount = selectedRows.filter(id =>
      filteredData.some(meal => meal.id === id)
    ).length
    setSelectAll(selectedFilteredCount > 0 && selectedFilteredCount === totalFilteredRows)
  }, [selectedRows, filteredData])

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
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
                {/* Perfect Status Badge */}
                <div className="flex items-center gap-3">
                  <div className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold shadow-xl border transition-all duration-300 hover:scale-105 ${
                    subscriptionData?.subscriptionHeader?.status === 'Active' ?
                      'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200 shadow-green-100' :
                    subscriptionData?.subscriptionHeader?.status === 'Expired' ?
                      'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-200 shadow-red-100' :
                    subscriptionData?.subscriptionHeader?.status === 'Hold' ?
                      'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-800 border-yellow-200 shadow-yellow-100' :
                    subscriptionData?.subscriptionHeader?.status === 'Restricted' ?
                      'bg-gradient-to-r from-orange-50 to-orange-50 text-orange-800 border-orange-200 shadow-orange-100' :
                    subscriptionData?.subscriptionHeader?.status === 'PackUp' ?
                      'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-800 border-purple-200 shadow-purple-100' :
                    subscriptionData?.subscriptionHeader?.status === 'Refund' ?
                      'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 border-gray-200 shadow-gray-100' :
                      'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 border-gray-200 shadow-gray-100'
                  }`}>

                    {/* Animated Status Indicator */}
                    <div className="relative flex items-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        subscriptionData?.subscriptionHeader?.status === 'Active' ? 'bg-green-500' :
                        subscriptionData?.subscriptionHeader?.status === 'Expired' ? 'bg-red-500' :
                        subscriptionData?.subscriptionHeader?.status === 'Hold' ? 'bg-yellow-500' :
                        subscriptionData?.subscriptionHeader?.status === 'Restricted' ? 'bg-orange-500' :
                        subscriptionData?.subscriptionHeader?.status === 'PackUp' ? 'bg-purple-500' :
                        subscriptionData?.subscriptionHeader?.status === 'Refund' ? 'bg-gray-500' :
                        'bg-gray-400'
                      }`}></div>

                      {/* Pulse animation for Active status */}
                      {subscriptionData?.subscriptionHeader?.status === 'Active' && (
                        <div className="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping opacity-75"></div>
                      )}
                    </div>

                    {/* Status Text */}
                    <span className="text-sm font-bold uppercase tracking-wider">
                      {subscriptionData?.subscriptionHeader?.status || 'Unknown'}
                    </span>

                    {/* Status Icons */}
                    <div className="flex items-center">
                      {subscriptionData?.subscriptionHeader?.status === 'Active' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {subscriptionData?.subscriptionHeader?.status === 'Expired' && (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      {subscriptionData?.subscriptionHeader?.status === 'Hold' && (
                        <Pause className="h-4 w-4 text-yellow-600" />
                      )}
                      {subscriptionData?.subscriptionHeader?.status === 'Restricted' && (
                        <Shield className="h-4 w-4 text-orange-600" />
                      )}
                      {subscriptionData?.subscriptionHeader?.status === 'PackUp' && (
                        <Package className="h-4 w-4 text-purple-600" />
                      )}
                      {subscriptionData?.subscriptionHeader?.status === 'Refund' && (
                        <DollarSign className="h-4 w-4 text-gray-600" />
                      )}
                    </div>

                    {/* Subtle glow effect for active status */}
                    {subscriptionData?.subscriptionHeader?.status === 'Active' && (
                      <div className="absolute inset-0 rounded-2xl bg-green-400 opacity-20 blur-xl -z-10"></div>
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
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Phone</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{subscriptionData?.subscriptionHeader?.phoneNumber || 'N/A'}</p>
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







            {/* Tabbed Content Section */}
            <div className="mt-4 sm:mt-6 lg:mt-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-4 sm:space-x-6 lg:space-x-8 px-3 sm:px-4 lg:px-6 overflow-x-auto">
                  {viewOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedView(option.id)}
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
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Delivery Status Overview</h3>
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
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-blue-900">
                              {selectedRows.length} item{selectedRows.length > 1 ? 's' : ''} selected
                            </span>
                            <button
                              onClick={() => setSelectedRows([])}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Clear selection
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700">
                              Mark as Delivered
                            </button>
                            <button className="px-3 py-1.5 bg-yellow-600 text-white rounded text-sm font-medium hover:bg-yellow-700">
                              Mark as Pending
                            </button>
                            <button className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">
                              Mark as Restricted
                            </button>
                            <button className="px-3 py-1.5 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700">
                              Hold
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
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-8">
                                <input
                                  type="checkbox"
                                  checked={selectAll}
                                  onChange={handleSelectAll}
                                  className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2 focus:ring-offset-0"
                                />
                              </th>
                              <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-8">#</th>
                              <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-12">Actions</th>
                              <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-20">Delivery Date</th>
                              <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-16">Status</th>
                              {/* Dynamic Meal Type Columns */}
                              {uniqueMealTypes.map((mealType) => (
                                <th key={mealType} className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs min-w-[100px] max-w-[120px]">
                                  <div className="truncate" title={mealType}>
                                    {mealType}
                                  </div>
                                </th>
                              ))}
                              <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-10">Day #</th>
                              <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-12">Invoice #</th>
                              <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-12">Line State</th>
                              <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 text-xs w-12">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredGroupedMeals.map((group, index) => {
                              // Get the first meal for row-level data (date, status, etc.)
                              const firstMeal = Object.values(group.meals)[0]
                              const rowId = `group-${group.date}-${index}`

                              return (
                                <tr
                                  key={rowId}
                                  className={`
                                    transition-all duration-200 ease-in-out
                                    ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}
                                    hover:bg-gray-100/70 dark:hover:bg-gray-700/50
                                    ${selectedRows.includes(firstMeal?.id) ? 'bg-blue-50/80 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800' : ''}
                                  `}
                                >
                                  <td className="py-3 px-2 w-8">
                                    <input
                                      type="checkbox"
                                      checked={selectedRows.includes(firstMeal?.id)}
                                      onChange={() => handleRowSelect(firstMeal?.id)}
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
                                  <td className="py-3 px-2 text-center">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border shadow-sm ${
                                      getDeliveryStatusColor(group.deliveryStatus || 'Pending', 'badge')
                                    }`}>
                                      {(group.deliveryStatus || 'Pending').substring(0, 8)}
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
                                  <td className="py-3 px-2 text-center text-xs font-medium text-gray-900 dark:text-gray-100">{group.dayNumberCount || (index + 1)}</td>
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

                {selectedView === 'invoices' && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Invoice log feature coming soon</p>
                  </div>
                )}

                {selectedView === 'logs' && (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Customer log feature coming soon</p>
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
      </div>
    </div>
  )
}

export default ManageSubscriptions
