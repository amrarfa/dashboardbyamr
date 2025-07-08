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
  Shuffle
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

  // Action Dialog States
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)
  const [actionData, setActionData] = useState({})
  const [actionLoading, setActionLoading] = useState(false)

  // Delete Confirmation Dialog States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmData, setDeleteConfirmData] = useState(null)

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

  // Action Handlers
  const handleActionClick = (actionType, actionCategory) => {
    // Handle refund action specially
    if (actionType === 'refund') {
      handleRefundAction()
      return
    }

    setSelectedAction({ type: actionType, category: actionCategory })
    setShowActionDialog(true)
    setActionData({}) // Reset action data
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
                        onClick={() => handleActionClick('detact', 'days')}
                        className="w-full text-left px-3 py-2 text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Minus className="h-4 w-4" />
                        Remove Days
                      </button>
                      <button
                        onClick={() => handleActionClick('mergeUnmerge', 'days')}
                        className="w-full text-left px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Shuffle className="h-4 w-4" />
                        Merge/Unmerge Days
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
                        onClick={() => handleActionClick('changeDeliveryDay', 'delivery')}
                        className="w-full text-left px-3 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Change Delivery Day
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
                        Change Name
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
                      <button
                        onClick={() => handleActionClick('changeDayStatus', 'global')}
                        className="w-full text-left px-3 py-2 text-sm bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/20 dark:hover:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <ToggleLeft className="h-4 w-4" />
                        Change Day Status
                      </button>
                      <button
                        onClick={() => handleActionClick('deleteDays', 'global')}
                        className="w-full text-left px-3 py-2 text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Days
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
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-h-[70vh] overflow-y-auto ${
              selectedAction?.type === 'unrestrict' ? 'max-w-lg' :
              selectedAction?.type === 'mergeUnmerge' ? 'max-w-4xl' : 'max-w-md'
            }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
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
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedAction?.category === 'status' && 'Modify subscription status'}
                      {selectedAction?.category === 'days' && 'Manage subscription days'}
                      {selectedAction?.category === 'meal' && 'Update meal preferences'}
                      {selectedAction?.category === 'delivery' && 'Adjust delivery settings'}
                      {selectedAction?.category === 'customer' && 'Update customer information'}
                      {selectedAction?.category === 'global' && 'Global subscription changes'}
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
                <div className="space-y-4">
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

                  {/* Placeholder for other actions */}
                  {selectedAction?.type !== 'extendDays' &&
                   selectedAction?.type !== 'activate' &&
                   selectedAction?.type !== 'hold' &&
                   selectedAction?.type !== 'restrict' &&
                   selectedAction?.type !== 'unrestrict' &&
                   selectedAction?.type !== 'changeStartDate' &&
                   selectedAction?.type !== 'mergeUnmerge' && (
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
                      (selectedAction?.type === 'mergeUnmerge' && selectedRows.length === 0)
                    }
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                  >
                    {actionLoading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {actionLoading ? 'Processing...' : 'Submit'}
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
