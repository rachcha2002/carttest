const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const dirs = [
  'public/restaurants',
  'public/testimonials',
  'public/app'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate a colorful SVG for restaurant images
const generateRestaurantImage = (cuisine, color1, color2) => `
<svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" fill="url(#grad)"/>
  <text x="300" y="180" font-family="Inter" font-size="40" font-weight="bold" fill="white" text-anchor="middle">${cuisine}</text>
  <text x="300" y="240" font-family="Inter" font-size="100" fill="white" text-anchor="middle">🍽️</text>
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="600" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
</svg>`;

// Generate a simple avatar SVG for testimonials
const generateTestimonialImage = (name, color) => `
<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="100" fill="${color}"/>
  <text x="100" y="120" font-family="Inter" font-size="60" fill="white" text-anchor="middle">${name[0]}</text>
</svg>`;

// Generate app preview image
const generateAppPreview = () => `
<svg width="300" height="600" viewBox="0 0 300 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="600" rx="40" fill="url(#phone-grad)"/>
  <rect x="20" y="40" width="260" height="520" rx="20" fill="white" fill-opacity="0.1"/>
  <text x="150" y="120" font-family="Inter" font-size="24" font-weight="bold" fill="white" text-anchor="middle">FOODIE APP</text>
  <text x="150" y="280" font-family="Inter" font-size="80" fill="white" text-anchor="middle">📱</text>
  <defs>
    <linearGradient id="phone-grad" x1="0" y1="0" x2="300" y2="600" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f29f05"/>
      <stop offset="100%" stop-color="#ffc107"/>
    </linearGradient>
  </defs>
</svg>`;

// Generate hero background
const generateHeroBackground = () => `
<svg width="1920" height="1080" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1920" height="1080" fill="url(#hero-grad)"/>
  <g opacity="0.1" fill="white">
    ${Array.from({ length: 20 }).map((_, i) => `
      <text x="${Math.random() * 1920}" y="${Math.random() * 1080}" font-size="40">🍕</text>
      <text x="${Math.random() * 1920}" y="${Math.random() * 1080}" font-size="40">🍜</text>
      <text x="${Math.random() * 1920}" y="${Math.random() * 1080}" font-size="40">🍱</text>
      <text x="${Math.random() * 1920}" y="${Math.random() * 1080}" font-size="40">🌮</text>
    `).join('')}
  </g>
  <defs>
    <linearGradient id="hero-grad" x1="0" y1="0" x2="1920" y2="1080" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
</svg>`;

// Restaurant images
const restaurants = [
  { name: 'italian', color1: '#FF6B6B', color2: '#FF8787' },
  { name: 'japanese', color1: '#845EC2', color2: '#B39CD0' },
  { name: 'mexican', color1: '#FF9671', color2: '#FFA400' },
  { name: 'indian', color1: '#F9F871', color2: '#FFA600' }
];

restaurants.forEach(({ name, color1, color2 }) => {
  fs.writeFileSync(
    path.join('public/restaurants', `${name}.svg`),
    generateRestaurantImage(name.toUpperCase(), color1, color2)
  );
});

// Testimonial images
const testimonials = [
  { name: 'Sarah', color: '#f29f05' },
  { name: 'Michael', color: '#ffc107' },
  { name: 'Emily', color: '#e69504' }
];

testimonials.forEach(({ name, color }) => {
  fs.writeFileSync(
    path.join('public/testimonials', `${name.toLowerCase()}.svg`),
    generateTestimonialImage(name, color)
  );
});

// App preview
fs.writeFileSync(
  path.join('public/app', 'preview.svg'),
  generateAppPreview()
);

// Hero background
fs.writeFileSync(
  path.join('public', 'hero-bg.svg'),
  generateHeroBackground()
); 