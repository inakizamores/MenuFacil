import React from 'react';

/**
 * Contact Page
 * 
 * This is a static marketing page that replaces the previous nested structure
 * at app/(routes)/(marketing). Static pages at the root level help prevent
 * client-reference-manifest errors during Vercel deployment.
 * 
 * The 'force-static' directive ensures this page is statically generated
 * at build time without server-side rendering dependencies.
 */
export const dynamic = 'force-static';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="mb-4">
        Have questions about MenuFácil? We're here to help!
      </p>
      <p className="mb-4">
        Please reach out to us via email at <span className="text-primary-600">support@menufacil.com</span> or use the contact form below.
      </p>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Contact Form</h2>
        <p className="text-gray-600">Contact form coming soon...</p>
      </div>
    </div>
  );
} 