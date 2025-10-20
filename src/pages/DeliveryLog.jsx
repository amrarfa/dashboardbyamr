import React, { useState, useEffect } from 'react'
import { Truck, Download, Search, Calendar } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import apiService from '../services/api'

const DeliveryLog = () => {
  const { success, error: showError } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [deliveryData, setDeliveryData] = useState([])
  const [subscriptionId, setSubscriptionId] = useState('1780')

  const fetchDeliveryLog = async (sid) => {
    if (!sid) return

    try {
      setIsLoading(true)
      console.log('Fetching delivery log for subscription:', sid)

      const response = await fetch(`http://eg.localhost:7167/api/v1/ActionsManager/subscription/${sid}/delivery-log`, {
        headers: {
          'accept': 'application/octet-stream'
        }
      })

      console.log('Delivery log response status:', response.status)

      if (!response.ok) {
        throw new Error(`Failed to fetch delivery log: ${response.status}`)
      }

      // Since it's application/octet-stream, it might be binary data
      // Try to parse as JSON first
      const contentType = response.headers.get('content-type')
      console.log('Content type:', contentType)

      let data
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        // If not JSON, get as text
        const textData = await response.text()
        try {
          data = JSON.parse(textData)
        } catch (parseError) {
          console.log('Response is not JSON, treating as text:', textData)
          data = { raw: textData }
        }
      }

      console.log('Delivery log data:', data)

      // Extract the actual data array from the wrapper object if it exists
      const actualData = data?.data || data
      setDeliveryData(Array.isArray(actualData) ? actualData : [actualData])

    } catch (error) {
      console.error('Error fetching delivery log:', error)
      showError(`Failed to fetch delivery log: ${error.message}`)
      setDeliveryData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDeliveryLog(subscriptionId)
  }, [])

  const handleSearch = () => {
    fetchDeliveryLog(subscriptionId)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Log</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage delivery logs for subscriptions.
          </p>
        </div>
        <button className="mt-4 sm:mt-0 btn-primary">
          <Download className="h-4 w-4 mr-2" />
          Export Log
        </button>
      </div>

      {/* Search/Subscription ID input */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subscription ID
            </label>
            <input
              type="text"
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
              className="input-field"
              placeholder="Enter subscription ID"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Log Data */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Delivery Log for Subscription {subscriptionId}
          </h3>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading delivery log...</p>
            </div>
          ) : deliveryData.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Delivery Data Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No delivery log data available for this subscription.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Display the data */}
              {deliveryData.map((item, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(item).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </dd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* If it's raw data */}
              {deliveryData.length === 1 && deliveryData[0].raw && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Raw Response</h4>
                  <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {deliveryData[0].raw}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeliveryLog