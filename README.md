# Sebastian Brinkworth - CV/Portfolio

A modern, responsive CV/Portfolio website built with Vite, TypeScript, HTML, CSS, and JavaScript.

## 🚀 Features

- **Modern Design**: Clean, minimalist aesthetic with smooth animations
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Responsive**: Optimized for all screen sizes
- **Interactive Background**: Animated vector field that follows cursor
- **Modular Architecture**: Well-organized codebase for easy maintenance
- **Photo Gallery**: Motion.dev-inspired lightbox with spring physics animations
- **Smooth Page Transitions**: Seamless navigation between pages

## 📁 Project Structure

```
cv/
├── index.html             # Main CV page
├── gallery.html           # Photo gallery page
├── css/                   # Stylesheets
├── ts/                    # TypeScript source files
│   ├── main.ts           # Main page entry point
│   ├── gallery-page.ts   # Gallery page with lightbox
│   ├── theme.ts          # Theme toggle logic
│   ├── timeline.ts       # Timeline rendering from JSON
│   ├── skills.ts         # Skills rendering from JSON
│   ├── vector-field.ts   # Background animation
│   ├── utils.ts          # Shared utilities
│   └── router.ts         # SPA routing logic
├── data/                  # JSON data files
├── tests/                 # Test suite (Vitest)
├── scripts/               # Build/optimization scripts
├── vite.config.ts        # Vite configuration
├── package.json          # Dependencies and scripts
└── .gitignore
```

## 🛠️ Development

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
# Visit http://localhost:5173
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run serve
# Visit http://localhost:4173
```

## 📝 Adding Content

### Adding Timeline Entries

Edit `data/timeline.json`:
```json
{
  "dates": "2025 - Present",
  "role": "Your Role",
  "org": "Company Name",
  "location": "City, Country",
  "desc": "Description of your work..."
}
```

### Adding Skills

Edit `data/skills.json`:
```json
{
  "icon": "code",
  "label": "Your Skill"
}
```

Icons come from [Material Symbols](https://fonts.google.com/icons)

### Adding Photo Gallery

1. Add images to `assets/images/gallery/`
2. Populate `data/gallery.json`:
```json
{
  "src": "assets/images/gallery/my-photo.jpg",
  "thumbnail": "assets/images/gallery/my-photo-thumb.jpg",
  "title": "Project Title",
  "description": "Brief description of this project",
  "alt": "Descriptive alt text",
  "ratio": "square"
}
```

**Gallery Features:**
- **Motion.dev-inspired lightbox**: Smooth spring physics animations
- **Keyboard navigation**: Use ← → arrows to navigate, ESC to close
- **Touch/swipe support**: Swipe left/right on mobile to navigate
- **Responsive masonry grid**: Adapts from 2-4 columns based on screen size
- **Smooth page transitions**: Seamless navigation between CV and Gallery pages

**Image Ratio Options:**
- `"square"` (default) - Regular grid item
- `"wide"` - Spans 2 columns
- `"tall"` - Spans 2 rows (portrait)

## 🎨 Customization

### Fonts

The project uses Manrope by default. Alternative options are commented in `css/base.css`:
- Inter
- Space Grotesk
- IBM Plex Sans

### Colors

Edit CSS variables in `css/base.css`:
```css
:root {
  --primary: 145 60 20;    /* Primary accent color */
  --bg: 253 251 247;       /* Background color */
  --fg: 17 19 24;          /* Foreground/text color */
  --muted: 99 111 136;     /* Secondary text color */
}
```

## 📦 Deployment

This is a static site that can be deployed anywhere:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting

## 🔧 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- View Transition API gracefully degrades on unsupported browsers

## 📝 License

© 2025 Sebastian Brinkworth. All rights reserved.