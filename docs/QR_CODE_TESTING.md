# QR Code Testing Guide

This document outlines the testing procedures for the QR code generation, management, and analytics features of MenuFácil.

## Prerequisites

- A MenuFácil account with restaurant owner or admin privileges
- At least one restaurant and menu created
- A mobile device for scanning QR codes
- Modern browser (Chrome, Firefox, Safari, or Edge)

## Testing the QR Code Generation

### Single QR Code Generation

1. Navigate to the dashboard for one of your restaurants
2. Select a menu
3. Click on the "QR Codes" tab
4. Click "Create New QR Code"
5. Fill in the form with the following test data:
   - Name: "Test QR Code"
   - Menu: Select an existing menu
   - Design: Choose custom colors (e.g., foreground: #FF0000, background: #FFFFFF)
6. Click "Generate QR Code"

**Expected Results:**
- QR code should be generated and displayed
- QR code should use the colors specified
- QR code should be added to the list of QR codes

### Batch QR Code Generation

1. Navigate to the QR Codes tab
2. Click "Batch Generate"
3. Set the following parameters:
   - Count: 10
   - Prefix: "Table"
   - Colors: Custom selection
4. Click "Generate"

**Expected Results:**
- Progress indicator should be displayed during generation
- 10 QR codes should be created with names "Table 1" through "Table 10"
- QR codes should appear in the list after generation completes
- Generation should complete in a reasonable time (< 10 seconds)

## Testing QR Code Export

### Single QR Code Export

1. Select an individual QR code from the list
2. Click "Export"
3. Test each export format:
   - PNG
   - SVG
   - PDF

**Expected Results:**
- Each format should download correctly
- PNG should be a high-resolution image
- SVG should be a vector file that scales without pixelation
- PDF should be a properly formatted document ready for printing

### Batch QR Code Export

1. Generate at least 5 QR codes using batch generation
2. Click "Download All" button
3. Wait for the ZIP file to be generated

**Expected Results:**
- A ZIP file should download containing:
  - Individual PNG files for each QR code
  - A PDF file containing all QR codes formatted for printing
- File names should match the QR code names
- ZIP file should be properly structured and extractable

## Testing QR Code Scanning and Analytics

### Scan Tracking

1. Export a QR code as PNG
2. Use a mobile device to scan the QR code
3. Verify that the menu loads correctly
4. Return to the dashboard and navigate to the QR code list
5. Check the view count for the scanned QR code

**Expected Results:**
- View count should increase by 1
- In the analytics section, the scan should be recorded with:
  - Correct timestamp
  - Device type (should match the device used for scanning)
  - Source identified as "scan"

### Device Detection

1. Generate and export a QR code
2. Open the QR code URL directly on:
   - A desktop computer
   - A mobile phone
   - A tablet (if available)
3. Check the analytics for the QR code

**Expected Results:**
- Each device type should be correctly identified in the analytics
- View count should increase for each view
- Source should be identified as "direct" for URL visits

### Multiple Sources

1. Generate a new QR code
2. Test accessing it via:
   - Scanning the QR code (source = "scan")
   - Directly entering the URL (source = "direct") 
   - Clicking a shared link with ?source=share parameter (source = "share")
3. Check the analytics breakdown

**Expected Results:**
- Analytics should show the correct source for each view
- Total view count should match the sum of all source types

## Testing Performance

### Large Batch Generation

1. Attempt to generate 50 QR codes in a batch
2. Monitor system performance during generation

**Expected Results:**
- Generation should complete successfully
- UI should remain responsive during generation
- Progress indicator should update smoothly
- Memory usage should remain stable

### Export Performance

1. Generate 20+ QR codes
2. Attempt to download all as a ZIP file

**Expected Results:**
- Export should complete in a reasonable time
- Download should be properly formatted with all files
- Browser should remain stable without crashing

## Bug Reporting

If you encounter any issues during testing, please document them with:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots or videos if applicable
5. Browser/device information
6. Console errors (if any)

Submit bug reports via the project's issue tracker.

## Test Completion Checklist

- [ ] Single QR code generation works correctly
- [ ] Batch QR code generation works correctly
- [ ] PNG export produces high-quality images
- [ ] SVG export produces vector files
- [ ] PDF export produces print-ready documents
- [ ] ZIP export contains all expected files
- [ ] View tracking correctly increments counts
- [ ] Device detection correctly identifies device types
- [ ] Source attribution correctly tracks scan sources
- [ ] Performance remains stable with large batches
- [ ] UI remains responsive during operations 