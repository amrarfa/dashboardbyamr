# LowCalories Dashboard

A modern, responsive meal subscription management dashboard built with React, Vite, and Tailwind CSS.

## 🚀 Features

### Customer Management
- **Customer Registration & Profiles**: Complete customer information management
- **Address & Contact Management**: Multiple addresses and phone numbers support
- **Customer Search & Filtering**: Advanced search capabilities
- **Customer Type Management**: Support for regular customers and sponsors

### Subscription Management
- **Multi-Step Subscription Creation**: Intuitive 5-step subscription workflow
- **Plan Selection & Customization**: Dynamic plan filtering by categories
- **Meal Type Selection**: Flexible meal type configuration
- **Delivery Scheduling**: Custom delivery days and duration settings
- **Plan Preview**: Multiple view modes (Table, Cards, Calendar, Timeline)

### Billing & Payment
- **Dynamic Pricing**: Real-time price calculation with tax handling
- **Discount Management**: Manual discounts and coupon system
- **Payment Methods**: Multiple payment options with reference tracking
- **Sponsor Support**: Special handling for sponsored subscriptions
- **Invoice Management**: File upload and invoice generation

### Plan Management
- **Plan Categories**: Organized plan categorization
- **Meal Planning**: Advanced meal type and category management
- **Dislike Categories**: Customer preference handling
- **Plan Generation**: AI-powered meal plan generation

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Linting**: ESLint

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lowcalories-dashboard.git
   cd lowcalories-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components
│   ├── customers/       # Customer-related components
│   └── subscriptions/   # Subscription workflow components
├── contexts/            # React contexts
├── hooks/              # Custom React hooks
├── pages/              # Main page components
├── services/           # API services
└── store/              # Zustand stores
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Key Components

### Subscription Workflow
1. **Customer Selection** - Choose or create customer
2. **Plan Selection** - Browse and select meal plans
3. **Subscription Details** - Configure meals, delivery, and preferences
4. **Plan Preview** - Review generated meal plan
5. **Billing & Payment** - Handle pricing and payment details

### Dashboard Features
- **Responsive Design** - Works on all device sizes
- **Dark Mode Support** - Toggle between light and dark themes
- **Real-time Updates** - Dynamic data updates
- **Form Validation** - Comprehensive input validation
- **Error Handling** - User-friendly error messages

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Mobile-first design approach
- **Interactive Elements**: Hover effects and smooth transitions
- **Accessibility**: ARIA labels and keyboard navigation
- **Loading States**: Skeleton loaders and progress indicators

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- **Desktop**: Full-featured experience
- **Tablet**: Adapted layouts and touch-friendly controls
- **Mobile**: Streamlined interface with essential features

## 🔗 API Integration

The dashboard integrates with RESTful APIs for:
- Customer management
- Plan and meal data
- Subscription creation
- Payment processing
- File uploads

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Development**: React + Tailwind CSS
- **State Management**: Zustand
- **API Integration**: RESTful services
- **UI/UX Design**: Modern, responsive design

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the code examples

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced subscription workflow
- **v1.2.0** - Improved billing and payment system

---

Built with ❤️ using React and Tailwind CSS
