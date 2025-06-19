import React, { useState, useEffect } from 'react'
import { X, Save, User, Phone, Mail, MapPin, Calendar, Plus, Trash2 } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'

const CustomerModal = ({ isOpen, onClose, onSave, customer, mode, categories, areas }) => {
  const { success, error } = useToast()
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    email: '',
    categoryId: '',
    customerType: 0, // 0 = Customer, 1 = Sponsor
    birthDate: '',
    gender: 'Male',
    weight: '',
    height: '',
    isActive: true,
    notes: '',
    phones: [
      { phoneType: 'Mobile', phone: '' },
      { phoneType: 'Work Phone', phone: '' },
      { phoneType: 'Home Phone', phone: '' },
      { phoneType: 'Other Phone', phone: '' }
    ],
    addresses: [
      { areaId: '', address: '', isDefault: true }
    ]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (customer && mode === 'edit') {
      // Map existing customer data to form structure
      const customerPhones = customer.customerPhon || []
      const customerAddresses = customer.customerAdress || []

      // Debug logging
      console.log('Edit mode - Customer data:', customer)
      console.log('Customer phones:', customerPhones)
      console.log('Customer addresses:', customerAddresses)
      console.log('Customer type from API:', customer.customerType, typeof customer.customerType)

      // Check if phones have IDs
      customerPhones.forEach((phone, index) => {
        console.log(`Phone ${index}:`, phone, 'ID:', phone.id, 'Type:', typeof phone.id)
      })

      setFormData({
        id: customer.id || 0,
        name: customer.customerName || customer.name || '',
        email: customer.email || '',
        categoryId: customer.customerCategory || customer.categoryId || '',
        customerType: (() => {
          // Try different possible field names for customer type
          let typeValue = customer.customerType || customer.type || customer.customerTypeId || customer.typeId

          // Handle string values from API
          if (typeof typeValue === 'string') {
            if (typeValue.toLowerCase() === 'sponsor' || typeValue.toLowerCase() === 'sponser') {
              typeValue = 1
            } else if (typeValue.toLowerCase() === 'customer') {
              typeValue = 0
            } else {
              typeValue = 0 // Default to customer
            }
          }

          // Ensure we always have a valid integer (0 or 1)
          const finalValue = (typeValue === 1 || typeValue === '1') ? 1 : 0

          console.log('Customer type mapping:', {
            original: customer.customerType,
            processed: typeValue,
            final: finalValue
          })

          return finalValue
        })(),
        birthDate: customer.birthDate ? customer.birthDate.split('T')[0] : '',
        gender: customer.gender || 'Male',
        weight: customer.weight || '',
        height: customer.height || '',
        isActive: customer.status !== undefined ? customer.status : (customer.isActive !== undefined ? customer.isActive : true),
        notes: customer.notes || '',
        phones: (() => {
          // Create a map of existing phones by type for easier lookup
          const phoneMap = {}
          customerPhones.forEach(phone => {
            phoneMap[phone.phoneType] = phone
          })

          console.log('Phone mapping:', phoneMap)

          const mappedPhones = [
            {
              id: phoneMap['Mobile']?.id || 0,
              phoneType: 'Mobile',
              phone: phoneMap['Mobile']?.phone || ''
            },
            {
              id: phoneMap['Work Phone']?.id || 0,
              phoneType: 'Work Phone',
              phone: phoneMap['Work Phone']?.phone || ''
            },
            {
              id: phoneMap['Home Phone']?.id || 0,
              phoneType: 'Home Phone',
              phone: phoneMap['Home Phone']?.phone || ''
            },
            {
              id: phoneMap['Other Phone']?.id || 0,
              phoneType: 'Other Phone',
              phone: phoneMap['Other Phone']?.phone || ''
            }
          ]

          console.log('Mapped phones for form:', mappedPhones)
          return mappedPhones
        })(),
        addresses: customerAddresses.length > 0 ? customerAddresses.map(addr => ({
          id: addr.id || 0,
          areaId: addr.areaId || '',
          address: addr.adress || addr.address || '',
          isDefault: addr.defaultAdress || false
        })) : [{ id: 0, areaId: '', address: '', isDefault: true }]
      })
    } else {
      // Reset form for create mode
      setFormData({
        id: 0,
        name: '',
        email: '',
        categoryId: '',
        customerType: 0,
        birthDate: '',
        gender: 'Male',
        weight: '',
        height: '',
        isActive: true,
        notes: '',
        phones: [
          { id: 0, phoneType: 'Mobile', phone: '' },
          { id: 0, phoneType: 'Work Phone', phone: '' },
          { id: 0, phoneType: 'Home Phone', phone: '' },
          { id: 0, phoneType: 'Other Phone', phone: '' }
        ],
        addresses: [
          { id: 0, areaId: '', address: '', isDefault: true }
        ]
      })
    }
    setErrors({})
  }, [customer, mode, isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handlePhoneChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      phones: prev.phones.map((phone, i) =>
        i === index ? { ...phone, phone: value } : phone
      )
    }))
  }

  const handleAddressChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) =>
        i === index ? { ...addr, [field]: value } : addr
      )
    }))
  }

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, { id: 0, areaId: '', address: '', isDefault: false }]
    }))
  }

  const removeAddress = (index) => {
    if (formData.addresses.length > 1) {
      setFormData(prev => ({
        ...prev,
        addresses: prev.addresses.filter((_, i) => i !== index)
      }))
    }
  }

  const setDefaultAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => ({
        ...addr,
        isDefault: i === index
      }))
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    // Validate at least one phone number is provided
    const hasValidPhone = formData.phones.some(phone => phone.phone.trim())
    if (!hasValidPhone) {
      newErrors.phones = 'At least one phone number is required'
    } else {
      // Validate phone number format for non-empty phones
      formData.phones.forEach((phone, index) => {
        if (phone.phone.trim() && !/^\+?[\d\s-()]+$/.test(phone.phone)) {
          newErrors[`phone_${index}`] = 'Please enter a valid phone number'
        }
      })
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Validate at least one address is provided
    const hasValidAddress = formData.addresses.some(addr => addr.address.trim())
    if (!hasValidAddress) {
      newErrors.addresses = 'At least one address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      // Transform form data to match API expected format
      const apiData = {
        id: formData.id || 0,
        customerName: formData.name,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
        email: formData.email || '',
        weight: formData.weight || '',
        height: formData.height || '',
        customerType: (() => {
          // Ensure customerType is always a valid integer (0 or 1)
          let type = formData.customerType

          if (type === null || type === undefined || type === '') {
            type = 0 // Default to Customer
          } else if (typeof type === 'string') {
            if (type.toLowerCase() === 'sponsor' || type.toLowerCase() === 'sponser') {
              type = 1
            } else {
              type = 0
            }
          } else {
            type = parseInt(type)
          }

          // Final validation: must be 0 or 1
          const finalType = (type === 1) ? 1 : 0

          console.log('API customerType:', {
            formValue: formData.customerType,
            processed: type,
            final: finalType
          })

          return finalType
        })(),
        notes: formData.notes || '',
        status: formData.isActive,
        categoryId: parseInt(formData.categoryId) || 0,
        regType: 'Web', // Default registration type
        customerAdresses: formData.addresses.map(addr => ({
          id: addr.id || 0,
          areaId: parseInt(addr.areaId) || 0,
          adress: addr.address,
          defaultAdress: addr.isDefault,
          customerID: formData.id || 0,
          branchID: 0,
          driverID: 0
        })),
        customerPhons: formData.phones
          .filter(phone => phone.phone.trim()) // Only include non-empty phones
          .map(phone => ({
            id: phone.id || 0,
            phone: phone.phone,
            phoneType: phone.phoneType
          }))
      }

      console.log('Sending API data:', apiData)
      await onSave(apiData)

      // Show success message
      success(
        mode === 'create'
          ? 'Customer created successfully!'
          : 'Customer updated successfully!'
      )

      // Close modal after successful save
      onClose()
    } catch (err) {
      console.error('Error saving customer:', err)

      // Show error message
      error(
        mode === 'create'
          ? 'Failed to create customer. Please try again.'
          : 'Failed to update customer. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg mr-3">
                <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {mode === 'create' ? 'Add New Customer' : 'Edit Customer'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {mode === 'create' ? 'Create a new customer profile' : 'Update customer information'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter customer name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Customer Type *
                </label>
                <select
                  value={formData.customerType}
                  onChange={(e) => handleInputChange('customerType', parseInt(e.target.value))}
                  className="input-field"
                >
                  <option value={0}>Customer</option>
                  <option value={1}>Sponsor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="customer@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Category</option>
                  {Array.isArray(categories) && categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName || category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Birth Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="input-field"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="input-field"
                  placeholder="Enter weight"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="input-field"
                  placeholder="Enter height"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.isActive === true}
                      onChange={() => handleInputChange('isActive', true)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.isActive === false}
                      onChange={() => handleInputChange('isActive', false)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Inactive</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Phone Numbers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Phone Numbers *
                </h4>
              </div>
              {errors.phones && (
                <p className="mb-3 text-sm text-red-600 dark:text-red-400">{errors.phones}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.phones.map((phone, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {phone.phoneType}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        value={phone.phone}
                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                        className={`input-field pl-10 ${errors[`phone_${index}`] ? 'border-red-500' : ''}`}
                        placeholder={`Enter ${phone.phoneType.toLowerCase()}`}
                      />
                    </div>
                    {errors[`phone_${index}`] && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`phone_${index}`]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Addresses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Addresses *
                </h4>
                <button
                  type="button"
                  onClick={addAddress}
                  className="btn-secondary text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Address
                </button>
              </div>
              {errors.addresses && (
                <p className="mb-3 text-sm text-red-600 dark:text-red-400">{errors.addresses}</p>
              )}
              <div className="space-y-4">
                {formData.addresses.map((address, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Address {index + 1}
                        </span>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="defaultAddress"
                            checked={address.isDefault}
                            onChange={() => setDefaultAddress(index)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Default</span>
                        </label>
                      </div>
                      {formData.addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAddress(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Area
                        </label>
                        <select
                          value={address.areaId}
                          onChange={(e) => handleAddressChange(index, 'areaId', e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select Area</option>
                          {Array.isArray(areas) && areas.map(area => (
                            <option key={area.id} value={area.id}>
                              {area.areaName || area.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Address Details
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <textarea
                            value={address.address}
                            onChange={(e) => handleAddressChange(index, 'address', e.target.value)}
                            rows={3}
                            className="input-field pl-10"
                            placeholder="Enter full address"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="input-field"
                placeholder="Additional notes about the customer"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    {mode === 'create' ? 'Create Customer' : 'Update Customer'}
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CustomerModal
