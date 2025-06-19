import React from 'react'

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (action) => {
    if (action.includes('Logged in')) return '🟢'
    if (action.includes('Updated')) return '✏️'
    if (action.includes('purchase')) return '💰'
    if (action.includes('Logged out')) return '🔴'
    return '📝'
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-lg">{getActivityIcon(activity.action)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 dark:text-white">
              <span className="font-medium">{activity.user}</span>{' '}
              <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activity.time}
            </p>
          </div>
        </div>
      ))}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
          View all activity →
        </button>
      </div>
    </div>
  )
}

export default RecentActivity
