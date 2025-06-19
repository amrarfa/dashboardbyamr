import apiService from './api'

/**
 * Subscription API service
 * Handles all subscription-related API calls
 */
class SubscriptionApiService {
  /**
   * Get all subscriptions with pagination
   * @param {Object} params - Query parameters
   * @param {number} params.pagenumber - Page number (1-based)
   * @param {number} params.pagesize - Number of items per page
   * @param {string} params.Phone - Filter by phone number
   * @param {string} params.Sid - Filter by SID
   * @param {string} params.oldSid - Filter by old SID
   * @param {string} params.from - Filter from date (YYYY-MM-DD)
   * @param {string} params.to - Filter to date (YYYY-MM-DD)
   * @returns {Promise<Object>} Paginated subscriptions data
   */
  async getSubscriptions(params = {}) {
    const {
      pagenumber = 1,
      pagesize = 25,
      Phone = '',
      Sid = '',
      oldSid = '',
      from = '',
      to = ''
    } = params

    const queryParams = new URLSearchParams({
      pagenumber: pagenumber.toString(),
      pagesize: pagesize.toString(),
      ...(Phone && { Phone }),
      ...(Sid && { Sid }),
      ...(oldSid && { oldSid }),
      ...(from && { from }),
      ...(to && { to })
    })

    try {
      console.log('🔍 Calling subscriptions API with params:', params)
      console.log('🔍 Query string:', queryParams.toString())
      console.log('🔍 Full URL:', `/Subscriptions/GetAllSubscriptions?${queryParams}`)

      const response = await apiService.get(`/Subscriptions/GetAllSubscriptions?${queryParams}`)

      console.log('🔍 Raw API response:', response)
      console.log('🔍 Response.data:', response.data)

      // Return the full response to preserve pagination metadata
      return response
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      throw error
    }
  }

  /**
   * Get subscription by ID
   * @param {number} id - Subscription ID
   * @returns {Promise<Object>} Subscription data
   */
  async getSubscriptionById(id) {
    try {
      const response = await apiService.get(`/Subscriptions/GetSubscription/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching subscription:', error)
      throw error
    }
  }

  /**
   * Create new subscription
   * @param {Object} subscriptionData - Subscription data
   * @returns {Promise<Object>} Created subscription
   */
  async createSubscription(subscriptionData) {
    try {
      const response = await apiService.post('/Subscriptions/CreateSubscription', subscriptionData)
      return response.data
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw error
    }
  }

  /**
   * Update subscription
   * @param {number} id - Subscription ID
   * @param {Object} subscriptionData - Updated subscription data
   * @returns {Promise<Object>} Updated subscription
   */
  async updateSubscription(id, subscriptionData) {
    try {
      const response = await apiService.put(`/Subscriptions/UpdateSubscription/${id}`, subscriptionData)
      return response.data
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw error
    }
  }

  /**
   * Delete subscription
   * @param {number} id - Subscription ID
   * @returns {Promise<void>}
   */
  async deleteSubscription(id) {
    try {
      await apiService.delete(`/Subscriptions/DeleteSubscription/${id}`)
    } catch (error) {
      console.error('Error deleting subscription:', error)
      throw error
    }
  }

  /**
   * Cancel subscription
   * @param {number} id - Subscription ID
   * @returns {Promise<Object>} Updated subscription
   */
  async cancelSubscription(id) {
    try {
      const response = await apiService.post(`/Subscriptions/CancelSubscription/${id}`)
      return response.data
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  /**
   * Reactivate subscription
   * @param {number} id - Subscription ID
   * @returns {Promise<Object>} Updated subscription
   */
  async reactivateSubscription(id) {
    try {
      const response = await apiService.post(`/Subscriptions/ReactivateSubscription/${id}`)
      return response.data
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      throw error
    }
  }



  /**
   * Export subscriptions
   * @param {Object} params - Export parameters
   * @returns {Promise<Blob>} Export file
   */
  async exportSubscriptions(params = {}) {
    try {
      const queryParams = new URLSearchParams(params)
      const response = await apiService.get(`/Subscriptions/ExportSubscriptions?${queryParams}`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error exporting subscriptions:', error)
      throw error
    }
  }
}

export default new SubscriptionApiService()
