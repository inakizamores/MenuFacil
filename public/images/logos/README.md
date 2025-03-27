# MenuFacil Logo Files

This document outlines all logo files for the MenuFacil brand, organized by category and variation.

## Folder Structure

```
public/images/logos/
├── primary/      (Primary brand logos)
├── secondary/    (Alternative layouts)
├── submark/      (Compact variations)
├── icons/        (Minimalist marks)
├── favicon/      (Browser and device icons)
└── README.md     (This file)
```

## Current Logo Files

### 1. Primary Logo (`/primary`)

| File Name | Format | Description | Status |
|-----------|--------|-------------|--------|
| `primary-logo-clean.svg` | SVG | Vector version of clean logo | ✅ Available |
| `primary-logo-clean.png` | PNG | Clean logo with brand colors | ✅ Available |
| `primary-logo-clean-white.png` | PNG | White version for dark backgrounds | ✅ Available |
| `primary-logo-clean-black.png` | PNG | Black version for monochrome use | ✅ Available |
| `primary-logo-tagline.svg` | SVG | Vector version with tagline | ✅ Available |
| `primary-logo-tagline.png` | PNG | Logo with tagline in brand colors | ✅ Available |
| `primary-logo-tagline-white.png` | PNG | White tagline version | ✅ Available |
| `primary-logo-tagline-black.png` | PNG | Black tagline version | ✅ Available |
| `primary-logo-cta.svg` | SVG | Vector version with call to action | ✅ Available |
| `primary-logo-cta.png` | PNG | CTA version in brand colors | ✅ Available |
| `primary-logo-cta-white.png` | PNG | White CTA version | ✅ Available |
| `primary-logo-cta-black.png` | PNG | Black CTA version | ✅ Available |

### 2. Secondary Logo (`/secondary`)

| File Name | Format | Description | Status |
|-----------|--------|-------------|--------|
| `secondary-logo-clean.svg` | SVG | Vector stacked/alternate layout | ✅ Available |
| `secondary-logo-clean.png` | PNG | Stacked layout in brand colors | ✅ Available |
| `secondary-logo-clean-white.png` | PNG | White stacked version | ✅ Available |
| `secondary-logo-clean-black.png` | PNG | Black stacked version | ✅ Available |
| `secondary-logo-domain.svg` | SVG | Vector version with domain | ✅ Available |
| `secondary-logo-domain.png` | PNG | Domain version in brand colors | ✅ Available |
| `secondary-logo-domain-white.png` | PNG | White domain version | ✅ Available |
| `secondary-logo-domain-black.png` | PNG | Black domain version | ✅ Available |

### 3. Submark (`/submark`)

| File Name | Format | Description | Status |
|-----------|--------|-------------|--------|
| `submark-compact.png` | PNG | Compact version in brand colors | ✅ Available |
| `submark-compact-white.png` | PNG | White compact version | ✅ Available |
| `submark-compact-black.png` | PNG | Black compact version | ✅ Available |
| `submark-wide.png` | PNG | Horizontal compact in brand colors | ✅ Available |
| `submark-wide-white.png` | PNG | White horizontal compact | ✅ Available |
| `submark-wide-black.png` | PNG | Black horizontal compact | ✅ Available |
| `submark-compact.svg` | SVG | Vector compact version | ❌ Missing |
| `submark-wide.svg` | SVG | Vector horizontal version | ❌ Missing |

### 4. Icons (`/icons`)

| File Name | Format | Description | Status |
|-----------|--------|-------------|--------|
| `icon-square.png` | PNG | Square app icon | ✅ Available |
| `icon-circle.png` | PNG | Circular social media icon | ✅ Available |
| `icon-shape.png` | PNG | Standalone brand mark | ✅ Available |
| `icon-shape.svg` | SVG | Vector standalone mark | ✅ Available |
| `icon-square.svg` | SVG | Vector square icon | ❌ Missing |
| `icon-circle.svg` | SVG | Vector circle icon | ❌ Missing |
| `icon-square-white.png` | PNG | White square version | ❌ Missing |
| `icon-circle-white.png` | PNG | White circle version | ❌ Missing |
| `icon-shape-white.png` | PNG | White shape version | ❌ Missing |

### 5. Favicon (`/favicon`)

| File Name | Format | Description | Status |
|-----------|--------|-------------|--------|
| `favicon.ico` | ICO | Multi-size browser favicon | ✅ Available |
| `favicon.svg` | SVG | Vector favicon | ✅ Available |
| `favicon-96x96.png` | PNG | 96×96 favicon | ✅ Available |
| `apple-touch-icon.png` | PNG | iOS home screen icon | ✅ Available |
| `web-app-manifest-192x192.png` | PNG | PWA 192×192 icon | ✅ Available |
| `web-app-manifest-512x512.png` | PNG | PWA 512×512 icon | ✅ Available |
| `site.webmanifest` | JSON | Web app manifest file | ✅ Available |

## Missing Files & Recommendations

The following files would enhance the logo collection:

1. **SVG versions of submarks**:
   - `submark-compact.svg`
   - `submark-wide.svg`

2. **SVG versions of all icons**:
   - `icon-square.svg`
   - `icon-circle.svg`

3. **White versions of icons**:
   - `icon-square-white.png`
   - `icon-circle-white.png`
   - `icon-shape-white.png` 

## Usage Guidelines

### Web Usage

- For web components, use SVG versions whenever possible
- Apply CSS for color variations instead of using different files
- For favicons, link all sizes in the HTML:

```html
<link rel="icon" href="/images/logos/favicon/favicon.ico" sizes="any">
<link rel="icon" href="/images/logos/favicon/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/images/logos/favicon/apple-touch-icon.png">
<link rel="manifest" href="/images/logos/favicon/site.webmanifest">
```