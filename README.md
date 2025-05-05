# HM Senadheera Waterproofings - Company Seal Generator

This project provides tools to generate a professional company seal for HM Senadheera Waterproofings, which can be used on quotations and other documents.

## Features

- Digital seal with company name, experience, warranty, and guarantee information
- Multiple formats (PNG/JPG) in different sizes
- Interactive web interface to preview and download the seal
- Node.js script for direct generation of seal images
- Integration with the existing quotation system

## Getting Started

### Prerequisites

- Node.js installed on your system
- NPM (Node Package Manager)

### Installation

1. Clone or download this repository
2. Install dependencies by running:

```bash
npm install
```

## Usage

### Interactive Web Interface

To use the interactive web interface to create and download the seal:

1. Run the following command:

```bash
npm start
```

2. Your browser will open with the seal generator page
3. Preview the seal and click either "Download as PNG" or "Download as JPG" to save the image

### Generating Images Directly

To generate the seal images directly to the assets folder:

```bash
npm run generate
```

This will create:
- `assets/hmsenadheera_seal.png` - Full-size PNG version
- `assets/hmsenadheera_seal.jpg` - Full-size JPG version
- `assets/hmsenadheera_seal_small.png` - Smaller version for document use

## Quotation System Integration

The seal is already integrated into the quotation system and will appear in the bottom right corner of generated quotations.

## Customization

If you need to customize the seal:

1. Edit the `create-seal.html` file to change the appearance in the web interface
2. Edit the `generate-seal.js` file to modify the programmatically generated images

## Files

- `create-seal.html` - Interactive web interface for seal generation
- `generate-seal.js` - Node.js script for direct image generation
- `assets/` - Directory containing generated seal images
- `index.html` - Quotation form with seal integration
- `script.js` - JavaScript code for the quotation system
- `styles.css` - Styles for both quotation system and seal

## License

This project is proprietary and for the exclusive use of HM Senadheera Waterproofings. 