import React from 'react'

const SimpleChart = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.users))
  
  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="h-64 flex items-end justify-between space-x-2">
        {data.map((item, index) => {
          const height = (item.users / maxValue) * 100
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center">
                <div 
                  className="w-full bg-primary-500 rounded-t-md transition-all duration-300 hover:bg-primary-600 relative group"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {item.users} users
                  </div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {item.name}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary-500 rounded mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">Users</span>
        </div>
      </div>
    </div>
  )
}

export default SimpleChart
