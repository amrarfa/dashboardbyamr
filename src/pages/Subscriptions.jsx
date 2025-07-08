import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Plus, Eye, Edit, Trash2, Download, Filter, Calendar, CreditCard, User, X, RefreshCw, Pause, Play, Phone, Mail, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import subscriptionApi from '../services/subscriptionApi'
import { useToast } from '../contexts/ToastContext'
import useConfirmDialog from '../hooks/useConfirmDialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const Subscriptions = () => {
  const navigate = useNavigate()
  const { success, error: showError, info } = useToast()
  const dialog = useConfirmDialog()

  // State management
  const [subscriptions, setSubscriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // Filter state
  const [phoneFilter, setPhoneFilter] = useState('')
  const [sidFilter, setSidFilter] = useState('')
  const [oldSidFilter, setOldSidFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Pagination state (matching customer table style)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    sid: true,
    customerName: true,
    subscriptionStatus: true,
    plan: true,
    createDate: true,
    remainingDays: true,
    phone: true,
    // Optional columns (can be toggled)
    oldSid: false,
    updatedDate: false,
    amount: false,
    nextBillingDate: false,
    email: false,
    address: false
  })

  // Statistics state
  const [stats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    hold: 0,
    restricted: 0,
    packUp: 0,
    refund: 0
  })

  // Add a ref to track if we're already loading
  const loadingRef = useRef(false)

  // Load subscriptions
  const loadSubscriptions = useCallback(async (page = currentPage, size = pageSize) => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current) {
      console.log('🚫 Already loading, skipping call')
      return
    }

    console.log('📡 Loading subscriptions - Page:', page, 'Size:', size)
    loadingRef.current = true
    setIsLoading(true)
    try {
      const params = {
        pagenumber: page,
        pagesize: size,
        Phone: phoneFilter,
        Sid: sidFilter,
        oldSid: oldSidFilter,
        from: fromDate,
        to: toDate
      }

      const response = await subscriptionApi.getSubscriptions(params)

      // Debug: Log the API response structure
      console.log('🔍 Full API Response:', response)
      console.log('🔍 Response structure:', {
        type: typeof response,
        hasData: !!response?.data,
        dataType: response?.data ? typeof response.data : 'none',
        isArray: Array.isArray(response?.data),
        itemCount: Array.isArray(response?.data) ? response.data.length : 0,
        totalCount: response?.totalCount,
        totalPages: response?.totalPages,
        currentPage: response?.currentPage,
        // Check for alternative field names
        count: response?.count,
        total: response?.total,
        pages: response?.pages,
        // Check all top-level keys
        allKeys: Object.keys(response || {})
      })

      // CRITICAL DEBUG: Check if response matches expected structure
      console.log('🚨 CRITICAL CHECK:', {
        'response.totalCount exists': !!response?.totalCount,
        'response.totalPages exists': !!response?.totalPages,
        'response.totalCount value': response?.totalCount,
        'response.totalPages value': response?.totalPages,
        'condition result': !!(response?.totalCount && response?.totalPages)
      })

      // Handle different possible response structures
      let subscriptionsData = []
      let totalItemsCount = 0
      let totalPagesCount = 0
      let currentPageNum = page

      if (response) {
        // First extract the data array
        if (response.data && Array.isArray(response.data)) {
          subscriptionsData = response.data
          console.log('🔍 Using response.data array')
        }
        else if (Array.isArray(response)) {
          subscriptionsData = response
          console.log('🔍 Using response as array')
        }
        else {
          console.log('🔍 No valid data array found')
          subscriptionsData = []
        }

        // Extract the data array from response.data
        if (response.data && Array.isArray(response.data)) {
          subscriptionsData = response.data
          console.log('🔍 Using response.data array')
        }
        else if (Array.isArray(response)) {
          subscriptionsData = response
          console.log('🔍 Using response as array')
        }
        else {
          console.log('🔍 No valid data array found')
          subscriptionsData = []
        }

        // The pagination metadata is in the root response
        console.log('🔍 Using response directly for pagination metadata')
        console.log('🔍 response.totalCount:', response?.totalCount)
        console.log('🔍 response.totalPages:', response?.totalPages)

        // PRIORITY 1: Use API pagination metadata from response root
        if (response.totalCount && response.totalPages) {
          console.log('✅ Using API pagination metadata from response (Priority 1)')
          console.log('📊 API Values:', {
            totalCount: response.totalCount,
            totalPages: response.totalPages,
            currentPage: response.currentPage
          })
          totalItemsCount = response.totalCount
          totalPagesCount = response.totalPages
          currentPageNum = response.currentPage || page
        }
        // PRIORITY 2: Check alternative field names
        else if (response.totalItems && response.pages) {
          console.log('✅ Using alternative API pagination fields (Priority 2)')
          totalItemsCount = response.totalItems
          totalPagesCount = response.pages
          currentPageNum = response.currentPage || page
        }
        // PRIORITY 3: Calculate from totalCount if totalPages missing
        else if (response.totalCount && !response.totalPages) {
          console.log('🔧 Calculating totalPages from totalCount (Priority 3)')
          totalItemsCount = response.totalCount
          totalPagesCount = Math.ceil(response.totalCount / pageSize)
          currentPageNum = response.currentPage || page
        }
        // PRIORITY 4: Fallback to data length (single page scenario)
        else if (subscriptionsData.length > 0) {
          console.log('🔧 Fallback: calculating from data length (Priority 4)')
          totalItemsCount = subscriptionsData.length
          totalPagesCount = 1
          currentPageNum = 1
        }
        // PRIORITY 5: No data at all
        else {
          console.log('❌ No data or pagination info available')
          totalItemsCount = 0
          totalPagesCount = 0
          currentPageNum = 1
        }

        console.log('🔍 Parsed values:', {
          subscriptionsCount: subscriptionsData.length,
          totalItemsCount,
          totalPagesCount,
          currentPageNum,
          rawTotalCount: response.totalCount,
          rawTotalPages: response.totalPages,
          rawCurrentPage: response.currentPage,
          rawPageSize: response.pageSize,
          rawHasPreviousPage: response.hasPreviousPage,
          rawHasNextPage: response.hasNextPage,
          usingApiPagination: response.totalCount > 0 && response.totalPages > 0,
          calculatedFromData: totalItemsCount === subscriptionsData.length && subscriptionsData.length > 0
        })
      }

      // Debug: Log the final processed data
      console.log('🔍 Processed data:', {
        subscriptions: subscriptionsData.length,
        totalItems: totalItemsCount,
        totalPages: totalPagesCount,
        currentPage: currentPageNum
      })

      console.log('🔧 Setting state values:', {
        subscriptions: subscriptionsData.length,
        totalItems: totalItemsCount,
        totalPages: totalPagesCount,
        currentPage: currentPageNum
      })

      setSubscriptions(subscriptionsData)
      setTotalItems(totalItemsCount)
      setTotalPages(totalPagesCount)
      // Don't set currentPage here to avoid infinite loop

      // Additional debug log after state is set
      console.log('✅ State updated - totalItems should now be:', totalItemsCount)

      // Force a re-render check
      setTimeout(() => {
        console.log('🔄 State after timeout - totalItems:', totalItems, 'totalPages:', totalPages)
      }, 100)
    } catch (err) {
      console.error('Error loading subscriptions:', err)
      showError('Failed to load subscriptions. Please try again.')
      setSubscriptions([])
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [phoneFilter, sidFilter, oldSidFilter, fromDate, toDate]) // Dependencies for useCallback



  // Single effect to handle all loading scenarios
  useEffect(() => {
    console.log('🔄 Loading subscriptions due to dependency change')
    loadSubscriptions(currentPage, pageSize)
  }, [currentPage, pageSize, phoneFilter, sidFilter, oldSidFilter, fromDate, toDate, loadSubscriptions])

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('📊 State changed - totalItems:', totalItems, 'totalPages:', totalPages, 'currentPage:', currentPage)
  }, [totalItems, totalPages, currentPage])

  // Handle page change (matching customer table style)
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Handle page size change (matching customer table style)
  const handlePageSizeChange = (size) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  // Column management functions
  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  const resetColumns = () => {
    setVisibleColumns({
      sid: true,
      customerName: true,
      subscriptionStatus: true,
      plan: true,
      createDate: true,
      remainingDays: true,
      phone: true,
      oldSid: false,
      updatedDate: false,
      amount: false,
      nextBillingDate: false,
      email: false,
      address: false
    })
  }

  // Available columns configuration
  const availableColumns = [
    { key: 'sid', label: 'SID', required: true },
    { key: 'customerName', label: 'Customer Name', required: true },
    { key: 'subscriptionStatus', label: 'Status', required: true },
    { key: 'plan', label: 'Plan', required: true },
    { key: 'createDate', label: 'Create Date', required: true },
    { key: 'remainingDays', label: 'Remaining Days', required: true },
    { key: 'phone', label: 'Phone', required: true },
    { key: 'oldSid', label: 'Old SID', required: false },
    { key: 'updatedDate', label: 'Updated Date', required: false },
    { key: 'amount', label: 'Amount', required: false },
    { key: 'nextBillingDate', label: 'Next Billing', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'address', label: 'Address', required: false }
  ]

  // Handle export
  const handleExportSubscriptions = async () => {
    setIsExporting(true)
    try {
      info('Preparing subscription export...')

      const params = {
        Phone: phoneFilter,
        Sid: sidFilter,
        oldSid: oldSidFilter,
        from: fromDate,
        to: toDate
      }

      const blob = await subscriptionApi.exportSubscriptions(params)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      success('Subscriptions exported successfully!')
    } catch (err) {
      console.error('Error exporting subscriptions:', err)
      showError('Failed to export subscriptions. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Handle subscription actions
  const handleViewSubscription = (subscription) => {
    // TODO: Implement view subscription modal
    const id = subscription.subscriptionsID || subscription.id
    info(`Viewing subscription ${id}`)
  }

  const handleEditSubscription = (subscription) => {
    const id = subscription.subscriptionsID || subscription.id
    if (id) {
      // Navigate to manage subscription page with the subscription ID as a query parameter
      navigate(`/subscriptions/manage?sid=${id}`)
      info(`Navigating to manage subscription ${id}`)
    } else {
      showError('Subscription ID not found')
    }
  }

  const handleCancelSubscription = (subscription) => {
    const id = subscription.subscriptionsID || subscription.id
    dialog.confirmAction(
      'Cancel Subscription',
      `Are you sure you want to cancel subscription ${id}? This action can be undone.`,
      async () => {
        try {
          await subscriptionApi.cancelSubscription(id)
          success('Subscription cancelled successfully!')
          loadSubscriptions()
        } catch (err) {
          showError('Failed to cancel subscription. Please try again.')
        }
      },
      'warning'
    )
  }

  const handleReactivateSubscription = (subscription) => {
    const id = subscription.subscriptionsID || subscription.id
    dialog.confirmAction(
      'Reactivate Subscription',
      `Are you sure you want to reactivate subscription ${id}?`,
      async () => {
        try {
          await subscriptionApi.reactivateSubscription(id)
          success('Subscription reactivated successfully!')
          loadSubscriptions()
        } catch (err) {
          showError('Failed to reactivate subscription. Please try again.')
        }
      },
      'success'
    )
  }

  const handleDeleteSubscription = (subscription) => {
    const id = subscription.subscriptionsID || subscription.id
    dialog.confirmDelete(
      `Are you sure you want to delete subscription ${id}? This action cannot be undone.`,
      async () => {
        try {
          await subscriptionApi.deleteSubscription(id)
          success('Subscription deleted successfully!')
          loadSubscriptions()
        } catch (err) {
          showError('Failed to delete subscription. Please try again.')
        }
      }
    )
  }

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateRemainingDays = (endDate, subscription = null) => {
    // Try to get end date from multiple possible fields
    let finalEndDate = endDate

    if (!finalEndDate && subscription) {
      finalEndDate = subscription.endDate || subscription.expiryDate || subscription.expireDate || subscription.toDate

      // If still no end date, try to calculate from start date + duration
      if (!finalEndDate && subscription.startDate && subscription.duration) {
        const startDate = new Date(subscription.startDate)
        const durationDays = parseInt(subscription.duration)
        if (!isNaN(durationDays)) {
          finalEndDate = new Date(startDate.getTime() + (durationDays * 24 * 60 * 60 * 1000))
        }
      }
    }

    if (!finalEndDate) return 'N/A'

    const end = new Date(finalEndDate)
    const now = new Date()
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Expired'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day'
    return `${diffDays} days`
  }

  const getRemainingDaysColor = (remainingDays) => {
    if (remainingDays === undefined || remainingDays === null) return 'text-gray-500 dark:text-gray-400'

    const days = Number(remainingDays)
    if (isNaN(days)) return 'text-gray-500 dark:text-gray-400'

    if (days < 0) return 'text-red-600 dark:text-red-400'
    if (days <= 7) return 'text-yellow-600 dark:text-yellow-400'
    if (days <= 30) return 'text-blue-600 dark:text-blue-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'restricted':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'packup':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'refund':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getPlanTypeColor = (planType) => {
    switch (planType?.toLowerCase()) {
      case 'premium':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'basic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'pro':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (isLoading && subscriptions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage customer subscriptions and billing.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
          {/* Column Selection Dropdown */}
          <div className="relative group">
            <button className="btn-secondary flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Columns
            </button>
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Select Columns</h3>
                  <button
                    onClick={resetColumns}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    Reset
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableColumns.map((column) => (
                    <label key={column.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={visibleColumns[column.key]}
                        onChange={() => !column.required && toggleColumn(column.key)}
                        disabled={column.required}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                      />
                      <span className={`ml-2 text-sm ${column.required ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                        {column.label}
                        {column.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportSubscriptions}
            disabled={isExporting}
            className="group relative btn-secondary transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                Export
              </>
            )}
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Export subscription data
            </span>
          </button>

          <button
            onClick={() => navigate('/subscriptions/create')}
            className="group relative btn-primary transition-all duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
            Add Subscription
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Create new subscription
            </span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Play className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expired</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.expired}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Pause className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">On Hold</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.hold}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <X className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Restricted</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.restricted || 0}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <RefreshCw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pack Up</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.packUp || 0}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Refund</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.refund || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Phone Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Filter by phone..."
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                className="pl-10 input-field w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
              {phoneFilter && (
                <button
                  onClick={() => setPhoneFilter('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* SID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SID
            </label>
            <div className="relative group">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Filter by SID..."
                value={sidFilter}
                onChange={(e) => setSidFilter(e.target.value)}
                className="pl-10 input-field w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
              {sidFilter && (
                <button
                  onClick={() => setSidFilter('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Old SID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Old SID
            </label>
            <div className="relative group">
              <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Filter by old SID..."
                value={oldSidFilter}
                onChange={(e) => setOldSidFilter(e.target.value)}
                className="pl-10 input-field w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
              {oldSidFilter && (
                <button
                  onClick={() => setOldSidFilter('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* From Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Date
            </label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="pl-10 input-field w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
              {fromDate && (
                <button
                  onClick={() => setFromDate('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* To Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To Date
            </label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="pl-10 input-field w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
              {toDate && (
                <button
                  onClick={() => setToDate('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Clear All Filters Button */}
        {(phoneFilter || sidFilter || oldSidFilter || fromDate || toDate) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setPhoneFilter('')
                setSidFilter('')
                setOldSidFilter('')
                setFromDate('')
                setToDate('')
              }}
              className="btn-secondary text-sm"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Subscriptions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {visibleColumns.sid && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    SID
                  </th>
                )}
                {visibleColumns.customerName && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer Name
                  </th>
                )}
                {visibleColumns.subscriptionStatus && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                )}
                {visibleColumns.plan && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                )}
                {visibleColumns.createDate && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Create Date
                  </th>
                )}
                {visibleColumns.remainingDays && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Remaining Days
                  </th>
                )}
                {visibleColumns.phone && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Phone
                  </th>
                )}
                {visibleColumns.oldSid && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Old SID
                  </th>
                )}
                {visibleColumns.updatedDate && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Updated Date
                  </th>
                )}
                {visibleColumns.amount && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                )}
                {visibleColumns.nextBillingDate && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Next Billing
                  </th>
                )}
                {visibleColumns.email && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                )}
                {visibleColumns.address && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Address
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                // Loading skeleton
                [...Array(pageSize)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="ml-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-1">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : subscriptions.length > 0 ? (
                // Subscription rows
                subscriptions.map((subscription, index) => (
                  <tr key={subscription.subscriptionsID || subscription.id || subscription.sid || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    {visibleColumns.sid && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {subscription.subscriptionsID || subscription.sid || subscription.SID || subscription.subscriptionId || subscription.id || 'N/A'}
                        </div>
                      </td>
                    )}
                    {visibleColumns.customerName && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {subscription.customerName || 'Unknown Customer'}
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.subscriptionStatus && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.subscriptionStatus || subscription.status)}`}>
                          {subscription.subscriptionStatus || subscription.status || 'Unknown'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.plan && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanTypeColor(subscription.plan)}`}>
                          {subscription.plan || 'Basic'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.createDate && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(subscription.createDate || subscription.createdDate)}
                      </td>
                    )}
                    {visibleColumns.remainingDays && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getRemainingDaysColor(subscription.remaingDays)}`}>
                          {subscription.remaingDays !== undefined ? subscription.remaingDays : 'N/A'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.phone && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {subscription.phone || 'N/A'}
                        </div>
                      </td>
                    )}
                    {visibleColumns.oldSid && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {subscription.oldSid || 'N/A'}
                        </div>
                      </td>
                    )}
                    {visibleColumns.updatedDate && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(subscription.updatedDate)}
                      </td>
                    )}
                    {visibleColumns.amount && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(subscription.amount)}
                      </td>
                    )}
                    {visibleColumns.nextBillingDate && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(subscription.nextBillingDate)}
                      </td>
                    )}
                    {visibleColumns.email && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {subscription.email || 'N/A'}
                        </div>
                      </td>
                    )}
                    {visibleColumns.address && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {subscription.address || 'N/A'}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        {/* View Button */}
                        <button
                          onClick={() => handleViewSubscription(subscription)}
                          className="group relative p-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 hover:scale-105 hover:shadow-md"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            View Details
                          </span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditSubscription(subscription)}
                          className="group relative p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-800/30 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-all duration-200 hover:scale-105 hover:shadow-md"
                          title="Edit Subscription"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Edit Subscription
                          </span>
                        </button>

                        {/* Cancel/Reactivate Button */}
                        {subscription.status?.toLowerCase() === 'active' ? (
                          <button
                            onClick={() => handleCancelSubscription(subscription)}
                            className="group relative p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-800/30 text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-all duration-200 hover:scale-105 hover:shadow-md"
                            title="Cancel Subscription"
                          >
                            <Pause className="h-4 w-4" />
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              Cancel Subscription
                            </span>
                          </button>
                        ) : subscription.status?.toLowerCase() === 'cancelled' ? (
                          <button
                            onClick={() => handleReactivateSubscription(subscription)}
                            className="group relative p-2 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/30 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-all duration-200 hover:scale-105 hover:shadow-md"
                            title="Reactivate Subscription"
                          >
                            <Play className="h-4 w-4" />
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              Reactivate Subscription
                            </span>
                          </button>
                        ) : null}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteSubscription(subscription)}
                          className="group relative p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-800/30 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 hover:shadow-md"
                          title="Delete Subscription"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Delete Subscription
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                // Empty state
                <tr key="empty-state">
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No subscriptions found</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {phoneFilter || sidFilter || oldSidFilter || fromDate || toDate
                          ? 'Try adjusting your filter criteria.'
                          : 'Get started by creating your first subscription.'}
                      </p>
                      <button
                        onClick={() => info('Add subscription feature coming soon!')}
                        className="btn-primary"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subscription
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>



        {/* Pagination - Matching the provided image design */}
        {(totalItems > 0 || subscriptions.length > 0) && (
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {/* Left side - Results info and page size selector */}
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems || subscriptions.length)} of {totalItems || subscriptions.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
                </div>
              </div>

              {/* Right side - Page navigation */}
              <div className="flex items-center space-x-1">
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  Previous
                </button>

                {/* Page numbers */}
                {(() => {
                  const pages = []
                  const maxVisiblePages = 7 // Show more pages like in the image

                  // Always show first page
                  if (totalPages > 0) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className={`min-w-[40px] px-3 py-2 text-sm border rounded ${
                          1 === currentPage
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        1
                      </button>
                    )
                  }

                  // Show ellipsis if needed
                  if (currentPage > 4 && totalPages > 7) {
                    pages.push(
                      <span key="ellipsis-start" className="px-2 text-gray-500">...</span>
                    )
                  }

                  // Show pages around current page
                  let startPage = Math.max(2, currentPage - 2)
                  let endPage = Math.min(totalPages - 1, currentPage + 2)

                  // Adjust range if we're near the beginning or end
                  if (currentPage <= 4) {
                    startPage = 2
                    endPage = Math.min(totalPages - 1, 6)
                  }
                  if (currentPage >= totalPages - 3) {
                    startPage = Math.max(2, totalPages - 5)
                    endPage = totalPages - 1
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`min-w-[40px] px-3 py-2 text-sm border rounded ${
                          i === currentPage
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {i}
                      </button>
                    )
                  }

                  // Show ellipsis if needed
                  if (currentPage < totalPages - 3 && totalPages > 7) {
                    pages.push(
                      <span key="ellipsis-end" className="px-2 text-gray-500">...</span>
                    )
                  }

                  // Always show last page if there's more than one page
                  if (totalPages > 1) {
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className={`min-w-[40px] px-3 py-2 text-sm border rounded ${
                          totalPages === currentPage
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {totalPages}
                      </button>
                    )
                  }

                  return pages
                })()}

                {/* Next button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog {...dialog.dialogProps} />
    </div>
  )
}

export default Subscriptions