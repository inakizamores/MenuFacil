# Complex Form Controls Documentation

This document provides comprehensive documentation for using the complex form controls (`ArrayField` and `ObjectField`) in the MenuFácil application. These components are designed to work with react-hook-form and Zod validation to handle complex data structures like arrays and nested objects.

## Table of Contents

1. [Installation and Dependencies](#installation-and-dependencies)
2. [ArrayField Component](#arrayfield-component)
   - [Props](#arrayfield-props)
   - [Usage Examples](#arrayfield-examples)
   - [Validation with Zod](#arrayfield-validation)
3. [ObjectField Component](#objectfield-component)
   - [Props](#objectfield-props)
   - [Usage Examples](#objectfield-examples)
   - [Validation with Zod](#objectfield-validation)
4. [Using Components Together](#using-components-together)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Installation and Dependencies

These components rely on the following dependencies:

- react-hook-form
- @hookform/resolvers/zod
- zod

Make sure these are installed in your project.

## ArrayField Component

The `ArrayField` component provides a user interface for managing array data in forms. It allows users to add, remove, and view items in an array.

### ArrayField Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | The name of the field in the form state |
| label | string | Yes | The label displayed above the field |
| placeholder | string | No | Placeholder text for the input field (default: "Add new item") |
| description | string | No | Description text displayed below the label |
| emptyMessage | string | No | Message shown when the array is empty (default: "No items added yet") |
| maxItems | number | No | Maximum number of items allowed in the array (default: 10) |

### ArrayField Examples

#### Basic Usage

```tsx
import { ArrayField } from '@/app/components/ui/ArrayField';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define schema with Zod
const formSchema = z.object({
  ingredients: z.array(z.string())
});

type FormValues = z.infer<typeof formSchema>;

function IngredientForm() {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: []
    }
  });

  const onSubmit = (data: FormValues) => {
    console.log('Form data:', data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ArrayField
          name="ingredients"
          label="Ingredients"
          placeholder="Add an ingredient"
          description="List all ingredients in this dish"
          emptyMessage="No ingredients added yet"
          maxItems={20}
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}
```

### ArrayField Validation

You can use Zod to validate array fields with various rules:

```tsx
const formSchema = z.object({
  // Require at least 2 ingredients
  ingredients: z.array(z.string())
    .min(2, "At least 2 ingredients are required")
    .max(20, "Maximum 20 ingredients allowed"),
    
  // Validate string format (e.g., for dietary options)
  dietaryOptions: z.array(
    z.string()
      .min(2, "Option must be at least 2 characters")
      .refine(val => !val.includes('!'), "Options cannot include exclamation marks")
  )
});
```

## ObjectField Component

The `ObjectField` component provides a user interface for managing nested object data in forms. It allows users to edit multiple related fields that are part of a single object.

### ObjectField Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | The name of the field in the form state |
| label | string | Yes | The label displayed above the field group |
| description | string | No | Description text displayed below the label |
| fields | FieldConfig[] | Yes | Array of field configurations |
| columns | 1 \| 2 \| 3 \| 4 | No | Number of columns for the field layout (default: 2) |

#### FieldConfig Interface

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| key | string | Yes | The field key within the object |
| label | string | Yes | The field label |
| type | string | No | HTML input type (default: "text") |
| placeholder | string | No | Placeholder text |
| suffix | string | No | Text suffix displayed after the input (e.g., "g" for grams) |
| description | string | No | Field-specific description |

### ObjectField Examples

#### Basic Usage

```tsx
import { ObjectField } from '@/app/components/ui/ObjectField';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define schema with Zod
const formSchema = z.object({
  nutritionalInfo: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional()
  })
});

type FormValues = z.infer<typeof formSchema>;

function NutritionForm() {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nutritionalInfo: {
        calories: undefined,
        protein: undefined,
        carbs: undefined,
        fat: undefined
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    console.log('Form data:', data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ObjectField
          name="nutritionalInfo"
          label="Nutritional Information"
          description="Enter nutritional facts per serving"
          fields={[
            { key: 'calories', label: 'Calories', type: 'number', suffix: 'kcal' },
            { key: 'protein', label: 'Protein', type: 'number', suffix: 'g' },
            { key: 'carbs', label: 'Carbs', type: 'number', suffix: 'g' },
            { key: 'fat', label: 'Fat', type: 'number', suffix: 'g' }
          ]}
          columns={2}
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}
```

### ObjectField Validation

You can use Zod to validate nested object fields:

```tsx
const formSchema = z.object({
  nutritionalInfo: z.object({
    calories: z.number().min(0, "Cannot be negative").optional(),
    protein: z.number().min(0).max(100, "Must be between 0-100g").optional(),
    carbs: z.number().min(0).optional(),
    fat: z.number().min(0).optional()
  })
  // Create refinements across fields
  .refine(data => {
    // If calories are provided, at least one other field should be provided
    if (data.calories && !data.protein && !data.carbs && !data.fat) {
      return false;
    }
    return true;
  }, {
    message: "If calories are provided, include at least one other nutritional value",
    path: ["calories"]
  })
});
```

## Using Components Together

You can combine `ArrayField` and `ObjectField` components in the same form to handle complex data structures:

```tsx
import { ArrayField } from '@/app/components/ui/ArrayField';
import { ObjectField } from '@/app/components/ui/ObjectField';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Complex form schema
const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  ingredients: z.array(z.string()).min(1, "At least one ingredient is required"),
  nutritionalInfo: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional()
  })
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

function MenuItemForm() {
  const methods = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      ingredients: [],
      nutritionalInfo: {
        calories: undefined,
        protein: undefined,
        carbs: undefined,
        fat: undefined
      }
    }
  });

  const onSubmit = (data: MenuItemFormValues) => {
    console.log('Form data:', data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {/* Other form fields */}
        <input {...methods.register('name')} placeholder="Menu Item Name" />
        
        {/* Array field for ingredients */}
        <ArrayField
          name="ingredients"
          label="Ingredients"
          placeholder="Add an ingredient"
        />
        
        {/* Object field for nutritional information */}
        <ObjectField
          name="nutritionalInfo"
          label="Nutritional Information"
          fields={[
            { key: 'calories', label: 'Calories', type: 'number', suffix: 'kcal' },
            { key: 'protein', label: 'Protein', type: 'number', suffix: 'g' },
            { key: 'carbs', label: 'Carbs', type: 'number', suffix: 'g' },
            { key: 'fat', label: 'Fat', type: 'number', suffix: 'g' }
          ]}
        />
        
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}
```

## Best Practices

1. **Form Provider Context:**
   - Always wrap your form with `FormProvider` from react-hook-form.
   - Include the form methods created with `useForm`.

2. **Zod Schema:**
   - Define a comprehensive Zod schema that matches your form structure.
   - Use the schema with the zodResolver to enable validation.

3. **Default Values:**
   - Always provide default values that match the expected data structure.
   - For arrays, use an empty array `[]`.
   - For objects, provide an object with all expected properties (even if undefined).

4. **Field Naming:**
   - Ensure the `name` prop for ArrayField and ObjectField components exactly matches your schema.
   - Nested paths are handled automatically by the components.

5. **Validation Messages:**
   - Provide helpful validation messages in your Zod schema.
   - Both components automatically display validation errors.

6. **Responsive Design:**
   - Use the `columns` prop in ObjectField to control layout responsiveness.
   - The components are mobile-friendly by default.

7. **User Experience:**
   - Provide clear labels and descriptions.
   - Use appropriate max limits for arrays to prevent form overload.

## Troubleshooting

### Common Issues

1. **Validation Errors Not Showing:**
   - Ensure you've wrapped your form with `FormProvider`.
   - Check that your Zod schema matches the form structure.
   - Verify your default values match the schema types.

2. **Data Not Being Submitted Correctly:**
   - Confirm field names match exactly between form and schema.
   - Check console for any validation errors.
   - Ensure the form is submitting with `handleSubmit`.

3. **Form Rerenders Too Often:**
   - Use `React.memo` on child components if performance is an issue.
   - Consider using form state optimization techniques from react-hook-form.

4. **Type Errors:**
   - Ensure your TypeScript types are derived from the Zod schema using `z.infer<typeof yourSchema>`.
   - Make sure the types match between your component props and form values.

### Support

For more help, refer to:
- React Hook Form documentation: [https://react-hook-form.com/](https://react-hook-form.com/)
- Zod documentation: [https://github.com/colinhacks/zod](https://github.com/colinhacks/zod)
- Component source code in `app/components/ui/ArrayField.tsx` and `app/components/ui/ObjectField.tsx` 