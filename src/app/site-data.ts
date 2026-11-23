/**
 * All restaurant content in one place. Edit this file to change
 * phone, hours, links, menus or photos — no template changes needed.
 * Logos/menus live in /public/images; photos are generated into
 * /public/images/opt from /image-src (run `npm run optimize-images`).
 */
/** Responsive image set for public/images/opt/<name>-<width>.webp */
function img(name: string, widths: number[]) {
  return {
    src: `images/opt/${name}-${widths[Math.min(1, widths.length - 1)]}.webp`,
    srcset: widths.map((w) => `images/opt/${name}-${w}.webp ${w}w`).join(', '),
  };
}

export const SITE = {
  name: 'Safir Mediterranean',
  tagline: 'Where Istanbul meets Long Island City',

  address: {
    short: '47-31 Vernon Blvd. LIC, NY 11101',
    line1: '47-31 Vernon Blvd',
    line2: 'LIC, NY 11101',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=47-31+Vernon+Blvd,+Long+Island+City,+NY+11101',
  },

  phone: {
    display: '(347) 924-9152',
    short: '347-924-9152',
    tel: 'tel:+13479249152',
  },

  // Open seven days a week. openingHours drives the "Open now" badge and the
  // structured data in index.html (update both if hours change).
  openingHours: { open: '11:00', close: '22:00', timeZone: 'America/New_York' },
  hours: 'Daily, 11:00 AM – 10:00 PM',
  hoursShort: 'Daily 11 AM – 10 PM',

  // The old WordPress site linked to two handles; safirmediterranean_lic
  // doesn't resolve, so only safir_lic is used.
  instagram: 'https://www.instagram.com/safir_lic/',
  instagramHandle: '@safir_lic',
  // Photos for the "Follow us" strip. These are the restaurant's own photos
  // (not a live feed); each tile links to the Instagram profile.
  instagramGrid: [
    { ...img('ig-octopus', [320, 640]), alt: 'Grilled octopus' },
    { ...img('ig-spinach-pide', [320, 640]), alt: 'Spinach pide' },
    { ...img('ig-katmer', [320, 640]), alt: 'Katmer with pistachios and ice cream' },
    { ...img('ig-salmon', [320, 640]), alt: 'Grilled salmon with arugula salad' },
    { ...img('ig-sigara-borek', [320, 640]), alt: 'Sigara borek' },
    { ...img('ig-balloon-bread', [320, 640]), alt: 'Balloon bread' },
  ],

  cateringUrl: 'https://www.ezcater.com/catering/pvt/safir-mediterranean-3?fcv=1',

  copyright: '© 2022 Safir Mediterranean',
  credit: { label: 'Developed by Authorize Local', url: 'https://www.authorizelocal.com' },

  logo: 'images/logo.png',
  logoWhite: 'images/logo-white.png',

  // Hero carousel. Responsive WebP versions are generated from the
  // full-resolution masters in image-src/ by `npm run optimize-images`.
  // `position` is the CSS object-position used when the photo is cropped.
  heroSlides: [
    { ...img('hero-masa', [640, 1024, 1600, 2400, 3024]), alt: 'A table full of Safir dishes: pides, lahmacun, kebabs and mezes', position: 'center' },
    { ...img('hero-mix-grill', [640, 1024, 1600, 2400, 3024]), alt: 'Mix grill platter with lamb and chicken adana, chops, shish and doner', position: '50% 45%' },
    { ...img('hero-lamb-chops', [640, 1024, 1600, 2400, 3024]), alt: 'Grilled lamb chops with rice', position: '0% 70%' },
    { ...img('hero-iskender', [640, 1024, 1600, 2400, 3024]), alt: 'Iskender kebab with tomato sauce and garlic yogurt', position: '50% 55%' },
    { ...img('hero-mixed-appetizers', [640, 1024, 1600, 2400, 3024]), alt: 'Mixed appetizers: hummus, babaghanoush, haydari and muhammara', position: '50% 30%' },
    { ...img('hero-homemade-bread', [640, 1024, 1600, 2400, 3024]), alt: 'Freshly baked homemade bread', position: 'center' },
  ],

  intro: 'Authentic Turkish & Mediterranean kitchen in Long Island City',

  home: {
    menu: {
      title: 'Signature Dishes',
      text: 'Our menu is most popular for its kebabs and pides, but we also offer a wide variety of healthy, vegetarian appetizers and main dishes.',
    },
  },

  journey: {
    title: 'From Istanbul to Long Island City',
    text: 'Turkish flavors that traveled about 5,000 miles — from the Bosphorus to Vernon Blvd.',
  },

  dishes: [
    { name: 'Iskender Kebab', ...img('dish-iskender', [480, 960]) },
    { name: 'Adana Kebab', ...img('dish-adana', [480, 960]) },
    { name: 'Cheese Pide', ...img('dish-cheese-pide', [480, 960]) },
    { name: 'Lahmacun', ...img('dish-lahmacun', [480, 960]) },
    { name: 'Mantı', ...img('dish-manti', [480, 960]) },
    { name: 'Fried Calamari', ...img('dish-calamari', [480, 960]) },
    { name: 'Künefe', ...img('dish-kunefe', [480, 960]) },
    { name: 'Baklava', ...img('dish-baklava', [480, 960]) },
  ],

  deliveryPartners: [
    { name: 'DoorDash', logo: 'images/doordash.png', url: 'https://www.doordash.com/store/safir-mediterranean-queens-2578388' },
    { name: 'Seamless', logo: 'images/seamless.png', url: 'https://www.seamless.com/menu/safir-47-31-vernon-blvd-queens/4380976' },
    { name: 'Uber Eats', logo: 'images/ubereats.png', url: 'https://www.ubereats.com/store/safir/ear8DddWSre9TdiRovGlqw' },
    { name: 'Fantuan', logo: 'images/fantuan.png', url: 'https://www.fantuanorder.com/store/safir-mediterranean/us-13388' },
    { name: 'ChowNow', logo: 'images/chownow.jpg', url: 'https://www.chownow.com/order/37296/locations/56742' },
  ],

  restaurantGuruBadge: 'images/restaurant-guru.png',
} as const;
