**Project Pre-Plan & Structure (Supabase Version)**

### **1. Overview**
This project is an interactive restaurant menu web app that aims to provide restaurant owners with a way to create and manage digital menus. Potential features include multi-language support, real-time dish availability toggles, customer engagement analytics, and multiple templates for menu customization. The pricing model involves a single subscription per restaurant added, with the flexibility for shared menus across multiple branches if needed.

The company/app will be called **MenúFácil** and hosted at **menufacil.com.mx**.

---

### **2. Tech Stack**
#### **Frontend (Web App & Dashboard)**
- **TypeScript** – Used instead of JavaScript for better type safety and maintainability.
- **React (Next.js)** – Framework for building the UI with support for static generation (SSG) and server-side rendering (SSR).
- **Tailwind CSS** – Used for styling and making the UI responsive.
- **i18next** – For handling multiple language support.

#### **Backend (APIs, Authentication, Business Logic)**
- **Supabase (PostgreSQL + Supabase Functions)** – Backend for authentication, database management, and storage.
- **Edge Functions (TypeScript)** – Utilized for serverless business logic (e.g., handling payments, restaurant subscriptions, and dish availability updates).

#### **Database & Storage**
- **PostgreSQL (via Supabase)** – Relational database for storing restaurant and menu data.
- **Supabase Storage** – Used for storing images and media assets.

#### **Payments & Subscriptions**
- **Stripe (TypeScript SDK)** – Solution for handling payments and subscriptions.

#### **Analytics & Engagement**
- **PostHog (or Google Analytics)** – For tracking user engagement and restaurant performance.

---

### **3. Core Features & Considerations**
#### **Multi-Language Support**
- `i18next` or another translation system implemented.
- Restaurants can provide menu translations.

#### **Restaurant & Menu Management**
- Owners can create restaurants and manage menus.
- Dishes can be enabled/disabled in real-time for availability.
- Support for multiple templates that restaurants can choose from.

#### **Subscription & Payment Model**
- **Account creation is free**.
- **A flat fee of $20 per restaurant**.
- **Billing aligns to a single day per account** (if an owner enables an extra restaurant later, all subscriptions are charged on the same billing day).
- **Owners don’t need extra subscriptions if multiple branches share the same menu**, but real-time dish availability adjustments require separate subscriptions.
- **Before setting up Stripe and billing, we will use test users to simulate different account types and ensure the platform functions correctly.**

#### **Admin & Dashboard**
- A dashboard for business owners to manage menus.
- **An Admin Dashboard for the platform owner** to oversee all restaurant accounts, subscriptions, and analytics.
- Admin functionality is integrated into the web app.

#### **Code Reusability & Shared Libraries**
- Common UI components and utilities are shared across the app.
- Clear documentation is provided for onboarding and maintenance.

#### **Static Generation (SSG) with Next.js**
- Static site generation pre-renders menus for faster loading and SEO benefits.
- Real-time data is fetched only when necessary (e.g., dish availability updates).

#### **Development Workflow & Code Management**
- **Cursor AI** logs all development steps and modifications in Markdown files.
- **Cursor AI integrates with GitHub for automatic commits and pushes**.
- **Cursor AI builds the base functions first to establish a deployable and testable backend on Vercel and Supabase**.
- **Development follows a structured approach, ensuring core features are implemented before additional functionality**.
- **The project must be built from the ground up, focusing on creating an extremely solid backend foundation before expanding to secondary features. The development will follow a pyramid structure, prioritizing essential backend logic, authentication, and database functionality first before moving up to UI and additional features.**
- **Cursor AI needs to create a structured development plan, building functions in a logical order to ensure a working base skeleton that can be deployed and tested fully server-side on Vercel and Supabase before expanding to additional features.**

#### **Preliminary Website Layout**
The website structure includes:
- **Landing Page**: Explains the business, its benefits, and why restaurants should choose this platform.
- **Login & Pricing Page**: Essential for user access and subscription calculations.
- **General Dashboard for Account Owners**: 
  - Displays all managed restaurants in a grid format.
  - Allows users to add new restaurants or manage existing ones.
- **Individual Restaurant Dashboard**:
  - A comprehensive restaurant management view:
    - A Notion-style database table for menu items.
    - Settings for customizing the digital menu (templates, colors, backgrounds).
    - A real-time dish availability manager.
    - Analytics on menu engagement and customer behavior.
    - Potential image editor for background removal or formatting.
- **Billing & Account Settings**: 
  - Overview of subscriptions and payments.
- **Employee-Level Accounts**: 
  - Owners can generate restricted-access accounts for employees.
  - Employees can be limited to specific actions like updating dish availability.
- **Platform Owner Dashboard**:
  - Full oversight of all restaurants and their databases.
  - Ability to assist restaurant owners with menu corrections.
  - Advanced filtering, billing system tracking, and restaurant history.
  - Potential chat feature for direct communication with restaurant owners.
  - Admin-level users with restricted permissions.
- **Printable Menu Feature**:
  - Restaurant owners can export a print-ready PDF version of their menu.
  - The export feature may be free or chargeable per download.

#### **Deployment & Testing Approach**
- **No local development/testing**; all updates are tested directly on Vercel (frontend) and Supabase (backend).
- **GitHub Secrets and Vercel Environment Variables** secure API keys and credentials.
- **User authentication works directly on Supabase from the start**.
- **All Supabase-dependent functions (database queries, business logic) must be functional from the beginning**.

---

### **4. Deployment & Hosting**
- **Frontend:** Hosted on Vercel (Next.js project).
- **Backend:** Supabase handles authentication, database, storage, and edge functions.
- **Payments:** Stripe integration.
- **Analytics:** PostHog or Google Analytics.
- **Version Control & CI/CD:** GitHub for repo management, Vercel for automatic deployments.

This structure supports scalability, maintainability, and efficiency for both restaurant owners and the platform operator. Adjustments can be made based on evolving needs.

### **5. Existing Project Setup**
The projects are already created but mostly empty or unconfigured at:
- **GitHub:** [MenuFacil Repo](https://github.com/inakizamores/MenuFacil)
- **Vercel:** [Project Dashboard](https://vercel.com/inakizamores-projects/menufacil), [Live Site](https://menufacil.vercel.app)
- **Supabase:** [Dashboard](https://supabase.com/dashboard/project/iawspochdngompqmxyhf), [API URL](https://iawspochdngompqmxyhf.supabase.co)

