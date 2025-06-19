import React, { useState, useEffect } from 'react'
import { X, User, Phone, Mail, MapPin, Calendar, Activity, CreditCard, Crown } from 'lucide-react'
import apiService from '../../services/api'

const CustomerDetailsModal = ({ isOpen, onClose, customer }) => {
  const [customerLog, setCustomerLog] = useState([])
  const [customerAddress, setCustomerAddress] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && customer) {
      loadCustomerDetails()
    }
  }, [isOpen, customer])

  const loadCustomerDetails = async () => {
    setIsLoading(true)
    try {
      // Load customer log and address
      const [logResponse, addressResponse] = await Promise.all([
        apiService.getCustomerLog(customer.id).catch(() => []),
        apiService.getCustomerAddress(customer.id).catch(() => null)
      ])

      // Parse responses
      let logData = logResponse
      if (typeof logResponse === 'string') {
        try {
          logData = JSON.parse(logResponse)
        } catch (e) {
          logData = []
        }
      }

      let addressData = addressResponse
      if (typeof addressResponse === 'string') {
        try {
          addressData = JSON.parse(addressResponse)
        } catch (e) {
          addressData = null
        }
      }

      setCustomerLog(Array.isArray(logData) ? logData : [])
      setCustomerAddress(addressData)
    } catch (error) {
      console.error('Error loading customer details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const getStatusColor = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }

  const getCustomerTypeText = (customerType) => {
    if (customerType === 1 || customerType === '1') return 'Sponsor'
    if (customerType === 0 || customerType === '0') return 'Customer'
    return customerType || 'Customer' // fallback for string values
  }

  const getCustomerTypeColor = (customerType) => {
    if (customerType === 1 || customerType === '1') {
      // Sponsor - Enhanced Purple/Gold theme with stronger contrast
      return 'bg-gradient-to-r from-purple-500 to-amber-400 text-white shadow-md border-2 border-purple-400 dark:from-purple-600 dark:to-amber-500 dark:border-purple-500 font-bold'
    }
    // Customer - Blue theme
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-700'
  }

  const getCustomerAvatarColor = (customerType) => {
    if (customerType === 1 || customerType === '1') {
      // Sponsor - Enhanced Purple/Gold gradient with border
      return 'bg-gradient-to-br from-purple-500 to-amber-400 text-white shadow-lg border-2 border-purple-300 dark:border-purple-400'
    }
    // Customer - Primary blue
    return 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
  }

  if (!isOpen || !customer) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 ${getCustomerAvatarColor(customer.customerType)}`}>
                <span className="font-medium text-lg">
                  {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {customer.name || 'Unknown Customer'}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getCustomerTypeColor(customer.customerType)}`}>
                    {customer.customerType === 1 || customer.customerType === '1' ? (
                      <Crown className="h-3 w-3 mr-1" />
                    ) : (
                      <User className="h-3 w-3 mr-1" />
                    )}
                    {getCustomerTypeText(customer.customerType)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Customer ID: {customer.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <div className="card p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.name || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.phone || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Birth Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(customer.birthDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="h-5 w-5 mr-3 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">♂♀</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.gender || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.isActive)}`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="card p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Address Information
                </h4>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {customer.address || customerAddress?.address || 'No address provided'}
                    </p>
                    {customer.area && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Area: {customer.area}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes Card */}
              {customer.notes && (
                <div className="card p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Notes
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {customer.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="card p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Quick Stats
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Customer Since</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(customer.createdDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {customer.category || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Orders</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {customer.totalOrders || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Last Activity</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(customer.lastActivity)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h4>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : customerLog.length > 0 ? (
                  <div className="space-y-3">
                    {customerLog.slice(0, 5).map((log, index) => (
                      <div key={index} className="border-l-2 border-primary-200 dark:border-primary-800 pl-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.action || 'Activity'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(log.date)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No recent activity found
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDetailsModal
