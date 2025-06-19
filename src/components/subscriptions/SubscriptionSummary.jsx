import React from 'react'
import { ArrowLeft, Download, FileText, User, Calendar, MapPin, Phone, Mail, CreditCard } from 'lucide-react'
import { useSubscriptionForm } from '../../contexts/SubscriptionFormContext'

const SubscriptionSummary = ({ onBackToList }) => {
  const { formData } = useSubscriptionForm()

  // Generate PDF export
  const handleExportPDF = () => {
    console.log('📄 Exporting subscription summary as PDF...')
    console.log('📋 Subscription data for PDF:', formData)

    // Create a printable version
    const printContent = document.getElementById('subscription-summary')
    const originalContents = document.body.innerHTML

    if (printContent) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>Subscription Summary - ${formData.customerName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
              .section h3 { margin-top: 0; color: #333; }
              .field { margin-bottom: 10px; }
              .label { font-weight: bold; color: #666; }
              .value { margin-left: 10px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    } else {
      alert('Unable to generate PDF. Please try again.')
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format delivery days
  const formatDeliveryDays = (days) => {
    if (!days || days.length === 0) return 'Not specified'
    return days.map(day => day.day_name || day.name || day).join(', ')
  }

  // Format meal types
  const formatMealTypes = (mealTypes) => {
    if (!mealTypes || mealTypes.length === 0) return 'Not specified'
    return mealTypes.map(meal => meal.mealTypeName || meal.name || meal).join(', ')
  }

  return (
    <div id="subscription-summary" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscription Summary
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Subscription created successfully. Review details below.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportPDF}
            className="btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
          <button
            onClick={onBackToList}
            className="btn-primary flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subscriptions
          </button>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              Subscription Created Successfully
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              The subscription has been saved and is ready for the customer.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Customer Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Information</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
              <p className="text-gray-900 dark:text-white">{formData.customerName || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
              <p className="text-gray-900 dark:text-white flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                {formData.customerPhone || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
              <p className="text-gray-900 dark:text-white flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                {formData.customerEmail || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
              <p className="text-gray-900 dark:text-white flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                {formData.customerAddress || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription Details</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</label>
              <p className="text-gray-900 dark:text-white">{formData.planName || `Plan ID: ${formData.planId}` || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</label>
              <p className="text-gray-900 dark:text-white">{formatDate(formData.startDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</label>
              <p className="text-gray-900 dark:text-white">{formData.duration ? `${formData.duration} days` : 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Days</label>
              <p className="text-gray-900 dark:text-white">{formatDeliveryDays(formData.deliveryDays)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Meal Types</label>
              <p className="text-gray-900 dark:text-white">{formatMealTypes(formData.mealTypes)}</p>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Information</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscription Type</label>
              <p className="text-gray-900 dark:text-white">
                {formData.isSponsor ? (
                  <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Sponsored
                  </span>
                ) : (
                  'Regular'
                )}
              </p>
            </div>
            {!formData.isSponsor && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</label>
                  <p className="text-gray-900 dark:text-white">{formData.paymentMethod || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</label>
                  <p className="text-lg font-semibold text-green-600">{formData.finalTotal ? `${formData.finalTotal.toFixed(0)} USD` : 'Not calculated'}</p>
                </div>
              </>
            )}
            {formData.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                <p className="text-gray-900 dark:text-white">{formData.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Information</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscription Type</label>
              <p className="text-gray-900 dark:text-white">
                {formData.subscriptionType === 0 && 'Web'}
                {formData.subscriptionType === 1 && 'Mobile Application'}
                {formData.subscriptionType === 2 && 'Branch'}
                {formData.subscriptionType === undefined && 'Not specified'}
              </p>
            </div>
            {formData.subscriptionType === 2 && formData.branchId && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Branch</label>
                <p className="text-gray-900 dark:text-white">Branch ID: {formData.branchId}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
              <p className="text-gray-900 dark:text-white">{formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionSummary
