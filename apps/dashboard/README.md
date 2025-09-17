# Postmatic Business Dashboard

A modern, responsive business management dashboard built with Next.js 15, TypeScript, and shadcn/ui components. Features dark/light mode support and a clean, modular architecture.

## 🚀 Features

- **Modern UI Design**: Clean, professional interface matching the provided design
- **Dark/Light Mode**: Full theme support with system preference detection
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Interactive Components**: Functional buttons, search, like, and bookmark features
- **Modular Architecture**: Clean, reusable components for easy maintenance
- **TypeScript**: Full type safety throughout the application
- **shadcn/ui**: Beautiful, accessible UI components

## 🏗️ Architecture

### Components Structure

```
components/
├── ui/                    # shadcn/ui base components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── avatar.tsx
│   └── dropdown-menu.tsx
├── header.tsx             # Main header with logo and user info
├── welcome-section.tsx    # Welcome message component
├── action-bar.tsx         # New business button and search
├── business-card.tsx      # Individual business card
├── business-grid.tsx      # Grid layout for business cards
├── theme-provider.tsx     # Theme context provider
└── theme-toggle.tsx       # Dark/light mode toggle
```

### Custom Hooks

```
hooks/
└── use-business.ts        # Business data management and interactions
```

## 🎨 Design Features

### Header
- **Logo**: Blue "P" logo with "Postmatic / Business" branding
- **User Info**: Avatar, name, and role display
- **Theme Toggle**: Dropdown menu for theme selection

### Welcome Section
- Personalized greeting with user name
- Instructional message for business selection

### Action Bar
- **New Business Button**: Blue primary button with plus icon
- **Search Input**: Real-time search functionality with search icon

### Business Cards
- **Visual Design**: Matches the provided design with herbal soap and character elements
- **Interactive Elements**:
  - Like button with heart icon and count
  - Bookmark button with bookmark icon
  - Three-dot menu with edit, share, and delete options
- **Content**: Business name, description, and owner avatar

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Theme Management**: next-themes
- **State Management**: React hooks (useState, useCallback)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pstmtcc
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Responsive Design

The dashboard is fully responsive and adapts to different screen sizes:

- **Desktop**: Full grid layout with all features visible
- **Tablet**: Adjusted grid columns and spacing
- **Mobile**: Single column layout with optimized touch targets

## 🎯 Key Functionalities

### Theme Management
- System theme detection
- Manual theme selection (Light/Dark/System)
- Smooth transitions between themes
- Persistent theme preference

### Business Management
- **Search**: Real-time filtering of business cards
- **Like**: Toggle like status with visual feedback
- **Bookmark**: Save businesses for later reference
- **Menu Actions**: Edit, share, or delete businesses
- **New Business**: Button ready for form integration

### Interactive Features
- Hover effects on cards and buttons
- Loading states and transitions
- Accessible keyboard navigation
- Screen reader support

## 🔧 Customization

### Adding New Business
The `handleNewBusiness` function in `use-business.ts` is ready for integration with:
- Modal forms
- Navigation to dedicated pages
- API calls for business creation

### Styling
All components use Tailwind CSS classes and can be easily customized:
- Colors follow the design system
- Spacing uses consistent scale
- Typography matches the design requirements

### Data Management
The `useBusiness` hook provides a foundation for:
- API integration
- Local storage persistence
- Real-time updates
- Advanced filtering and sorting

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Design System

### Colors
- **Primary**: Blue (#2563eb) for main actions
- **Background**: Light gray (#f8fafc) / Dark (#0f172a)
- **Cards**: White (#ffffff) / Dark gray (#1e293b)
- **Text**: Dark gray (#1f2937) / Light (#f9fafb)

### Typography
- **Font**: Geist Sans (system fallback)
- **Headings**: Bold weights for emphasis
- **Body**: Regular weight for readability

### Spacing
- Consistent 4px base unit
- Responsive spacing with Tailwind breakpoints
- Card padding and margins optimized for readability

## 🔮 Future Enhancements

- [ ] Business creation form modal
- [ ] Advanced search and filtering
- [ ] Business analytics dashboard
- [ ] User profile management
- [ ] Real-time notifications
- [ ] API integration
- [ ] Data persistence
- [ ] Export functionality

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using Next.js, TypeScript, and shadcn/ui