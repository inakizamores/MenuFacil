# MenuFacil

Welcome to MenuFácil - the easy-to-use digital menu management system for restaurants.

## Recent Updates (March 24, 2025)

We've made significant improvements to the project and completed the first production deployment:

- **Production Deployment**: Successfully deployed to Vercel with all core functionality working
- **Supabase Integration**: Configured database and authentication with Supabase
- **Test Environment**: Set up test user accounts and simulated data for evaluation
- **Documentation**: Added comprehensive deployment documentation and testing guides

For comprehensive details about the project and development progress, see:
- [DEVELOPMENT_PROGRESS.md](./DEVELOPMENT_PROGRESS.md) - Complete project documentation and current status

## Recent Updates

### Form Validation System Improvements (July 2024)
- Implemented Zod validation for restaurant forms (creation and editing)
- Enhanced form validation library with better schema integration
- Added detailed documentation for validation utilities
- Fixed type-related issues for UUID fields

For developers continuing work on this project, the next steps should focus on implementing validation for menu-related forms following the patterns established in the restaurant form implementation. See `DEVELOPMENT_PROGRESS.md` for detailed guidance on the next steps.

## Features

- 🍽️ **Menu Management**: Create and manage digital menus for your restaurant
- 📱 **Mobile-Friendly**: Optimized for viewing on smartphones and tablets
- 🛒 **Item Organization**: Categorize and organize menu items efficiently
- 📊 **Analytics**: Track menu views and popular items
- 🔄 **Real-time Updates**: Make menu changes instantly available to customers
- 📲 **QR Code Generation**: Create customized QR codes for your menus
- 🎨 **Customization**: Personalize the appearance of your menus
- 📦 **Batch Processing**: Generate multiple QR codes at once for different tables or locations
- 📊 **QR Analytics**: Track QR code scans with detailed analytics
- 🔍 **Multi-format Export**: Export QR codes in PNG, SVG, PDF, and combined ZIP formats

## QR Code Management Features

### Single QR Code Generation
- Create customized QR codes with personalized colors and settings
- Link QR codes directly to your menu
- Track views for each QR code

### Batch QR Code Generation
- Generate up to 50 QR codes in a single operation
- Customize naming with prefixes (e.g., "Table 1", "Table 2", etc.)
- Apply consistent styling across all generated codes
- Export all generated codes as PNG, SVG, or combined PDF/ZIP

### Export Options
- **PNG Export**: High-resolution PNG images for digital use
- **SVG Export**: Scalable vector graphics for perfect scaling at any size
- **PDF Export**: Print-ready PDFs with custom designs
- **Batch Export**: Download multiple QR codes as a ZIP file

### Analytics Integration
- Track QR code performance
- View scan counts for each QR code
- Analyze most popular QR codes
- Export analytics reports

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables (see .env.example)
4. Run the development server with `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- **Frontend Framework:** React 18.2.0, Next.js 14.0.4
- **State Management:** React Context API
- **Type System:** TypeScript 5.3.3
- **Styling:** TailwindCSS 3.4.1, with custom UI component library
- **API Architecture:** Serverless with Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with JWT
- **Storage:** Supabase Storage for images and assets
- **Deployment:** Vercel (Production/Preview)
- **QR Code Generation:** QRCode.react
- **File Export:** jsPDF, JSZip, file-saver

## Production URL

The application is deployed at: https://menufacil.vercel.app

## Testing the Application

You can test the application using the following credentials:

- **Email**: test@menufacil.app
- **Password**: test123456

Or you can create your own account through the registration page.

### Testing Steps

1. **Login/Registration**:
   - Use the test credentials or create a new account
   - Navigate the dashboard

2. **Restaurant Creation**:
   - Click "Create Restaurant" in the dashboard
   - Fill in the required information
   - Submit the form

3. **Menu Creation**:
   - Select a restaurant from your dashboard
   - Go to Menus section
   - Create a new menu
   - Add categories and menu items

4. **Menu Publishing**:
   - Navigate to the menu's Publish section
   - Click "Publish Menu" to make it publicly accessible
   - Use the generated URL to view the public menu

## Learn More

For more information about using MenuFácil, please refer to our documentation in the [docs](./docs) folder. 