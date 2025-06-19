import React, { useState } from 'react'
import { ChevronLeft, Package, Calendar, Utensils, Grid3X3, Table, Clock, MapPin, ChevronRight, Activity } from 'lucide-react'
import { useSubscriptionForm } from '../../contexts/SubscriptionFormContext'

const SubscriptionPreviewStep = ({ onNext, onPrevious, isLoading }) => {
  // Use the context instead of props
  const { formData } = useSubscriptionForm()

  // View mode state
  const [viewMode, setViewMode] = useState('table') // 'table', 'cards', 'calendar', 'timeline'
  console.log('=== PREVIEW STEP DEBUG ===')
  console.log('1. Full formData:', formData)
  console.log('2. formData keys:', formData ? Object.keys(formData) : 'No formData')
  console.log('3. generatedPlan:', formData?.generatedPlan)
  console.log('4. generatedPlan type:', typeof formData?.generatedPlan)
  console.log('5. generatedPlan keys:', formData?.generatedPlan ? Object.keys(formData.generatedPlan) : 'No generatedPlan')

  if (formData?.generatedPlan?.data) {
    console.log('6. generatedPlan.data:', formData.generatedPlan.data)
    console.log('7. generatedPlan.data keys:', Object.keys(formData.generatedPlan.data))
    console.log('8. subscriptionDetails:', formData.generatedPlan.data.subscriptionDetails)
  } else {
    console.log('6. No generatedPlan.data found')
  }

  // Get the meal data from API response
  const mealData = formData?.generatedPlan?.data?.subscriptionDetails || []
  console.log('9. Final mealData:', mealData)
  console.log('10. mealData length:', mealData.length)
  console.log('11. mealData is array:', Array.isArray(mealData))

  // Check if we have data
  const hasData = mealData && mealData.length > 0
  console.log('12. hasData:', hasData)
  console.log('=== END DEBUG ===')

  // Create pivot table data
  const createPivotData = () => {
    if (!hasData) return { days: [], mealTypes: [] }

    // Group by delivery date
    const groupedByDate = {}
    const mealTypesSet = new Set()

    mealData.forEach(meal => {
      const dateKey = meal.deliveryDate
      const mealType = meal.mealTypeName

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: meal.deliveryDate,
          dayName: meal.dayName,
          dayNumber: meal.dayNumberCount,
          meals: {}
        }
      }

      if (!groupedByDate[dateKey].meals[mealType]) {
        groupedByDate[dateKey].meals[mealType] = []
      }

      groupedByDate[dateKey].meals[mealType].push(meal)
      mealTypesSet.add(mealType)
    })

    // Sort days by date
    const sortedDays = Object.values(groupedByDate).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    )

    // Sort meal types
    const mealTypes = Array.from(mealTypesSet).sort()

    return { days: sortedDays, mealTypes }
  }

  const { days, mealTypes } = createPivotData()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 dark:bg-green-800 p-3 rounded-full">
              <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Subscription Preview
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Review your generated meal plan
          </p>
        </div>

        {!hasData ? (
          /* No Data */
          <div className="text-center py-12">
            <div className="bg-orange-100 dark:bg-orange-800 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Package className="h-10 w-10 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Meal Plan Generated
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Please go back and generate a meal plan first.
            </p>
            <button
              onClick={onPrevious}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center mx-auto"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </div>
        ) : (
          /* Show Pivot Table */
          <div>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{days.length}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Days</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{mealData.length}</div>
                <div className="text-sm text-green-600 dark:text-green-400">Total Meals</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{mealTypes.length}</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Meal Types</div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meal Plan Schedule</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred view</p>
              </div>
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 space-x-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Table className="h-4 w-4 mr-1" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                    viewMode === 'cards'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                    viewMode === 'calendar'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                    viewMode === 'timeline'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Activity className="h-4 w-4 mr-1" />
                  Timeline
                </button>
              </div>
            </div>

            {/* Conditional View Rendering */}
            {viewMode === 'table' ? (
              /* Enhanced Pivot Table */
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Table Header with Gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Package className="h-6 w-6 mr-3" />
                  Weekly Meal Plan Schedule
                </h3>
                <p className="text-blue-100 mt-1">Your personalized meal delivery schedule</p>
              </div>

              {/* Responsive Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Enhanced Header */}
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                      <th className="sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-5 text-left">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <span className="font-bold text-gray-900 dark:text-white text-lg">Delivery Date</span>
                        </div>
                      </th>
                      {mealTypes.map((mealType, index) => (
                        <th key={mealType} className="px-6 py-5 text-center min-w-[280px]">
                          <div className="flex flex-col items-center space-y-2">
                            <div className={`p-3 rounded-full ${
                              index === 0 ? 'bg-orange-100 dark:bg-orange-800' :
                              index === 1 ? 'bg-green-100 dark:bg-green-800' :
                              index === 2 ? 'bg-purple-100 dark:bg-purple-800' :
                              'bg-blue-100 dark:bg-blue-800'
                            }`}>
                              <Utensils className={`h-6 w-6 ${
                                index === 0 ? 'text-orange-600 dark:text-orange-400' :
                                index === 1 ? 'text-green-600 dark:text-green-400' :
                                index === 2 ? 'text-purple-600 dark:text-purple-400' :
                                'text-blue-600 dark:text-blue-400'
                              }`} />
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white text-lg">
                              {mealType}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Enhanced Body */}
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {days.map((day, dayIndex) => (
                      <tr key={day.date} className={`group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 ${
                        dayIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-750'
                      }`}>
                        {/* Enhanced Date Column */}
                        <td className="sticky left-0 bg-inherit px-6 py-6 border-r border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {day.dayNumber}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-lg text-gray-900 dark:text-white">
                                {day.dayName}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                {new Date(day.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                                Day {day.dayNumber} of Plan
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Enhanced Meal Columns */}
                        {mealTypes.map((mealType, typeIndex) => {
                          const mealsForType = day.meals[mealType] || []
                          return (
                            <td key={mealType} className="px-6 py-6 align-top">
                              {mealsForType.length > 0 ? (
                                <div className="space-y-3">
                                  {mealsForType.map((meal, mealIndex) => (
                                    <div key={meal.mealID} className={`group/meal relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                                      typeIndex === 0 ? 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 hover:border-orange-300' :
                                      typeIndex === 1 ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:border-green-300' :
                                      typeIndex === 2 ? 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:border-purple-300' :
                                      'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:border-blue-300'
                                    }`}>
                                      {/* Meal Content */}
                                      <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                            typeIndex === 0 ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200' :
                                            typeIndex === 1 ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' :
                                            typeIndex === 2 ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200' :
                                            'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                          }`}>
                                            #{meal.mealID}
                                          </div>
                                        </div>

                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-2 line-clamp-2">
                                          {meal.mealName}
                                        </h4>

                                        <div className="flex items-center justify-between text-xs">
                                          <span className={`font-medium ${
                                            typeIndex === 0 ? 'text-orange-600 dark:text-orange-400' :
                                            typeIndex === 1 ? 'text-green-600 dark:text-green-400' :
                                            typeIndex === 2 ? 'text-purple-600 dark:text-purple-400' :
                                            'text-blue-600 dark:text-blue-400'
                                          }`}>
                                            {mealType}
                                          </span>
                                          <div className="flex items-center space-x-1">
                                            <div className={`w-2 h-2 rounded-full ${
                                              typeIndex === 0 ? 'bg-orange-400' :
                                              typeIndex === 1 ? 'bg-green-400' :
                                              typeIndex === 2 ? 'bg-purple-400' :
                                              'bg-blue-400'
                                            }`}></div>
                                            <span className="text-gray-500 dark:text-gray-400">Ready</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Hover Effect Overlay */}
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/meal:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50">
                                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mb-3">
                                    <Utensils className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                  </div>
                                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                    No {mealType.toLowerCase()}
                                  </span>
                                  <span className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                                    scheduled
                                  </span>
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                      All meals scheduled
                    </span>
                    <span>•</span>
                    <span>{mealData.length} total meals planned</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Plan duration: {days.length} days
                  </div>
                </div>
              </div>
            </div>
            ) : viewMode === 'cards' ? (
              /* Card View */
              <div className="space-y-6">
                {days.map((day, dayIndex) => (
                  <div key={day.date} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Day Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {day.dayNumber}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{day.dayName}</h3>
                            <p className="text-blue-100">
                              {new Date(day.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-white">
                          <Clock className="h-5 w-5" />
                          <span className="text-sm font-medium">Day {day.dayNumber} of {days.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Meals Grid */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mealTypes.map((mealType, typeIndex) => {
                          const mealsForType = day.meals[mealType] || []
                          return (
                            <div key={mealType} className="space-y-4">
                              {/* Meal Type Header */}
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${
                                  typeIndex === 0 ? 'bg-orange-100 dark:bg-orange-800' :
                                  typeIndex === 1 ? 'bg-green-100 dark:bg-green-800' :
                                  typeIndex === 2 ? 'bg-purple-100 dark:bg-purple-800' :
                                  'bg-blue-100 dark:bg-blue-800'
                                }`}>
                                  <Utensils className={`h-5 w-5 ${
                                    typeIndex === 0 ? 'text-orange-600 dark:text-orange-400' :
                                    typeIndex === 1 ? 'text-green-600 dark:text-green-400' :
                                    typeIndex === 2 ? 'text-purple-600 dark:text-purple-400' :
                                    'text-blue-600 dark:text-blue-400'
                                  }`} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 dark:text-white">{mealType}</h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {mealsForType.length} meal{mealsForType.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>

                              {/* Meal Cards */}
                              <div className="space-y-3">
                                {mealsForType.length > 0 ? (
                                  mealsForType.map((meal) => (
                                    <div key={meal.mealID} className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                                      typeIndex === 0 ? 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 hover:border-orange-300' :
                                      typeIndex === 1 ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:border-green-300' :
                                      typeIndex === 2 ? 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:border-purple-300' :
                                      'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:border-blue-300'
                                    }`}>
                                      <div className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                            typeIndex === 0 ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200' :
                                            typeIndex === 1 ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' :
                                            typeIndex === 2 ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200' :
                                            'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                          }`}>
                                            #{meal.mealID}
                                          </div>
                                          <div className="flex items-center space-x-1">
                                            <div className={`w-2 h-2 rounded-full ${
                                              typeIndex === 0 ? 'bg-orange-400' :
                                              typeIndex === 1 ? 'bg-green-400' :
                                              typeIndex === 2 ? 'bg-purple-400' :
                                              'bg-blue-400'
                                            }`}></div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Ready</span>
                                          </div>
                                        </div>

                                        <h5 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-2">
                                          {meal.mealName}
                                        </h5>

                                        <div className="flex items-center justify-between text-xs">
                                          <span className={`font-medium ${
                                            typeIndex === 0 ? 'text-orange-600 dark:text-orange-400' :
                                            typeIndex === 1 ? 'text-green-600 dark:text-green-400' :
                                            typeIndex === 2 ? 'text-purple-600 dark:text-purple-400' :
                                            'text-blue-600 dark:text-blue-400'
                                          }`}>
                                            {mealType}
                                          </span>
                                          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                                            <MapPin className="h-3 w-3" />
                                            <span>Delivery</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Hover Effect Overlay */}
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mb-3">
                                      <Utensils className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                      No {mealType.toLowerCase()}
                                    </span>
                                    <span className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                                      scheduled
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Day Footer */}
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                            {Object.values(day.meals).flat().length} meals scheduled
                          </span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'calendar' ? (
              /* Calendar View */
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
                {/* Calendar Header */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Calendar className="h-6 w-6 mr-3" />
                    Calendar View - Meal Plan Schedule
                  </h3>
                  <p className="text-green-100 mt-1">Your meals organized by delivery dates</p>
                </div>

                <div className="p-4 lg:p-6 overflow-x-auto">
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 mb-4 min-w-[800px]">
                    {/* Day Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center py-3 font-semibold text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.charAt(0)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1 min-w-[800px]">
                    {(() => {
                      const startDate = new Date(days[0]?.date)
                      const endDate = new Date(days[days.length - 1]?.date)
                      const calendarStart = new Date(startDate)
                      calendarStart.setDate(startDate.getDate() - startDate.getDay()) // Start from Sunday

                      const calendarEnd = new Date(endDate)
                      calendarEnd.setDate(endDate.getDate() + (6 - endDate.getDay())) // End on Saturday

                      const calendarDays = []
                      const currentDate = new Date(calendarStart)

                      while (currentDate <= calendarEnd) {
                        const dateStr = currentDate.toISOString()
                        const dayData = days.find(d => new Date(d.date).toDateString() === currentDate.toDateString())
                        const isInPlan = !!dayData
                        const isToday = currentDate.toDateString() === new Date().toDateString()

                        calendarDays.push(
                          <div key={dateStr} className={`min-h-[180px] border border-gray-200 dark:border-gray-600 rounded-lg p-3 transition-all duration-200 ${
                            isInPlan
                              ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-600 hover:shadow-lg'
                              : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                          } ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
                            {/* Date Number */}
                            <div className={`text-sm font-semibold mb-2 ${
                              isInPlan ? 'text-blue-900 dark:text-blue-100' : 'text-gray-500 dark:text-gray-400'
                            } ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                              {currentDate.getDate()}
                              {isToday && <span className="ml-1 text-xs">(Today)</span>}
                            </div>

                            {/* Meals */}
                            {isInPlan && dayData && (
                              <div className="space-y-2">
                                {Object.entries(dayData.meals).map(([mealType, meals]) =>
                                  meals.map((meal, index) => (
                                    <div key={`${mealType}-${index}`} className={`text-xs p-2 rounded text-white font-medium leading-tight ${
                                      mealType === 'BREAKFAST' ? 'bg-orange-500' :
                                      mealType === 'LUNCH' ? 'bg-green-500' :
                                      mealType === 'DINNER' ? 'bg-purple-500' :
                                      'bg-blue-500'
                                    }`} title={meal.mealName}>
                                      <div className="break-words line-clamp-2">
                                        {meal.mealName.length > 30 ? meal.mealName.substring(0, 30) + '...' : meal.mealName}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )

                        currentDate.setDate(currentDate.getDate() + 1)
                      }

                      return calendarDays
                    })()}
                  </div>

                  {/* Calendar Legend */}
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span className="text-gray-600 dark:text-gray-400">Breakfast</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-gray-600 dark:text-gray-400">Lunch</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="text-gray-600 dark:text-gray-400">Dinner</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-gray-600 dark:text-gray-400">Other</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : viewMode === 'timeline' ? (
              /* Timeline View */
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Timeline Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Activity className="h-6 w-6 mr-3" />
                    Timeline View - Subscription Journey
                  </h3>
                  <p className="text-purple-100 mt-1">Your meal plan timeline from start to finish</p>
                </div>

                <div className="p-6">
                  {/* Timeline Container */}
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 to-pink-400"></div>

                    {/* Timeline Items */}
                    <div className="space-y-8">
                      {days.map((day, dayIndex) => (
                        <div key={day.date} className="relative flex items-start">
                          {/* Timeline Dot */}
                          <div className="flex-shrink-0 relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-4 border-white dark:border-gray-800">
                              {day.dayNumber}
                            </div>
                            {dayIndex === 0 && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">S</span>
                              </div>
                            )}
                            {dayIndex === days.length - 1 && (
                              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">E</span>
                              </div>
                            )}
                          </div>

                          {/* Timeline Content */}
                          <div className="ml-6 flex-1">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 shadow-md">
                              {/* Day Header */}
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{day.dayName}</h4>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    {new Date(day.date).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                                  <Clock className="h-5 w-5" />
                                  <span className="text-sm font-medium">Day {day.dayNumber}</span>
                                </div>
                              </div>

                              {/* Meals Timeline */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {mealTypes.map((mealType, typeIndex) => {
                                  const mealsForType = day.meals[mealType] || []
                                  return (
                                    <div key={mealType} className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                          typeIndex === 0 ? 'bg-orange-400' :
                                          typeIndex === 1 ? 'bg-green-400' :
                                          typeIndex === 2 ? 'bg-purple-400' :
                                          'bg-blue-400'
                                        }`}></div>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{mealType}</span>
                                      </div>

                                      {mealsForType.length > 0 ? (
                                        <div className="space-y-1">
                                          {mealsForType.map((meal) => (
                                            <div key={meal.mealID} className={`text-xs p-2 rounded-lg border ${
                                              typeIndex === 0 ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 text-orange-800 dark:text-orange-200' :
                                              typeIndex === 1 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200' :
                                              typeIndex === 2 ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200' :
                                              'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200'
                                            }`}>
                                              <div className="font-medium">{meal.mealName}</div>
                                              <div className="text-xs opacity-75">ID: {meal.mealID}</div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                                          No {mealType.toLowerCase()}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Summary */}
                  <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-purple-900 dark:text-purple-100">Subscription Summary</h4>
                        <p className="text-purple-600 dark:text-purple-400 text-sm">Complete meal plan overview</p>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-purple-900 dark:text-purple-100">{days.length}</div>
                          <div className="text-purple-600 dark:text-purple-400">Days</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-purple-900 dark:text-purple-100">{mealData.length}</div>
                          <div className="text-purple-600 dark:text-purple-400">Meals</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-purple-900 dark:text-purple-100">{mealTypes.length}</div>
                          <div className="text-purple-600 dark:text-purple-400">Types</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
          <button
            onClick={onPrevious}
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </button>

          <button
            onClick={onNext}
            disabled={isLoading || !hasData}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
          >
            Continue to Finalize
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPreviewStep
