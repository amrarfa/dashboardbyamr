// API service for managing subscriptions
const API_BASE_URL = 'http://eg.localhost:7167/api/v1'

// Get subscription by SID using ActionsManager endpoint
export const getSubscriptionBySID = async (sid) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ActionsManager/subscription/${sid}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching subscription by SID:', error)
    throw error
  }
}

// Search subscriptions by SID (alternative endpoint)
export const searchBySID = async (sid) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Subscriptions/SearchBySID?SID=${sid}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error searching by SID:', error)
    throw error
  }
}

// Search subscriptions by phone number (returns list of subscriptions)
export const searchByPhone = async (phone) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ActionsManager/subscription/search-by-phone/${encodeURIComponent(phone)}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error searching by phone:', error)
    throw error
  }
}

// Legacy search by phone (old endpoint)
export const searchByPhoneLegacy = async (phone) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Subscriptions/GetSubscriptionsByPhone?PhoneNumber=${encodeURIComponent(phone)}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error searching by phone (legacy):', error)
    throw error
  }
}

// Get customer log
export const getCustomerLog = async (params) => {
  try {
    const queryParams = new URLSearchParams()
    if (params.subscriptionId) queryParams.append('subscriptionId', params.subscriptionId)
    if (params.customerId) queryParams.append('customerId', params.customerId)
    
    const response = await fetch(`${API_BASE_URL}/Subscriptions/CustomerLog?${queryParams}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return { data: data || [] }
  } catch (error) {
    console.error('Error fetching customer log:', error)
    return { data: [] }
  }
}

// Get delivery log
export const getDeliveryLog = async (params) => {
  try {
    const queryParams = new URLSearchParams()
    if (params.subscriptionId) queryParams.append('subscriptionId', params.subscriptionId)
    if (params.customerId) queryParams.append('customerId', params.customerId)
    
    const response = await fetch(`${API_BASE_URL}/Subscriptions/DeliveryLog?${queryParams}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return { data: data || [] }
  } catch (error) {
    console.error('Error fetching delivery log:', error)
    return { data: [] }
  }
}

// Get subscription invoices
export const getSubscriptionInvoices = async (params) => {
  try {
    const queryParams = new URLSearchParams()
    if (params.subscriptionId) queryParams.append('subscriptionId', params.subscriptionId)
    if (params.customerId) queryParams.append('customerId', params.customerId)
    
    const response = await fetch(`${API_BASE_URL}/Subscriptions/Invoices?${queryParams}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return { data: data || [] }
  } catch (error) {
    console.error('Error fetching subscription invoices:', error)
    return { data: [] }
  }
}

// Get delivery notes
export const getDeliveryNotes = async (params) => {
  try {
    const queryParams = new URLSearchParams()
    if (params.subscriptionId) queryParams.append('subscriptionId', params.subscriptionId)
    if (params.customerId) queryParams.append('customerId', params.customerId)
    
    const response = await fetch(`${API_BASE_URL}/Subscriptions/DeliveryNotes?${queryParams}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return { data: data || [] }
  } catch (error) {
    console.error('Error fetching delivery notes:', error)
    return { data: [] }
  }
}

// Get subscription days
export const getSubscriptionsDays = async (params) => {
  try {
    const queryParams = new URLSearchParams()
    if (params.subscriptionId) queryParams.append('subscriptionId', params.subscriptionId)
    if (params.customerId) queryParams.append('customerId', params.customerId)
    
    const response = await fetch(`${API_BASE_URL}/Subscriptions/Days?${queryParams}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return { data: data || [] }
  } catch (error) {
    console.error('Error fetching subscription days:', error)
    return { data: [] }
  }
}

// Subscription management actions using ActionsManager
export const holdSubscription = async (subscriptionId, reason = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/ActionsManager/subscription/${subscriptionId}/hold`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        reason
      })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error holding subscription:', error)
    throw error
  }
}

export const resumeSubscription = async (subscriptionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ActionsManager/subscription/${subscriptionId}/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId
      })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error resuming subscription:', error)
    throw error
  }
}

export const cancelSubscription = async (subscriptionId, reason = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/ActionsManager/subscription/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        reason
      })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

export const modifySubscription = async (subscriptionId, modifications) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ActionsManager/subscription/${subscriptionId}/modify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        ...modifications
      })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error modifying subscription:', error)
    throw error
  }
}
