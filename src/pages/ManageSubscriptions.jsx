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
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [subscriptionsList, setSubscriptionsList] = useState([]) // For phone search results
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [selectedView, setSelectedView] = useState('details')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)
  const [isProcessingAction, setIsProcessingAction] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)

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

  // Quick actions
  const quickActions = [
    { id: 'pause', label: 'Pause Subscription', icon: Pause, color: 'orange' },
    { id: 'resume', label: 'Resume Subscription', icon: Play, color: 'green' },
    { id: 'cancel', label: 'Cancel Subscription', icon: X, color: 'red' },
    { id: 'edit', label: 'Edit Details', icon: Edit, color: 'blue' }
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

        if (data && Array.isArray(data) && data.length > 0) {
          console.log('Raw Phone API Response:', data)

          // Transform each subscription in the array
          const transformedSubscriptions = data.map(subscription => {
            const wrappedData = { data: { subscriptionHeader: subscription, subscriptionDetails: [] } }
            return transformApiData(wrappedData)
          }).filter(Boolean) // Remove any null/undefined results

          console.log('Transformed Phone Data:', transformedSubscriptions)

          if (transformedSubscriptions.length > 0) {
            setSubscriptionsList(transformedSubscriptions)
            success(`Found ${transformedSubscriptions.length} subscription(s) for phone: ${query}`)
          } else {
            showError(`No valid subscriptions found for phone: ${query}`)
          }
        } else {
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

  const handleQuickAction = async (actionId) => {
    setIsProcessingAction(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      switch (actionId) {
        case 'pause':
          info('Subscription paused successfully')
          break
        case 'resume':
          success('Subscription resumed successfully')
          break
        case 'cancel':
          showError('Subscription cancelled')
          break
        case 'edit':
          info('Edit mode activated')
          break
        default:
          break
      }
      
      setShowQuickActions(false)
    } catch (error) {
      showError('Action failed')
    } finally {
      setIsProcessingAction(false)
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Clean Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
              Subscription Management
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Search and manage customer subscriptions with powerful tools
          </p>
        </div>

        {/* Modern Search Interface */}
        <div className="mb-20">

          {/* Search Cards Container */}
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">

              {/* Search by SID Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-200">
                {/* Card Header */}
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Search by SID</h3>
                    <p className="text-sm text-gray-500">Find subscription by ID</p>
                  </div>
                </div>

                {/* Search Input with Integrated Button */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Subscription ID..."
                    className="w-full h-12 pl-4 pr-12 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 text-base placeholder-gray-400"
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
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {isLoading && searchType === 'sid' ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Search by Phone Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-200">
                {/* Card Header */}
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Search by Phone</h3>
                    <p className="text-sm text-gray-500">Find subscription by phone number</p>
                  </div>
                </div>

                {/* Search Input with Integrated Button */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Phone Number..."
                    className="w-full h-12 pl-4 pr-12 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 text-base placeholder-gray-400"
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
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {isLoading && searchType === 'phone' ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phone Search Results - Multiple Subscriptions */}
        {subscriptionsList.length > 0 && !subscriptionData && (
          <div className="max-w-7xl mx-auto mt-12 animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Search Results</h2>
              <p className="text-gray-600">Found {subscriptionsList.length} subscription(s) for phone: {searchQuery}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptionsList.map((subscription, index) => (
                <div
                  key={subscription.subscriptionHeader.subscriptionId || index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                  onClick={() => handleSelectSubscription(subscription)}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">SID: {subscription.subscriptionHeader.subscriptionId}</h3>
                        <p className="text-xs text-gray-500">{subscription.subscriptionHeader.planName}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscription.subscriptionHeader.status)}`}>
                      {subscription.subscriptionHeader.status}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{subscription.subscriptionHeader.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{subscription.subscriptionHeader.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{subscription.subscriptionHeader.branchName}</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-semibold text-gray-900">{subscription.subscriptionHeader.duration} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Remaining</p>
                      <p className="text-sm font-semibold text-gray-900">{subscription.subscriptionHeader.remainingDays} days</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    <button className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscription Data Display */}
        {subscriptionData && (
          <div className="max-w-7xl mx-auto mt-12 animate-fadeIn">
            {/* Header with Prominent Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Subscription Details</h2>
                <p className="text-gray-600 mt-2">Complete customer and subscription overview</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

              {/* Customer Overview Card */}
              <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{subscriptionData?.subscriptionHeader?.customerName || 'Unknown Customer'}</h3>
                      <p className="text-sm text-blue-600 font-medium">Customer #{subscriptionData?.subscriptionHeader?.customerId || 'N/A'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscriptionData?.subscriptionHeader?.status || 'Unknown')}`}>
                    {subscriptionData?.subscriptionHeader?.status || 'Unknown'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">{subscriptionData?.subscriptionHeader?.phoneNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Branch</p>
                        <p className="text-sm font-semibold text-gray-900">{subscriptionData?.subscriptionHeader?.branchName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Member Since</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {subscriptionData?.subscriptionHeader?.joinDate ?
                            new Date(subscriptionData.subscriptionHeader.joinDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Driver</p>
                        <p className="text-sm font-semibold text-gray-900">{subscriptionData?.subscriptionHeader?.driverName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {subscriptionData?.subscriptionHeader?.address && subscriptionData.subscriptionHeader.address !== 'N/A' && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Address</p>
                        <p className="text-sm text-gray-700">{subscriptionData.subscriptionHeader.address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Subscription Details Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Subscription</h3>
                    <p className="text-xs text-green-600 font-medium">Plan Details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Subscription ID</p>
                    <p className="text-sm font-bold text-gray-900">{subscriptionData?.subscriptionHeader?.subscriptionId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Plan Name</p>
                    <p className="text-sm font-semibold text-gray-900">{subscriptionData?.subscriptionHeader?.planName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Delivery Days</p>
                    <div className="flex flex-wrap gap-1">
                      {subscriptionData?.subscriptionHeader?.deliveryDays?.length > 0 ?
                        subscriptionData.subscriptionHeader.deliveryDays.map((day, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            {day.substring(0, 3)}
                          </span>
                        )) :
                        <span className="text-xs text-gray-500">No delivery days set</span>
                      }
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Next Delivery</p>
                    <div className="flex items-center gap-2">
                      {subscriptionData?.subscriptionHeader?.nextDelivery === 'Delivery Not Started' ||
                       subscriptionData?.subscriptionHeader?.nextDelivery === 'Not Scheduled' ? (
                        <>
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <p className="text-sm font-semibold text-orange-600">
                            {subscriptionData?.subscriptionHeader?.nextDelivery || 'Not Scheduled'}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <p className="text-sm font-semibold text-gray-900">
                            {subscriptionData?.subscriptionHeader?.nextDelivery || 'Not Scheduled'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration & Progress Card */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Duration</h3>
                    <p className="text-xs text-purple-600 font-medium">Time & Progress</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Total Duration</p>
                    <p className="text-lg font-bold text-gray-900">{subscriptionData?.subscriptionHeader?.duration || 0} <span className="text-sm font-normal text-gray-500">days</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Remaining Days</p>
                    <p className="text-lg font-bold text-purple-600">{subscriptionData?.subscriptionHeader?.remainingDays || 0} <span className="text-sm font-normal text-gray-500">days</span></p>
                  </div>

                  {/* Progress Bar */}
                  {subscriptionData?.subscriptionHeader?.duration > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-gray-500 font-medium">Progress</p>
                        <p className="text-xs text-gray-600 font-semibold">
                          {Math.round(((subscriptionData.subscriptionHeader.duration - subscriptionData.subscriptionHeader.remainingDays) / subscriptionData.subscriptionHeader.duration) * 100)}%
                        </p>
                      </div>
                      <div className="w-full bg-purple-100 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.round(((subscriptionData.subscriptionHeader.duration - subscriptionData.subscriptionHeader.remainingDays) / subscriptionData.subscriptionHeader.duration) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Start Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {subscriptionData?.subscriptionHeader?.startDate ?
                        new Date(subscriptionData.subscriptionHeader.startDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address Card */}
            {subscriptionData?.subscriptionHeader?.deliveryAddress && subscriptionData.subscriptionHeader.deliveryAddress !== 'N/A' && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-1">Delivery Address</h3>
                    <p className="text-sm text-gray-700">{subscriptionData.subscriptionHeader.deliveryAddress}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  <p className="text-sm text-gray-500">Manage subscription settings</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span>Admin Access Required</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    disabled={isProcessingAction}
                    className={`flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      action.color === 'green' ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' :
                      action.color === 'orange' ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200' :
                      action.color === 'red' ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' :
                      'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <action.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tabbed Content Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {viewOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedView(option.id)}
                      className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        selectedView === option.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {selectedView === 'details' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Meal Schedule</h3>
                      <span className="text-sm text-gray-500">
                        {subscriptionData?.subscriptionDetails?.length || 0} meals planned
                      </span>
                    </div>

                    {subscriptionData?.subscriptionDetails?.length > 0 ? (
                      <div className="space-y-3">
                        {subscriptionData.subscriptionDetails.map((meal) => (
                          <div key={meal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-medium text-gray-900">{meal.mealName}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  meal.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                  meal.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {meal.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{meal.mealType}</span>
                                <span>{meal.dayName}</span>
                                <span>{meal.date ? new Date(meal.date).toLocaleDateString() : 'N/A'}</span>
                                {meal.driver && <span>Driver: {meal.driver}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No meal details available</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedView === 'invoices' && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Invoice log feature coming soon</p>
                  </div>
                )}

                {selectedView === 'logs' && (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Customer log feature coming soon</p>
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
