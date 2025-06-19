import React, { useState } from 'react'
import { Download, Calendar, Filter, TrendingUp, Users, DollarSign, Activity } from 'lucide-react'

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last30days')
  const [selectedReport, setSelectedReport] = useState('overview')

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'users', name: 'User Analytics', icon: Users },
    { id: 'revenue', name: 'Revenue Report', icon: DollarSign },
    { id: 'activity', name: 'Activity Report', icon: Activity }
  ]

  const mockReportData = {
    overview: {
      totalRevenue: '$125,430',
      totalUsers: '12,345',
      activeUsers: '8,901',
      conversionRate: '3.2%',
      growth: '+12.5%'
    },
    users: {
      newUsers: '1,234',
      returningUsers: '8,901',
      userRetention: '78%',
      avgSessionTime: '4m 32s'
    },
    revenue: {
      monthlyRevenue: '$125,430',
      averageOrderValue: '$89.50',
      totalOrders: '1,402',
      refundRate: '2.1%'
    },
    activity: {
      pageViews: '45,678',
      uniqueVisitors: '12,345',
      bounceRate: '32%',
      avgPagesPerSession: '3.7'
    }
  }

  const currentData = mockReportData[selectedReport]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Generate and view detailed analytics reports.
          </p>
        </div>
        <button className="mt-4 sm:mt-0 btn-primary">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select 
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="input-field"
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Period
            </label>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field"
            >
              <option value="last7days">Last 7 days</option>
              <option value="last30days">Last 30 days</option>
              <option value="last90days">Last 90 days</option>
              <option value="lastyear">Last year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Format
            </label>
            <select className="input-field">
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report tabs */}
      <div className="card">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {reportTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedReport(type.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${selectedReport === type.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {type.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Report content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Object.entries(currentData).map(([key, value]) => (
              <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Chart Visualization
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Interactive charts and graphs would be displayed here with real data.
            </p>
          </div>
        </div>
      </div>

      {/* Recent reports */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Reports
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Monthly Revenue Report', date: '2024-01-15', size: '2.4 MB', type: 'PDF' },
            { name: 'User Analytics Q4', date: '2024-01-10', size: '1.8 MB', type: 'Excel' },
            { name: 'Activity Summary', date: '2024-01-08', size: '956 KB', type: 'PDF' },
            { name: 'Performance Metrics', date: '2024-01-05', size: '3.2 MB', type: 'PDF' }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mr-3">
                  <Download className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {report.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {report.date} • {report.size} • {report.type}
                  </p>
                </div>
              </div>
              <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Reports
