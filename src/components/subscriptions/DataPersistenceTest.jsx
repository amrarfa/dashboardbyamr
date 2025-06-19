import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useSubscriptionForm } from '../../contexts/SubscriptionFormContext'

const DataPersistenceTest = () => {
  // Use context instead of props
  const { formData } = useSubscriptionForm()
  const [testResults, setTestResults] = useState({
    planCategoryId: false,
    planId: false,
    startDate: false,
    duration: false,
    deliveryDays: false,
    mealTypes: false,
    dislikeCategories: false
  })

  const [isTestingPersistence, setIsTestingPersistence] = useState(false)

  // Test data persistence by checking if formData contains expected values
  useEffect(() => {
    const runPersistenceTest = () => {
      // More lenient checks for planId - accept any truthy value including string numbers
      const planIdExists = formData?.planId && formData?.planId !== '' && formData?.planId !== null && formData?.planId !== undefined
      const mealTypesExist = Array.isArray(formData?.mealTypes) && formData.mealTypes.length > 0

      const results = {
        planCategoryId: !!formData?.planCategoryId,
        planId: planIdExists,
        startDate: !!formData?.startDate,
        duration: !!(formData?.duration || formData?.duration === 0), // Handle 0 as valid duration
        deliveryDays: Array.isArray(formData?.deliveryDays) && formData.deliveryDays.length > 0,
        mealTypes: mealTypesExist,
        dislikeCategories: Array.isArray(formData?.dislikeCategories)
      }

      // Debug logging
      console.log('Persistence Test Debug:', {
        formData,
        planId: formData?.planId,
        planIdType: typeof formData?.planId,
        planIdExists,
        mealTypes: formData?.mealTypes,
        mealTypesLength: formData?.mealTypes?.length,
        mealTypesExist,
        results
      })

      setTestResults(results)
    }

    // Add a small delay to ensure data has been processed
    const timeoutId = setTimeout(runPersistenceTest, 100)
    return () => clearTimeout(timeoutId)
  }, [formData])

  const testPersistence = () => {
    setIsTestingPersistence(true)

    // Check localStorage as well
    const savedDraft = localStorage.getItem('subscriptionDraft')
    let localStorageData = null
    if (savedDraft) {
      try {
        localStorageData = JSON.parse(savedDraft)
      } catch (e) {
        console.error('Failed to parse localStorage data:', e)
      }
    }

    // Simulate navigation test
    setTimeout(() => {
      const persistenceScore = Object.values(testResults).filter(Boolean).length
      const totalTests = Object.keys(testResults).length

      console.log('Data Persistence Test Results:', {
        formData,
        localStorageData,
        testResults,
        score: `${persistenceScore}/${totalTests}`,
        passed: persistenceScore >= 3 // At least 3 fields should be persisted
      })

      setIsTestingPersistence(false)
    }, 1000)
  }

  const getTestIcon = (passed) => {
    if (passed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <AlertCircle className="h-4 w-4 text-red-500" />
  }

  const persistenceScore = Object.values(testResults).filter(Boolean).length
  const totalTests = Object.keys(testResults).length
  const overallPassed = persistenceScore >= 3

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Data Persistence Test
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time monitoring of form data persistence
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={testPersistence}
            disabled={isTestingPersistence}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isTestingPersistence ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Persistence
              </>
            )}
          </button>
          <button
            onClick={() => {
              console.log('=== PLAN ID DEBUG ===')
              console.log('formData.planId:', formData?.planId)
              console.log('formData.planId type:', typeof formData?.planId)
              console.log('formData.planId truthy:', !!formData?.planId)
              console.log('Full formData:', formData)
              console.log('localStorage:', localStorage.getItem('subscriptionDraft'))
            }}
            className="flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Debug Plan ID
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Score: {persistenceScore}/{totalTests}
          </span>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            overallPassed
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {overallPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {Object.entries(testResults).map(([field, passed]) => (
            <div key={field} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-gray-700 dark:text-gray-300 capitalize">
                {field.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              {getTestIcon(passed)}
            </div>
          ))}
        </div>

        {formData && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              View FormData (Debug)
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

export default DataPersistenceTest
