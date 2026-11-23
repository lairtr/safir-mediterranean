/**
 * All restaurant content in one place. Edit this file to change
 * phone, hours, links, menus or photos — no template changes needed.
 * Image paths point to /public/images (run `npm run fetch-assets` once).
 */
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

  hours: '11:00 AM - 10:00 PM',

  // The live site links to two different Instagram handles; both kept as-is.
  instagram: 'https://www.instagram.com/safirmediterranean_lic/',
  instagramAlt: 'https://www.instagram.com/safir_lic/',

  cateringUrl: 'https://www.ezcater.com/catering/pvt/safir-mediterranean-3?fcv=1',

  copyright: '© 2022 Safir Mediterranean',
  credit: { label: 'Developed by Authorize Local', url: 'https://www.authorizelocal.com' },

  logo: 'images/logo.png',
  logoWhite: 'images/logo-white.png',

  heroSlides: [
    { src: 'images/hero-masa.jpeg', alt: 'A table full of Safir dishes' },
    { src: 'images/hero-lamb-chops.jpeg', alt: 'Lamb chops' },
    { src: 'images/hero-homemade-bread.jpeg', alt: 'Homemade bread' },
  ],

  home: {
    about: {
      title: 'About Us',
      text: 'With a combination of luxury of taste and affordability. Safir Mediterranean offers a comfortable dining experience with a melding of authentic Turkish flavors, ingredients, and culture.',
    },
    band1: 'images/band-octopus.jpeg',
    irresistible: {
      title: 'Irrersistable',
      text: 'We’re offering a wide range of delightful meals with Turkish and Mediterranean flavors, served in a unique and one of the most charming locations in Long Island City, NY.',
    },
    band2: 'images/band-greek-salad.jpeg',
    menu: {
      title: 'Menu',
      text: 'Although our menu is more popular with our variety of kebabs and pides, we offer a wide variety of healthy and vegetarian appetizers and main dishes.',
    },
  },

  deliveryPartners: [
    { name: 'DoorDash', logo: 'images/doordash.png', url: 'https://www.doordash.com/store/safir-mediterranean-queens-2578388' },
    { name: 'Seamless', logo: 'images/seamless.png', url: 'https://www.seamless.com/menu/safir-47-31-vernon-blvd-queens/4380976' },
    { name: 'Uber Eats', logo: 'images/ubereats.png', url: 'https://www.ubereats.com/store/safir/ear8DddWSre9TdiRovGlqw' },
    { name: 'Fantuan', logo: 'images/fantuan.png', url: 'https://www.fantuanorder.com/store/safir-mediterranean/us-13388' },
    { name: 'ChowNow', logo: 'images/chownow.jpg', url: 'https://www.chownow.com/order/37296/locations/56742' },
  ],

  restaurantGuruBadge: 'images/restaurant-guru.png',

  menus: [
    {
      id: 'main',
      label: 'Main Menu',
      images: [
        { src: 'images/menu/safir1.png', alt: 'Safir Mediterranean Main Menu Page 1' },
        { src: 'images/menu/safir2.png', alt: 'Safir Mediterranean Main Menu Page 2' },
      ],
    },
    {
      id: 'breakfast',
      label: 'Breakfast Menu',
      images: [{ src: 'images/menu/safir3.png', alt: 'Safir Mediterranean Breakfast Menu' }],
    },
    {
      id: 'specials',
      label: "This Week's Specials",
      images: [{ src: 'images/menu/safir4.png', alt: "Safir Mediterranean This Week's Specials" }],
    },
  ],
} as const;
