# LowCalories Dashboard - Technical Documentation

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Structure](#component-structure)
3. [State Management](#state-management)
4. [API Integration](#api-integration)
5. [Styling Guidelines](#styling-guidelines)
6. [Performance Optimization](#performance-optimization)
7. [Security Considerations](#security-considerations)

## 🏗 Architecture Overview

### Technology Stack
- **Frontend Framework**: React 18 with functional components and hooks
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: Zustand for lightweight state management
- **Routing**: React Router DOM for client-side routing
- **Icons**: Lucide React for consistent iconography

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (buttons, modals, etc.)
│   ├── customers/       # Customer management components
│   └── subscriptions/   # Subscription workflow components
├── contexts/            # React contexts for global state
├── hooks/              # Custom React hooks
├── pages/              # Main page components
├── services/           # API service layer
└── store/              # Zustand store definitions
```

## 🧩 Component Structure

### Component Hierarchy
```
App
├── Layout
│   ├── Header
│   ├── Sidebar
│   └── Main Content
├── Pages
│   ├── Dashboard
│   ├── Customers
│   ├── Subscriptions
│   └── Plans
└── Modals/Dialogs
```

### Component Patterns

#### 1. Container/Presentational Pattern
```jsx
// Container Component (logic)
const CustomerContainer = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Business logic here
  
  return <CustomerList customers={customers} loading={loading} />
}

// Presentational Component (UI)
const CustomerList = ({ customers, loading }) => {
  if (loading) return <LoadingSpinner />
  
  return (
    <div className="customer-list">
      {customers.map(customer => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  )
}
```

#### 2. Custom Hooks Pattern
```jsx
// Custom hook for data fetching
const useCustomers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await customerService.getAll()
      setCustomers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])
  
  return { customers, loading, error, refetch: fetchCustomers }
}
```

## 🗄 State Management

### Zustand Store Structure
```jsx
// Customer Store
const useCustomerStore = create((set, get) => ({
  customers: [],
  selectedCustomer: null,
  loading: false,
  
  // Actions
  setCustomers: (customers) => set({ customers }),
  selectCustomer: (customer) => set({ selectedCustomer: customer }),
  addCustomer: (customer) => set((state) => ({
    customers: [...state.customers, customer]
  })),
  updateCustomer: (id, updates) => set((state) => ({
    customers: state.customers.map(c => 
      c.id === id ? { ...c, ...updates } : c
    )
  }))
}))
```

### Context for Form Data Persistence
```jsx
// Subscription Context
const SubscriptionContext = createContext()

export const SubscriptionProvider = ({ children }) => {
  const [subscriptionData, setSubscriptionData] = useState({
    customer: null,
    plan: null,
    details: {},
    billing: {}
  })
  
  const updateSubscriptionData = (step, data) => {
    setSubscriptionData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }))
  }
  
  return (
    <SubscriptionContext.Provider value={{
      subscriptionData,
      updateSubscriptionData
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}
```

## 🔌 API Integration

### Service Layer Architecture
```jsx
// Base API service
class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }
    
    try {
      const response = await fetch(url, config)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }
  
  get(endpoint) {
    return this.request(endpoint)
  }
  
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// Customer service
export const customerService = {
  getAll: () => apiService.get('/customers'),
  getById: (id) => apiService.get(`/customers/${id}`),
  create: (customer) => apiService.post('/customers', customer),
  update: (id, customer) => apiService.put(`/customers/${id}`, customer)
}
```

## 🎨 Styling Guidelines

### Tailwind CSS Conventions
```jsx
// Component styling patterns
const Button = ({ variant = 'primary', size = 'md', children, ...props }) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2'
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]}`
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
```

### Responsive Design Patterns
```jsx
// Mobile-first responsive design
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4 
  p-4 
  lg:p-6
">
  {/* Content */}
</div>
```

## ⚡ Performance Optimization

### Code Splitting
```jsx
// Lazy loading for route components
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Customers = lazy(() => import('./pages/Customers'))
const Subscriptions = lazy(() => import('./pages/Subscriptions'))

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/customers" element={<Customers />} />
    <Route path="/subscriptions" element={<Subscriptions />} />
  </Routes>
</Suspense>
```

### Memoization
```jsx
// Memoized components
const CustomerCard = memo(({ customer, onEdit, onDelete }) => {
  return (
    <div className="customer-card">
      {/* Card content */}
    </div>
  )
})

// Memoized values
const expensiveValue = useMemo(() => {
  return customers.filter(c => c.isActive).length
}, [customers])

// Memoized callbacks
const handleCustomerEdit = useCallback((customer) => {
  // Edit logic
}, [])
```

## 🔒 Security Considerations

### Input Validation
```jsx
// Form validation patterns
const validateCustomerForm = (data) => {
  const errors = {}
  
  if (!data.name?.trim()) {
    errors.name = 'Name is required'
  }
  
  if (!data.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.email = 'Valid email is required'
  }
  
  return errors
}
```

### XSS Prevention
```jsx
// Safe content rendering
const SafeContent = ({ content }) => {
  return (
    <div 
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(content)
      }}
    />
  )
}
```

### Environment Variables
```jsx
// Safe environment variable usage
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const IS_DEVELOPMENT = import.meta.env.DEV
```

## 📊 Monitoring and Analytics

### Error Boundary
```jsx
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    
    return this.props.children
  }
}
```

This documentation provides a comprehensive overview of the technical architecture and implementation patterns used in the LowCalories Dashboard.
