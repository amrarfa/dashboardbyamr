import React from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

const StatsCard = ({ title, value, change, changeType, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  }

  const changeColorClasses = {
    increase: 'text-green-600 dark:text-green-400',
    decrease: 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].replace('bg-', 'text-')}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <div className={`flex items-center ${changeColorClasses[changeType]}`}>
          {changeType === 'increase' ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1" />
          )}
          <span className="text-sm font-medium">{change}</span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
          from last month
        </span>
      </div>
    </div>
  )
}

export default StatsCard
