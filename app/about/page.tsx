import React from 'react';

// Add export config for static generation
export const dynamic = 'force-static';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About MenuFácil</h1>
      <p className="mb-4">
        MenuFácil is a modern digital menu solution for restaurants, cafes and food service businesses.
      </p>
      <p className="mb-4">
        Our platform makes it easy to create, update and manage beautiful digital menus that can be accessed by your customers via QR codes or direct links.
      </p>
    </div>
  );
} 