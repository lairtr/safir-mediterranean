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

  // The live site links to two different Instagram handles; both kept as-is.
  instagram: 'https://www.instagram.com/safirmediterranean_lic/',
  instagramAlt: 'https://www.instagram.com/safir_lic/',

  cateringUrl: 'https://www.ezcater.com/catering/pvt/safir-mediterranean-3?fcv=1',

  copyright: '© 2022 Safir Mediterranean',
  credit: { label: 'Developed by Authorize Local', url: 'https://www.authorizelocal.com' },

  logo: 'images/logo.png',
  logoWhite: 'images/logo-white.png',

  // Hero carousel: same three photos and framing as the original site.
  // Responsive WebP versions are generated from the full-resolution masters in
  // image-src/ by `npm run optimize-images`.
  heroSlides: [
    { ...img('hero-masa', [640, 1024, 1600, 2400, 3024]), alt: 'A table full of Safir dishes: pides, lahmacun, kebabs and mezes', position: 'center' },
    { ...img('hero-lamb-chops', [640, 1024, 1600, 2400, 3024]), alt: 'Grilled lamb chops with rice', position: '0% 70%' },
    { ...img('hero-homemade-bread', [640, 1024, 1600, 2400, 3024]), alt: 'Freshly baked homemade bread', position: 'center' },
  ],

  intro: 'Authentic Turkish & Mediterranean kitchen in Long Island City',

  home: {
    about: {
      title: 'About Us',
      text: 'With a combination of luxury of taste and affordability, Safir Mediterranean offers a comfortable dining experience with a melding of authentic Turkish flavors, ingredients, and culture.',
      text2: 'We offer a wide range of delightful meals with Turkish and Mediterranean flavors, served in one of the most charming locations in Long Island City, NY.',
      image: { ...img('dining-room', [600, 1200]), alt: 'The Safir Mediterranean dining room' },
    },
    menu: {
      title: 'Signature Dishes',
      text: 'Although our menu is most popular for its kebabs and pides, we offer a wide variety of healthy and vegetarian appetizers and main dishes.',
    },
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
