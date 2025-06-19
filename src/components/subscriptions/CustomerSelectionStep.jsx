import React, { useState, useEffect, useRef } from 'react'
import { Search, Plus, User, Phone, Mail, MapPin, ChevronRight, ChevronLeft, X } from 'lucide-react'
import apiService from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { useSubscriptionForm } from '../../contexts/SubscriptionFormContext'
import CustomerModal from '../customers/CustomerModal'
import ErrorBoundary from '../common/ErrorBoundary'

const CustomerSelectionStep = ({
  errors,
  onNext,
  onPrevious,
  currentStep,
  totalSteps
}) => {
  const { success, error: showError } = useToast()
  const { formData, updateFormData, resetPlanData } = useSubscriptionForm()

  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true) // Track initial load
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isImmediateSearch, setIsImmediateSearch] = useState(false)

  // Customer creation modal state
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Ref to track if initial load has been done (prevents duplicate calls in React Strict Mode)
  const hasInitialLoadedRef = useRef(false)
  const [categories, setCategories] = useState([])
  const [areas, setAreas] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Check if search term is a phone number
  const isPhoneNumber = (term) => {
    // Remove common phone separators and check if it's mostly digits
    const cleanTerm = term.replace(/[\s\-\(\)\+]/g, '')
    return /^\d{8,}$/.test(cleanTerm) // At least 8 digits for phone number
  }

  // Load customers with pagination and search
  const loadCustomers = async (page = 1, search = '', customPageSize = pageSize) => {
    console.log('🔍 loadCustomers called with:', { page, search, pageSize })
    setIsSearching(true)
    try {
      let response

      if (search.trim()) {
        if (isPhoneNumber(search)) {
          // Phone number search - use GetAllCustomers with phone parameter
          console.log('Searching by phone:', search)
          response = await apiService.getAllCustomers(page, customPageSize, search.trim())
        } else {
          // Name search - use getAllCustomers and filter client-side
          console.log('Searching by name:', search)
          response = await apiService.getAllCustomers(page, customPageSize)
          if (response && response.data) {
            // Filter by name on client side
            const filteredCustomers = response.data.filter(customer =>
              customer.customerName?.toLowerCase().includes(search.toLowerCase())
            )
            console.log('📋 Filtered customers by name:', filteredCustomers.length)
            setCustomers(filteredCustomers)
            setTotalItems(filteredCustomers.length)
            setTotalPages(Math.ceil(filteredCustomers.length / pageSize))
            return
          }
        }
      } else {
        // Load all customers with pagination
        console.log('📋 Loading all customers with pagination')
        response = await apiService.getAllCustomers(page, customPageSize)
      }

      console.log('📋 API Response:', response)
      console.log('📋 Response structure:', {
        hasResponse: !!response,
        hasData: !!response?.data,
        dataLength: response?.data?.length,
        totalItems: response?.totalItems,
        totalPages: response?.totalPages
      })

      // Handle API response
      if (response && response.data) {
        console.log('✅ Setting customers:', response.data.length, 'customers')
        console.log('📋 First customer sample:', response.data[0])

        // Set state in the correct order
        setIsInitialLoading(false) // Set this first
        setIsSearching(false)
        setCustomers(response.data)
        setTotalItems(response.totalItems || response.data.length)
        setTotalPages(response.totalPages || Math.ceil((response.totalItems || response.data.length) / pageSize))

        // Debug state after setting
        setTimeout(() => {
          console.log('🔍 State after setting customers:', {
            customersLength: response.data.length,
            totalItems: response.totalItems || response.data.length,
            isSearching: false,
            isInitialLoading: false
          })
        }, 100)
      } else {
        console.log('❌ No data in response, setting empty arrays')
        setIsInitialLoading(false) // Set this first
        setIsSearching(false)
        setCustomers([])
        setTotalItems(0)
        setTotalPages(0)
      }
    } catch (err) {
      console.error('❌ Error loading customers:', err)
      showError('Failed to load customers')
      setCustomers([])
      setTotalItems(0)
      setTotalPages(0)
    } finally {
      console.log('🔄 Finally block - loading states should already be set')
      // Loading states are already set in the try block above
    }
  }

  // Load supporting data for customer creation
  const loadSupportingData = async () => {
    setIsLoadingData(true)
    try {
      const [categoriesResponse, areasResponse] = await Promise.all([
        apiService.getCustomersCategory().catch(err => {
          console.warn('Failed to load categories:', err)
          return []
        }),
        apiService.getAreas().catch(err => {
          console.warn('Failed to load areas:', err)
          return []
        })
      ])

      console.log('Raw categories response:', categoriesResponse)
      console.log('Raw areas response:', areasResponse)

      // Parse categories response (handle JSON string or nested data)
      let categoriesData = categoriesResponse
      if (typeof categoriesResponse === 'string') {
        try {
          categoriesData = JSON.parse(categoriesResponse)
        } catch (e) {
          console.warn('Could not parse categories as JSON')
          categoriesData = { data: [] }
        }
      }

      // Parse areas response (handle JSON string or nested data)
      let areasData = areasResponse
      if (typeof areasResponse === 'string') {
        try {
          areasData = JSON.parse(areasResponse)
        } catch (e) {
          console.warn('Could not parse areas as JSON')
          areasData = { data: [] }
        }
      }

      // Extract the data array from the API response
      const categoriesArray = categoriesData?.data || categoriesData
      const areasArray = areasData?.data || areasData

      console.log('Processed categories:', categoriesArray)
      console.log('Processed areas:', areasArray)

      setCategories(Array.isArray(categoriesArray) ? categoriesArray : [])
      setAreas(Array.isArray(areasArray) ? areasArray : [])

      console.log('Final categories count:', Array.isArray(categoriesArray) ? categoriesArray.length : 0)
      console.log('Final areas count:', Array.isArray(areasArray) ? areasArray.length : 0)
    } catch (err) {
      console.error('Error loading supporting data:', err)
      // Set empty arrays as fallback
      setCategories([])
      setAreas([])
    } finally {
      setIsLoadingData(false)
    }
  }

  // Initial load - prevent duplicate calls in React Strict Mode
  useEffect(() => {
    console.log('🚀 CustomerSelectionStep mounted - checking if data needs loading')
    console.log('🚀 Initial state:', {
      hasInitialLoaded: hasInitialLoadedRef.current,
      isInitialLoading,
      customersLength: customers.length
    })

    // Only load if we haven't done initial load yet
    if (!hasInitialLoadedRef.current) {
      console.log('🚀 First time loading, loading initial data')
      hasInitialLoadedRef.current = true
      loadCustomers(1, '')
      loadSupportingData()
    } else {
      console.log('🚀 Initial load already done, skipping (React Strict Mode duplicate)')
    }
  }, [])

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Use current search term and page size for pagination
    loadCustomers(page, searchTerm, pageSize)
  }

  // Handle Enter key press in search input - ONLY search trigger
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      console.log('Enter key pressed - searching for:', searchTerm)
      setIsImmediateSearch(true)
      setCurrentPage(1)

      // Trigger search (works with empty search term too)
      loadCustomers(1, searchTerm).finally(() => {
        setIsImmediateSearch(false)
      })
    }
  }

  // Handle clear search
  const handleClearSearch = () => {
    console.log('🧹 Clearing search and reloading customers')
    setSearchTerm('')
    setCurrentPage(1)
    setIsInitialLoading(false) // Ensure we don't show loading state
    setIsSearching(false)
    loadCustomers(1, '')
  }

  // Reset plan data function
  const resetSubscriptionPlanData = () => {
    console.log('🔄 CustomerSelectionStep: Resetting plan data due to customer change')
    resetPlanData()
    success('Plan data reset for new customer')
  }

  // Select customer
  const selectCustomer = (customer) => {
    // Check if this is a different customer
    const isDifferentCustomer = formData.customerId && formData.customerId !== customer.id
    const isFirstCustomerSelection = !formData.customerId

    console.log('🎯 Customer Selection:', {
      currentCustomerId: formData.customerId,
      newCustomerId: customer.id,
      isDifferentCustomer,
      isFirstCustomerSelection
    })

    // Extract primary phone - handle different API response formats
    let primaryPhone = ''

    if (customer.customerPhons && customer.customerPhons.length > 0) {
      // Try to find Mobile phone first
      const mobilePhone = customer.customerPhons.find(p => p.phoneType === 'Mobile' || p.PhoneType === 'Mobile')
      if (mobilePhone) {
        primaryPhone = mobilePhone.phone || mobilePhone.Phone || mobilePhone.phoneNumber || mobilePhone.PhoneNumber || ''
      } else {
        // Use first available phone
        const firstPhone = customer.customerPhons.find(p => {
          const phone = p.phone || p.Phone || p.phoneNumber || p.PhoneNumber
          return phone && phone.trim()
        })
        if (firstPhone) {
          primaryPhone = firstPhone.phone || firstPhone.Phone || firstPhone.phoneNumber || firstPhone.PhoneNumber || ''
        }
      }
    }
    // Fallback: check if phone is directly on customer object
    else if (customer.phone) {
      primaryPhone = customer.phone
    }
    // Fallback: check for Phone property
    else if (customer.Phone) {
      primaryPhone = customer.Phone
    }

    // Extract primary address
    const primaryAddress = customer.customerAdresses?.find(a => a.defaultAdress)?.adress ||
                          customer.customerAdresses?.[0]?.adress || ''

    // Reset plan data if selecting a different customer
    if (isDifferentCustomer) {
      resetSubscriptionPlanData()
    }

    // Update customer data
    const customerUpdate = {
      customerId: customer.id,
      customerName: customer.customerName || customer.name,
      customerPhone: primaryPhone,
      customerEmail: customer.email || '',
      customerAddress: primaryAddress
    }

    console.log('🔄 CustomerSelectionStep: Updating form data with:', customerUpdate)
    updateFormData(customerUpdate)

    console.log('✅ Customer selected:', customer.customerName || customer.name)
  }

  // Handle customer creation from modal
  const handleSaveCustomer = async (customerData) => {
    try {
      const response = await apiService.addEditCustomer(customerData)

      // Create customer object for selection
      const newCustomer = {
        id: response.id || Date.now(),
        customerName: customerData.customerName,
        email: customerData.email,
        customerPhons: customerData.customerPhons || [],
        customerAdresses: customerData.customerAdresses || []
      }

      // Select the newly created customer
      selectCustomer(newCustomer)

      // Close modal and show success
      setShowCreateModal(false)
      success('Customer created and selected successfully!')

      // Refresh customer list
      loadCustomers(currentPage, searchTerm)
    } catch (err) {
      console.error('Error creating customer:', err)
      throw err // Let CustomerModal handle the error display
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Select Customer
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Search for an existing customer or create a new one
        </p>
      </div>

      {/* Selected Customer Display */}
      {formData.customerId && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
                  Selected Customer
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {formData.customerName}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                console.log('🔄 Change customer button clicked - resetting plan data')
                resetSubscriptionPlanData()
                updateFormData({
                  customerId: null,
                  customerName: '',
                  customerPhone: '',
                  customerEmail: '',
                  customerAddress: ''
                })
                // Reset loading states to show customer list immediately
                setIsInitialLoading(false)
                setIsSearching(false)
                // If no customers are loaded, reload them
                if (customers.length === 0) {
                  console.log('🔄 No customers loaded, reloading...')
                  loadCustomers(1, '')
                }
              }}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 text-sm"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Customer Search */}
      {!formData.customerId && (
        <div className="space-y-4">
          {/* Debug info - console only */}
          {console.log('🎯 Render conditions:', {
            customersLength: customers.length,
            isSearching,
            isInitialLoading,
            searchTerm,
            totalItems,
            showCustomers: customers.length > 0,
            showInitialLoading: isInitialLoading && customers.length === 0,
            showNoResults: !searchTerm && customers.length === 0 && !isSearching && !isInitialLoading
          })}
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={
                isPhoneNumber(searchTerm)
                  ? "Type phone number and press Enter to search..."
                  : "Type customer name and press Enter to search..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="pl-10 pr-32 input-field w-full"
            />

            {/* Clear search button */}
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {/* Search type indicator and Enter key hint */}
            {searchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {/* Search type badge */}
                {isPhoneNumber(searchTerm) ? (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    <Phone className="h-3 w-3 mr-1" />
                    Phone
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <User className="h-3 w-3 mr-1" />
                    Name
                  </span>
                )}

                {/* Enter key hint */}
                {searchTerm.trim() && !isSearching && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                    ⏎ Enter
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Searching...
              </p>
              <p className="mt-1 text-xs text-primary-600 dark:text-primary-400">
                ⚡ Enter key pressed
              </p>
            </div>
          )}

          {customers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {searchTerm ? (
                    <span className="flex items-center space-x-2">
                      <span>
                        {isPhoneNumber(searchTerm) ? 'Phone Search' : 'Name Search'} Results ({totalItems})
                      </span>
                      {isPhoneNumber(searchTerm) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          <Phone className="h-3 w-3 mr-1" />
                          {searchTerm}
                        </span>
                      )}
                    </span>
                  ) : (
                    `All Customers (${totalItems})`
                  )}
                </h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-secondary text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {customers.map((customer) => {
                  // Extract phone numbers - handle different API response formats
                  let phoneDisplay = 'No phone'
                  let phoneCount = 0

                  // Check if customerPhons exists and has data
                  if (customer.customerPhons && customer.customerPhons.length > 0) {
                    // Filter out empty phones and extract phone numbers
                    const validPhones = customer.customerPhons
                      .map(p => p.phone || p.Phone || p.phoneNumber || p.PhoneNumber)
                      .filter(phone => phone && phone.trim())

                    if (validPhones.length > 0) {
                      phoneCount = validPhones.length
                      if (validPhones.length === 1) {
                        phoneDisplay = validPhones[0]
                      } else {
                        // Show all phone numbers joined with " - "
                        phoneDisplay = validPhones.join(' - ')
                      }
                    }
                  }
                  // Fallback: check if phone is directly on customer object
                  else if (customer.phone) {
                    phoneDisplay = customer.phone
                    phoneCount = 1
                  }
                  // Fallback: check for Phone property
                  else if (customer.Phone) {
                    phoneDisplay = customer.Phone
                    phoneCount = 1
                  }

                  // Extract primary address
                  const primaryAddress = customer.customerAdresses?.find(a => a.defaultAdress)?.adress ||
                                        customer.customerAdresses?.[0]?.adress || 'No address'

                  return (
                    <div
                      key={customer.id}
                      onClick={() => selectCustomer(customer)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {customer.customerName || customer.name}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate" title={phoneDisplay}>
                                  {phoneDisplay}
                                </span>
                              </div>
                              {customer.email && (
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate" title={customer.email}>
                                    {customer.email}
                                  </span>
                                </div>
                              )}
                            </div>
                            {primaryAddress !== 'No address' && (
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate" title={primaryAddress}>
                                  {primaryAddress}
                                </span>
                              </div>
                            )}
                            {/* Show phone count if multiple */}
                            {phoneCount > 1 && (
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                  {phoneCount} phone numbers
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Left side - Results info and page size selector */}
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          const newPageSize = parseInt(e.target.value)
                          setPageSize(newPageSize)
                          setCurrentPage(1) // Reset to first page
                          loadCustomers(1, searchTerm, newPageSize)
                        }}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-500 dark:text-gray-400">per page</span>
                    </div>
                  </div>

                  {/* Right side - Navigation */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {/* First page if not in visible range */}
                      {currentPage > 3 && totalPages > 5 && (
                        <>
                          <button
                            onClick={() => handlePageChange(1)}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          >
                            1
                          </button>
                          {currentPage > 4 && (
                            <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                          )}
                        </>
                      )}

                      {/* Main page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 text-sm border rounded ${
                              pageNum === currentPage
                                ? 'bg-primary-600 border-primary-600 text-white'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}

                      {/* Last page if not in visible range */}
                      {currentPage < totalPages - 2 && totalPages > 5 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>

                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No results after search */}
          {searchTerm && customers.length === 0 && !isSearching && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                No customers found matching "{searchTerm}"
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                Press Enter to search or try a different term
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleClearSearch}
                  className="btn-secondary text-sm"
                >
                  Clear Search
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Customer
                </button>
              </div>
            </div>
          )}

          {/* Initial Loading State */}
          {isInitialLoading && customers.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Loading customers...
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Please wait while we fetch customer data
              </p>
            </div>
          )}

          {/* Initial State - Type and press Enter to search */}
          {!searchTerm && customers.length === 0 && !isSearching && !isInitialLoading && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                No customers found
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                Type customer name or phone number and press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> to search
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Customer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Customer Creation Modal */}
      {showCreateModal && !isLoadingData && (
        <ErrorBoundary onClose={() => setShowCreateModal(false)}>
          <CustomerModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSave={handleSaveCustomer}
            customer={null}
            mode="create"
            categories={categories || []}
            areas={areas || []}
          />
        </ErrorBoundary>
      )}

      {/* Loading Modal */}
      {showCreateModal && isLoadingData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Loading Customer Form
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please wait while we load the form data...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
          onClick={() => {
            console.log('🚀 CustomerSelectionStep: Next button clicked')
            console.log('🔍 Current form data before navigation:', formData)
            console.log('🔍 Customer ID:', formData.customerId)
            console.log('🔍 Customer Name:', formData.customerName)
            onNext()
          }}
          disabled={!formData.customerId}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Subscription Details
          <ChevronRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  )
}

export default CustomerSelectionStep
