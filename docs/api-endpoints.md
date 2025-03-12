# MenúFácil API Endpoints

This document outlines the API endpoints available in the MenúFácil application. These endpoints are implemented using the Supabase API and Edge Functions.

## Authentication Endpoints

### POST /auth/signup

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2023-01-01T00:00:00.000Z"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1672531200
  }
}
```

### POST /auth/signin

Sign in an existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2023-01-01T00:00:00.000Z"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1672531200
  }
}
```

### POST /auth/signout

Sign out the current user.

**Response:**
```json
{
  "error": null
}
```

## Profile Endpoints

### GET /profiles/me

Get the current user's profile.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "User Name",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

### PATCH /profiles/me

Update the current user's profile.

**Request:**
```json
{
  "full_name": "Updated Name",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Updated Name",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-02T00:00:00.000Z"
}
```

## Restaurant Endpoints

### GET /restaurants

Get all restaurants owned by the current user.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "owner_id": "uuid",
      "name": "My Restaurant",
      "description": "A great place to eat",
      "logo_url": "https://example.com/logo.jpg",
      "address": "123 Main St, Anytown, AN",
      "phone": "+1234567890",
      "website": "https://myrestaurant.com",
      "is_active": true,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /restaurants/:id

Get a specific restaurant by ID.

**Response:**
```json
{
  "id": "uuid",
  "owner_id": "uuid",
  "name": "My Restaurant",
  "description": "A great place to eat",
  "logo_url": "https://example.com/logo.jpg",
  "address": "123 Main St, Anytown, AN",
  "phone": "+1234567890",
  "website": "https://myrestaurant.com",
  "is_active": true,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

### POST /restaurants

Create a new restaurant.

**Request:**
```json
{
  "name": "New Restaurant",
  "description": "A brand new restaurant",
  "address": "456 New St, Newtown, NT",
  "phone": "+0987654321",
  "website": "https://newrestaurant.com"
}
```

**Response:**
```json
{
  "id": "uuid",
  "owner_id": "uuid",
  "name": "New Restaurant",
  "description": "A brand new restaurant",
  "logo_url": null,
  "address": "456 New St, Newtown, NT",
  "phone": "+0987654321",
  "website": "https://newrestaurant.com",
  "is_active": true,
  "created_at": "2023-01-02T00:00:00.000Z",
  "updated_at": "2023-01-02T00:00:00.000Z"
}
```

### PATCH /restaurants/:id

Update a restaurant.

**Request:**
```json
{
  "name": "Updated Restaurant Name",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": "uuid",
  "owner_id": "uuid",
  "name": "Updated Restaurant Name",
  "description": "Updated description",
  "logo_url": "https://example.com/logo.jpg",
  "address": "123 Main St, Anytown, AN",
  "phone": "+1234567890",
  "website": "https://myrestaurant.com",
  "is_active": true,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-03T00:00:00.000Z"
}
```

### DELETE /restaurants/:id

Delete a restaurant.

**Response:**
```json
{
  "success": true
}
```

## Menu Endpoints

### GET /restaurants/:restaurantId/menus

Get all menus for a restaurant.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "restaurant_id": "uuid",
      "name": "Main Menu",
      "description": "Our regular menu",
      "is_active": true,
      "is_default": true,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /menus/:id

Get a specific menu by ID.

**Response:**
```json
{
  "id": "uuid",
  "restaurant_id": "uuid",
  "name": "Main Menu",
  "description": "Our regular menu",
  "is_active": true,
  "is_default": true,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

### POST /restaurants/:restaurantId/menus

Create a new menu for a restaurant.

**Request:**
```json
{
  "name": "Special Menu",
  "description": "Our special menu",
  "is_default": false
}
```

**Response:**
```json
{
  "id": "uuid",
  "restaurant_id": "uuid",
  "name": "Special Menu",
  "description": "Our special menu",
  "is_active": true,
  "is_default": false,
  "created_at": "2023-01-02T00:00:00.000Z",
  "updated_at": "2023-01-02T00:00:00.000Z"
}
```

### PATCH /menus/:id

Update a menu.

**Request:**
```json
{
  "name": "Updated Menu Name",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": "uuid",
  "restaurant_id": "uuid",
  "name": "Updated Menu Name",
  "description": "Updated description",
  "is_active": true,
  "is_default": true,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-03T00:00:00.000Z"
}
```

### DELETE /menus/:id

Delete a menu.

**Response:**
```json
{
  "success": true
}
```

## Category Endpoints

### GET /menus/:menuId/categories

Get all categories for a menu.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "menu_id": "uuid",
      "name": "Appetizers",
      "description": "Starters and small plates",
      "display_order": 1,
      "is_active": true,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /menus/:menuId/categories

Create a new category for a menu.

**Request:**
```json
{
  "name": "Desserts",
  "description": "Sweet treats",
  "display_order": 3
}
```

**Response:**
```json
{
  "id": "uuid",
  "menu_id": "uuid",
  "name": "Desserts",
  "description": "Sweet treats",
  "display_order": 3,
  "is_active": true,
  "created_at": "2023-01-02T00:00:00.000Z",
  "updated_at": "2023-01-02T00:00:00.000Z"
}
```

### PATCH /categories/:id

Update a category.

**Request:**
```json
{
  "name": "Updated Category Name",
  "display_order": 2
}
```

**Response:**
```json
{
  "id": "uuid",
  "menu_id": "uuid",
  "name": "Updated Category Name",
  "description": "Starters and small plates",
  "display_order": 2,
  "is_active": true,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-03T00:00:00.000Z"
}
```

### DELETE /categories/:id

Delete a category.

**Response:**
```json
{
  "success": true
}
```

## Item Endpoints

### GET /categories/:categoryId/items

Get all items for a category.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "category_id": "uuid",
      "name": "Garlic Bread",
      "description": "Toasted bread with garlic butter",
      "price": 5.99,
      "image_url": "https://example.com/garlic-bread.jpg",
      "is_available": true,
      "display_order": 1,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /categories/:categoryId/items

Create a new item for a category.

**Request:**
```json
{
  "name": "Nachos",
  "description": "Tortilla chips with cheese and toppings",
  "price": 8.99,
  "display_order": 2
}
```

**Response:**
```json
{
  "id": "uuid",
  "category_id": "uuid",
  "name": "Nachos",
  "description": "Tortilla chips with cheese and toppings",
  "price": 8.99,
  "image_url": null,
  "is_available": true,
  "display_order": 2,
  "created_at": "2023-01-02T00:00:00.000Z",
  "updated_at": "2023-01-02T00:00:00.000Z"
}
```

### PATCH /items/:id

Update an item.

**Request:**
```json
{
  "name": "Updated Item Name",
  "price": 6.99
}
```

**Response:**
```json
{
  "id": "uuid",
  "category_id": "uuid",
  "name": "Updated Item Name",
  "description": "Toasted bread with garlic butter",
  "price": 6.99,
  "image_url": "https://example.com/garlic-bread.jpg",
  "is_available": true,
  "display_order": 1,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-03T00:00:00.000Z"
}
```

### PATCH /items/:id/availability

Toggle the availability of an item.

**Request:**
```json
{
  "is_available": false
}
```

**Response:**
```json
{
  "id": "uuid",
  "is_available": false,
  "updated_at": "2023-01-03T00:00:00.000Z"
}
```

### DELETE /items/:id

Delete an item.

**Response:**
```json
{
  "success": true
}
```

## Item Options Endpoints

### GET /items/:itemId/options

Get all options for an item.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "item_id": "uuid",
      "name": "Add Cheese",
      "price_adjustment": 1.50,
      "is_active": true,
      "display_order": 1,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /items/:itemId/options

Create a new option for an item.

**Request:**
```json
{
  "name": "Add Bacon",
  "price_adjustment": 2.00,
  "display_order": 2
}
```

**Response:**
```json
{
  "id": "uuid",
  "item_id": "uuid",
  "name": "Add Bacon",
  "price_adjustment": 2.00,
  "is_active": true,
  "display_order": 2,
  "created_at": "2023-01-02T00:00:00.000Z",
  "updated_at": "2023-01-02T00:00:00.000Z"
}
```

### PATCH /item-options/:id

Update an item option.

**Request:**
```json
{
  "name": "Extra Cheese",
  "price_adjustment": 1.75
}
```

**Response:**
```json
{
  "id": "uuid",
  "item_id": "uuid",
  "name": "Extra Cheese",
  "price_adjustment": 1.75,
  "is_active": true,
  "display_order": 1,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-03T00:00:00.000Z"
}
```

### DELETE /item-options/:id

Delete an item option.

**Response:**
```json
{
  "success": true
}
```

## Subscription Endpoints

### GET /subscriptions

Get all subscriptions for the current user.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "profile_id": "uuid",
      "restaurant_id": "uuid",
      "stripe_subscription_id": "sub_123456",
      "status": "active",
      "current_period_start": "2023-01-01T00:00:00.000Z",
      "current_period_end": "2023-02-01T00:00:00.000Z",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "restaurant": {
        "name": "My Restaurant"
      }
    }
  ]
}
```

### POST /restaurants/:restaurantId/subscribe

Create a subscription for a restaurant.

**Request:**
```json
{
  "paymentMethodId": "pm_123456"
}
```

**Response:**
```json
{
  "id": "uuid",
  "profile_id": "uuid",
  "restaurant_id": "uuid",
  "stripe_subscription_id": "sub_123456",
  "status": "active",
  "current_period_start": "2023-01-02T00:00:00.000Z",
  "current_period_end": "2023-02-02T00:00:00.000Z",
  "created_at": "2023-01-02T00:00:00.000Z",
  "updated_at": "2023-01-02T00:00:00.000Z"
}
```

### DELETE /subscriptions/:id

Cancel a subscription.

**Response:**
```json
{
  "success": true
}
```

## Storage Endpoints

### POST /storage/upload

Upload a file to storage.

**Request (multipart/form-data):**
```
file: [binary data]
bucket: "menu-items"
path: "restaurant-id/item-id.jpg"
```

**Response:**
```json
{
  "path": "restaurant-id/item-id.jpg",
  "url": "https://project-ref.supabase.co/storage/v1/object/public/menu-items/restaurant-id/item-id.jpg"
}
```

### DELETE /storage/files

Delete a file from storage.

**Request:**
```json
{
  "bucket": "menu-items",
  "path": "restaurant-id/item-id.jpg"
}
```

**Response:**
```json
{
  "success": true
}
```

## Public Menu API

### GET /public/menus/:id

Get a public view of a menu (no authentication required).

**Response:**
```json
{
  "id": "uuid",
  "restaurant_id": "uuid",
  "name": "Main Menu",
  "description": "Our regular menu",
  "restaurant": {
    "name": "My Restaurant",
    "logo_url": "https://example.com/logo.jpg"
  },
  "categories": [
    {
      "id": "uuid",
      "name": "Appetizers",
      "description": "Starters and small plates",
      "display_order": 1,
      "items": [
        {
          "id": "uuid",
          "name": "Garlic Bread",
          "description": "Toasted bread with garlic butter",
          "price": 5.99,
          "image_url": "https://example.com/garlic-bread.jpg",
          "is_available": true,
          "display_order": 1,
          "options": [
            {
              "id": "uuid",
              "name": "Add Cheese",
              "price_adjustment": 1.50,
              "display_order": 1
            }
          ]
        }
      ]
    }
  ]
}
```

## Webhook Endpoints

### POST /webhooks/stripe

Handle Stripe webhook events.

**Note:** This endpoint is implemented as a Supabase Edge Function and expects Stripe's webhook signature in the request headers.

**Example Stripe Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## API Conventions

- All endpoints that require authentication should include an `Authorization` header with a bearer token
- All endpoints return JSON responses
- Successful responses have a 2xx status code
- Error responses have a 4xx or 5xx status code and include an `error` field with a message
- List endpoints support pagination with `limit` and `offset` query parameters
- List endpoints may support filtering and sorting with additional query parameters
- Timestamps are in ISO 8601 format with UTC timezone

## Error Handling

Error responses follow this format:

```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required or insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server-side error 