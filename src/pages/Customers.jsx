import React, { useState, useEffect } from 'react'
import { Search, Plus, MoreHorizontal, Edit, Trash2, Phone, Mail, MapPin, Eye, Download, Crown, User, X } from 'lucide-react'
import apiService from '../services/api'
import { useToast } from '../contexts/ToastContext'
import CustomerModal from '../components/customers/CustomerModal'
import CustomerDetailsModal from '../components/customers/CustomerDetailsModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const Customers = () => {
  const { success, error: showError, info } = useToast()
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'
  const [isDeleting, setIsDeleting] = useState(false)
  const [categories, setCategories] = useState([])
  const [areas, setAreas] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedArea, setSelectedArea] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)

  useEffect(() => {
    loadCustomers()
    loadCategories()
    loadAreas()
  }, [currentPage, pageSize])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, selectedCategory, selectedArea])

  const loadCustomers = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await apiService.getAllCustomers(currentPage, pageSize)

      // Parse the response if it's a JSON string
      let customersData = response
      if (typeof response === 'string') {
        try {
          customersData = JSON.parse(response)
        } catch (e) {
          console.warn('Could not parse customers data as JSON')
          customersData = { data: [] }
        }
      }

      // Extract the data array and pagination info from the API response
      const customersArray = customersData?.data || customersData

      // Update pagination state
      setTotalPages(customersData?.totalPages || 0)
      setTotalCount(customersData?.totalCount || 0)
      setHasPreviousPage(customersData?.hasPreviousPage || false)
      setHasNextPage(customersData?.hasNextPage || false)

      // Debug logging
      console.log('API Response:', customersData)
      console.log('Customers Array:', customersArray)
      console.log('Pagination Info:', {
        currentPage: customersData?.currentPage,
        totalPages: customersData?.totalPages,
        totalCount: customersData?.totalCount,
        pageSize: customersData?.pageSize
      })

      // Map API fields to component fields
      const mappedCustomers = Array.isArray(customersArray) ? customersArray.map(customer => ({
        ...customer,
        name: customer.customerName || customer.name,
        isActive: customer.status !== undefined ? customer.status : customer.isActive,
        createdDate: customer.regDate || customer.createdDate,
        categoryId: customer.customerCategory || customer.categoryId,
        address: customer.customerAdress?.[0]?.adress || customer.address
      })) : []

      console.log('Mapped Customers:', mappedCustomers)
      setCustomers(mappedCustomers)
    } catch (err) {
      setError('Failed to load customers. Please try again.')
      console.error('Error loading customers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await apiService.getCustomersCategory()
      let categoriesData = response
      if (typeof response === 'string') {
        try {
          categoriesData = JSON.parse(response)
        } catch (e) {
          categoriesData = { data: [] }
        }
      }

      // Extract the data array from the API response
      const categoriesArray = categoriesData?.data || categoriesData
      setCategories(Array.isArray(categoriesArray) ? categoriesArray : [])
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const loadAreas = async () => {
    try {
      const response = await apiService.getAreas()
      let areasData = response
      if (typeof response === 'string') {
        try {
          areasData = JSON.parse(response)
        } catch (e) {
          areasData = { data: [] }
        }
      }

      // Extract the data array from the API response
      const areasArray = areasData?.data || areasData
      setAreas(Array.isArray(areasArray) ? areasArray : [])
    } catch (err) {
      console.error('Error loading areas:', err)
    }
  }

  const filterCustomers = () => {
    let filtered = customers

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(customer => customer.categoryId === parseInt(selectedCategory))
    }

    if (selectedArea) {
      filtered = filtered.filter(customer => customer.areaId === parseInt(selectedArea))
    }

    setFilteredCustomers(filtered)
  }

  const handleCreateCustomer = () => {
    setSelectedCustomer(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setShowDetailsModal(true)
  }



  const handleSaveCustomer = async (customerData) => {
    try {
      await apiService.addEditCustomer(customerData)
      await loadCustomers() // Reload the list
      setShowModal(false)
      // Success message is handled in CustomerModal
    } catch (err) {
      console.error('Error saving customer:', err)
      // Error message is handled in CustomerModal
    }
  }

  const handleDeleteCustomer = (customer) => {
    setCustomerToDelete(customer)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return

    setIsDeleting(true)
    try {
      await apiService.deleteCustomer(customerToDelete.id)
      success('Customer deleted successfully!')
      loadCustomers() // Refresh the list
      setShowDeleteDialog(false)
      setCustomerToDelete(null)
    } catch (err) {
      console.error('Error deleting customer:', err)
      showError('Failed to delete customer. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteDialog(false)
    setCustomerToDelete(null)
    setIsDeleting(false)
  }

  const handleExportCustomers = async () => {
    try {
      info('Preparing customer export...')
      const response = await apiService.exportAllCustomers()
      // Handle the export response (typically a file download)
      success('Customer export completed successfully!')
    } catch (err) {
      console.error('Error exporting customers:', err)
      showError('Failed to export customers. Please try again.')
    }
  }

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(parseInt(newPageSize))
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Loading customers data...
            </p>
          </div>
        </div>
        <div className="card p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage customer information and profiles.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleExportCustomers}
            className="group relative btn-secondary transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Download className="h-4 w-4 mr-2 group-hover:animate-bounce" />
            Export
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Export customer data
            </span>
          </button>
          <button
            onClick={handleCreateCustomer}
            className="group relative btn-primary transition-all duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
            Add Customer
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Create new customer
            </span>
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field w-full"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.categoryName || category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="input-field w-full"
            >
              <option value="">All Areas</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>
                  {area.areaName || area.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              className="input-field w-full"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* Pagination info */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            Page {currentPage} of {totalPages} ({totalCount} total customers)
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="card p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Customers table */}
      {!error && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className={`transition-all duration-200 ${
                      customer.customerType === 1 || customer.customerType === '1'
                        ? 'bg-gradient-to-r from-purple-50 to-amber-50 dark:from-purple-900/20 dark:to-amber-900/20 hover:from-purple-100 hover:to-amber-100 dark:hover:from-purple-800/30 dark:hover:to-amber-800/30 border-l-4 border-l-purple-500 shadow-sm'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getCustomerAvatarColor(customer.customerType)}`}>
                            <span className="font-medium text-sm">
                              {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium ${
                              customer.customerType === 1 || customer.customerType === '1'
                                ? 'text-purple-900 dark:text-purple-100 font-bold'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {customer.name || 'Unknown'}
                              {customer.customerType === 1 || customer.customerType === '1' && (
                                <span className="ml-2 text-amber-600 dark:text-amber-400">★</span>
                              )}
                            </div>
                            <div className={`text-sm ${
                              customer.customerType === 1 || customer.customerType === '1'
                                ? 'text-purple-700 dark:text-purple-300'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              ID: {customer.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className={`flex items-center text-sm ${
                            customer.customerType === 1 || customer.customerType === '1'
                              ? 'text-purple-800 dark:text-purple-200'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            <Phone className={`h-4 w-4 mr-2 ${
                              customer.customerType === 1 || customer.customerType === '1'
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-gray-400'
                            }`} />
                            {customer.phone || 'N/A'}
                          </div>
                          <div className={`flex items-center text-sm ${
                            customer.customerType === 1 || customer.customerType === '1'
                              ? 'text-purple-700 dark:text-purple-300'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            <Mail className={`h-4 w-4 mr-2 ${
                              customer.customerType === 1 || customer.customerType === '1'
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-gray-400'
                            }`} />
                            {customer.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 hover:scale-105 ${getCustomerTypeColor(customer.customerType)} ${
                          customer.customerType === 1 || customer.customerType === '1' ? 'animate-pulse' : ''
                        }`}>
                          {customer.customerType === 1 || customer.customerType === '1' ? (
                            <Crown className="h-3 w-3 mr-1 drop-shadow-sm" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          {getCustomerTypeText(customer.customerType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center text-sm ${
                          customer.customerType === 1 || customer.customerType === '1'
                            ? 'text-purple-700 dark:text-purple-300'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          <MapPin className={`h-4 w-4 mr-2 ${
                            customer.customerType === 1 || customer.customerType === '1'
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-gray-400'
                          }`} />
                          {customer.area || customer.address || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.isActive)}`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(customer.createdDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          {/* View Button */}
                          <button
                            onClick={() => handleViewCustomer(customer)}
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
                            onClick={() => handleEditCustomer(customer)}
                            className="group relative p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-800/30 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-all duration-200 hover:scale-105 hover:shadow-md"
                            title="Edit Customer"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              Edit Customer
                            </span>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteCustomer(customer)}
                            className="group relative p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-800/30 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 hover:shadow-md"
                            title="Delete Customer"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              Delete Customer
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <Phone className="h-12 w-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No customers found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {searchTerm || selectedCategory || selectedArea
                          ? 'No customers match your search criteria.'
                          : 'Get started by adding your first customer.'}
                      </p>
                      <button
                        onClick={handleCreateCustomer}
                        className="btn-primary"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Customer
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-medium">{totalCount}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">Show:</label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                className="input-field py-1 px-2 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Previous button */}
            <button
              onClick={handlePreviousPage}
              disabled={!hasPreviousPage}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {(() => {
                const pages = []
                const maxVisiblePages = 5
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

                // Adjust start page if we're near the end
                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1)
                }

                // Add first page and ellipsis if needed
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      1
                    </button>
                  )

                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis-start" className="px-2 text-gray-500">
                        ...
                      </span>
                    )
                  }
                }

                // Add visible page numbers
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-3 py-2 text-sm border rounded-md ${
                        i === currentPage
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {i}
                    </button>
                  )
                }

                // Add ellipsis and last page if needed
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis-end" className="px-2 text-gray-500">
                        ...
                      </span>
                    )
                  }

                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {totalPages}
                    </button>
                  )
                }

                return pages
              })()}
            </div>

            {/* Next button */}
            <button
              onClick={handleNextPage}
              disabled={!hasNextPage}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showModal && (
        <CustomerModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveCustomer}
          customer={selectedCustomer}
          mode={modalMode}
          categories={categories}
          areas={areas}
        />
      )}

      {/* Customer Details Modal */}
      {showDetailsModal && (
        <CustomerDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          customer={selectedCustomer}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Delete Customer"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default Customers
