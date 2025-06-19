import React, { useState, useEffect } from 'react'
import { Search, Plus, MoreHorizontal, Edit, Trash2, Calendar, DollarSign } from 'lucide-react'
import useStore from '../store/useStore'

const Plans = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { fetchPlans } = useStore()

  useEffect(() => {
    const loadPlans = async () => {
      setIsLoading(true)
      setError('')
      try {
        const plansData = await fetchPlans()
        
        // Parse the response if it's a JSON string
        let parsedPlans = plansData
        if (typeof plansData === 'string') {
          try {
            parsedPlans = JSON.parse(plansData)
          } catch (e) {
            console.warn('Could not parse plans data as JSON')
            parsedPlans = []
          }
        }
        
        setPlans(Array.isArray(parsedPlans) ? parsedPlans : [])
      } catch (err) {
        setError('Failed to load plans. Please try again.')
        console.error('Error loading plans:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadPlans()
  }, [fetchPlans])

  const filteredPlans = plans.filter(plan =>
    plan.planName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.planExprission?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Invalid Date'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plans</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Loading plans data...
            </p>
          </div>
        </div>
        <div className="card p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plans</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage meal plans and their configurations.
          </p>
        </div>
        <button className="mt-4 sm:mt-0 btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </button>
      </div>

      {/* Search and filters */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field w-full sm:w-80"
            />
          </div>
          <div className="flex space-x-2">
            <select className="input-field">
              <option>All Categories</option>
              <option>Weight Loss</option>
              <option>Muscle Gain</option>
              <option>Maintenance</option>
            </select>
            <select className="input-field">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
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

      {/* Plans grid */}
      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <div key={plan.id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {plan.planName || 'Unnamed Plan'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {plan.planExprission || 'No description available'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plan.isActive)}`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Start Date: {formatDate(plan.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>Category: {plan.planCategory || 'N/A'}</span>
                  </div>

                  {plan.planLinesDto && plan.planLinesDto.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{plan.planLinesDto.length}</span> meal lines configured
                    </div>
                  )}

                  {plan.planPriceDto && plan.planPriceDto.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{plan.planPriceDto.length}</span> pricing options
                    </div>
                  )}
                </div>

                <div className="mt-6 flex space-x-2">
                  <button className="flex-1 btn-secondary text-sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="card p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No plans found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm ? 'No plans match your search criteria.' : 'Get started by creating your first meal plan.'}
                </p>
                <button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredPlans.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredPlans.length}</span> of{' '}
            <span className="font-medium">{plans.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button className="btn-secondary">Previous</button>
            <button className="btn-secondary">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Plans
