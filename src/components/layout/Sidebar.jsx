import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { X, LayoutDashboard, Users, FileText, Settings, ChevronRight, ChevronLeft, Calendar, Repeat } from 'lucide-react'

const Sidebar = ({ isOpen, isCollapsed, onClose, onToggleCollapse }) => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Plans', href: '/plans', icon: Calendar },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Subscriptions', href: '/subscriptions', icon: Repeat },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LC</span>
            </div>
            {!isCollapsed && (
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                LowCalories
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Desktop collapse toggle button */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href

              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={onClose}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 relative
                      ${isActive
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? item.name : ''}
                  >
                    <Icon className={`
                      h-5 w-5 transition-colors duration-200
                      ${isCollapsed ? '' : 'mr-3'}
                      ${isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      }
                    `} />
                    {!isCollapsed && (
                      <span className="transition-opacity duration-200">
                        {item.name}
                      </span>
                    )}
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                        {item.name}
                      </div>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {!isCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="card p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Need help?
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Check our documentation for more information.
              </p>
              <button className="w-full text-xs btn-secondary">
                View Docs
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Sidebar
