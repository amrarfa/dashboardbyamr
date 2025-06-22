import React, { useState, useEffect } from 'react'
import {
  Search,
  Package,
  Phone,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Pause,
  AlertTriangle,
  CreditCard,
  Settings,
  ChevronDown,
  Star,
  Zap,
  MapPin,
  Clock,
  Target,
  Heart,
  Truck,
  Utensils,
  TrendingUp,
  RefreshCw,
  Download,
  Filter,
  Activity,
  Bell
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import SubscriptionActions from '../components/subscriptions/SubscriptionActions'

const ManageSubscriptions = () => {
  const { success, error: showError, info } = useToast()

  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('sid') // 'sid' or 'phone'
  const [isLoading, setIsLoading] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')

  // Mock data for demonstration
  const quickActions = [
    { id: 'hold', label: 'Hold Subscription', icon: Pause, color: 'orange' },
    { id: 'resume', label: 'Resume Subscription', icon: CheckCircle, color: 'green' },
    { id: 'modify', label: 'Modify Plan', icon: Settings, color: 'blue' },
    { id: 'cancel', label: 'Cancel Subscription', icon: XCircle, color: 'red' },
    { id: 'extend', label: 'Extend Duration', icon: Calendar, color: 'purple' }
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ]

  // Search function
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showError('Please enter a search term')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock subscription data
      const mockData = {
        customer: {
          name: 'Ahmed Mohamed',
          phone: searchQuery,
          sid: searchType === 'sid' ? searchQuery : '200',
          joinDate: '2023-01-15'
        },
        subscription: {
          id: '1050',
          status: 'Active',
          plan: 'Premium Plan',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          address: '123 Main St, Cairo, Egypt',
          driver: 'Mohamed Ali',
          deliveryDays: ['Monday', 'Wednesday', 'Friday'],
          branch: 'Cairo Branch',
          mealTypes: 'Breakfast, Lunch, Dinner',
          createAt: '2024-01-01'
        },
        status: {
          current: 'Active',
          health: 95,
          satisfaction: 4.8,
          remainingDays: 45,
          planExpression: 'Premium Plan - 365 days'
        },
        stats: {
          delivered: 85,
          hold: 5,
          restricted: 2,
          allStatus: 92
        },
        rawData: {
          subscriptionHeader: {
            subscriptionID: '1050',
            customerID: '12345',
            lastDeliveryDay: '2024-01-15'
          },
          plan: {
            name: 'Premium Plan',
            category: 'Premium',
            durations: 365
          }
        }
      }

      setSubscriptionData(mockData)
      success('Subscription data loaded successfully!')
    } catch (err) {
      showError('Failed to load subscription data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
  }

  // Handle subscription update
  const handleSubscriptionUpdate = (updatedData) => {
    setSubscriptionData(prev => ({
      ...prev,
      ...updatedData
    }))
  }

  // Status styling function
  const getStatusStyling = (status) => {
    const statusLower = status?.toLowerCase()
    switch (statusLower) {
      case 'active':
        return {
          bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-700 dark:text-green-300',
          icon: 'text-green-600 dark:text-green-400'
        }
      case 'expired':
        return {
          bg: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-700 dark:text-red-300',
          icon: 'text-red-600 dark:text-red-400'
        }
      case 'hold':
        return {
          bg: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-700 dark:text-orange-300',
          icon: 'text-orange-600 dark:text-orange-400'
        }
      case 'restricted':
        return {
          bg: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          text: 'text-purple-700 dark:text-purple-300',
          icon: 'text-purple-600 dark:text-purple-400'
        }
      case 'packup':
        return {
          bg: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-700 dark:text-blue-300',
          icon: 'text-blue-600 dark:text-blue-400'
        }
      case 'refund':
        return {
          bg: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          text: 'text-gray-700 dark:text-gray-300',
          icon: 'text-gray-600 dark:text-gray-400'
        }
      default:
        return {
          bg: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          text: 'text-gray-700 dark:text-gray-300',
          icon: 'text-gray-600 dark:text-gray-400'
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Manage Subscriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Search and manage customer subscriptions with advanced tools
          </p>
        </div>

        {/* Smart Search Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-2xl p-8">
            <div className="flex flex-col lg:flex-row gap-6 items-end">
              {/* Search Type Toggle */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Search Type
                </label>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
                  <button
                    onClick={() => setSearchType('sid')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      searchType === 'sid'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Package className="h-4 w-4 inline mr-2" />
                    SID
                  </button>
                  <button
                    onClick={() => setSearchType('phone')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      searchType === 'phone'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone
                  </button>
                </div>
              </div>

              {/* Search Input */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {searchType === 'sid' ? 'Subscription ID' : 'Phone Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {searchType === 'sid' ? (
                      <Package className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Phone className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={searchType === 'sid' ? 'Enter SID (e.g., 200)' : 'Enter phone number'}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all"
                  />
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Data Display */}
        {subscriptionData && (
          <div className="space-y-8">
            {/* Customer Hero Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>

                <div className="relative p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                    {/* Customer Info */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                          <User className="h-10 w-10 text-white" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>

                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {subscriptionData.customer?.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{subscriptionData.customer?.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4" />
                            <span>SID: {subscriptionData.customer?.sid}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Since {subscriptionData.customer?.joinDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-2xl backdrop-blur-sm">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {subscriptionData.status?.health}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Health Score</div>
                      </div>
                      <div className="text-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-2xl backdrop-blur-sm">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {subscriptionData.stats?.delivered}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Delivered</div>
                      </div>
                      <div className="text-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-2xl backdrop-blur-sm">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {subscriptionData.status?.remainingDays}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Days Left</div>
                      </div>
                      <div className="text-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          <Star className="h-5 w-5 fill-current" />
                          <span>{subscriptionData.status?.satisfaction}</span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageSubscriptions
