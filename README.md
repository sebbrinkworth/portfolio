# Sebastian Brinkworth - CV/Portfolio

A modern, responsive CV/Portfolio website built with vanilla HTML, CSS, and JavaScript.

## 🚀 Features

- **Modern Design**: Clean, minimalist aesthetic with smooth animations
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Responsive**: Optimized for all screen sizes
- **Interactive Background**: Animated vector field that follows cursor
- **Modular Architecture**: Well-organized codebase for easy maintenance
- **Photo Gallery Ready**: Foundation in place for adding a work gallery

## 📁 Project Structure

```
cv/
├── index.html              # Main entry point
├── css/
│   ├── base.css           # CSS variables, resets, typography
│   ├── layout.css         # Container, grid, wrapper styles
│   ├── components.css     # Cards, buttons, avatar, timeline, skills
│   ├── effects.css        # Background animations, grain, themes
│   └── gallery.css        # Photo gallery styles (ready for use)
├── js/
│   ├── main.js            # Entry point, initialization
│   ├── theme.js           # Theme toggle logic
│   ├── timeline.js        # Timeline rendering from JSON
│   ├── skills.js          # Skills rendering from JSON
│   ├── vector-field.js    # Background animation
│   ├── gallery.js         # Gallery functionality (ready for use)
│   └── utils.js           # Shared utilities
├── data/
│   ├── timeline.json      # Professional timeline data
│   ├── skills.json        # Skills data
│   └── gallery.json       # Gallery data (empty, ready to populate)
├── assets/
│   └── images/
│       ├── avatar/        # Profile photos
│       └── gallery/       # Photo gallery images
└── .gitignore
```

## 🛠️ Development

### Prerequisites

- A modern web browser
- A local server (for ES6 modules support)

### Running Locally

#### Option 1: Python
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

#### Option 2: Node.js (http-server)
```bash
npx http-server
# Visit http://localhost:8080
```

#### Option 3: VS Code Live Server
Install the "Live Server" extension and click "Go Live"

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
  "title": "Project Title",
  "description": "Brief description",
  "category": "work"
}
```
3. The gallery section will automatically display (remove `style="display: none;"` from index.html)

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