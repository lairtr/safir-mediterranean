/**
 * The restaurant's menus as text, transcribed from the printed menu images in
 * public/images/menu/ (still shown on the Menu page via "View printed menu").
 * When prices or dishes change, edit this file — and replace the images too,
 * or remove them from `images` so the two never disagree.
 */

export interface MenuItem {
  name: string;
  /** e.g. "2 pcs" — shown in lighter text after the name */
  qty?: string;
  price?: string;
  /** For items with several sizes or variants */
  prices?: { label: string; price: string }[];
  desc?: string;
}

export interface MenuSection {
  id: string;
  title: string;
  /** Short line under the section title (availability, pricing note) */
  note?: string;
  items: MenuItem[];
  /** Compact two-column list instead of name/description cards */
  compact?: boolean;
}

export interface Menu {
  id: string;
  label: string;
  /** Tab label on phones */
  shortLabel: string;
  /** Shown under the menu title, e.g. serving times */
  note?: string;
  sections: MenuSection[];
  images: { src: string; alt: string }[];
}

export const MENU_FOOTNOTES = [
  'Please inform management of any allergies you or your guests may have. Consuming raw or undercooked food may increase your risk of foodborne illness.',
  'For parties of six or more, a 20% gratuity will be automatically added to your bill.',
];

export const MENUS: Menu[] = [
  {
    id: 'main',
    label: 'Main Menu',
    shortLabel: 'Main',
    images: [
      { src: 'images/menu/safir1.png', alt: 'Printed main menu, page 1' },
      { src: 'images/menu/safir2.png', alt: 'Printed main menu, page 2' },
    ],
    sections: [
      {
        id: 'appetizers',
        title: 'Soup & Appetizers',
        items: [
          { name: 'Lentil Soup', price: '8.95', desc: 'Pureed red lentils with Turkish seasonings & herbs' },
          { name: 'Hummus', price: '9.95', desc: 'Chickpea spread with flavored garlic, tahini, olive oil & lemon juice' },
          { name: 'Babaghanoush', price: '9.95', desc: 'Smoked eggplant puree, tahini, garlic, olive oil & lemon juice' },
          { name: 'Haydari', price: '9.95', desc: 'Labne yogurt mixed with fresh garlic, fresh dill, walnuts & olive oil' },
          { name: 'Pink Sultan', price: '9.95', desc: 'Labne yogurt, fresh beet and garlic dip' },
          { name: 'Muhammara', price: '10.95', desc: 'Spicy dip made of walnuts, red bell peppers, pomegranate molasses, breadcrumbs and olive oil' },
          { name: 'Mixed Appetizers', price: '23.95', desc: 'Haydari, Babaghanoush, Hummus, Pink Sultan & Muhammara' },
          { name: 'Sigara Borek', price: '11.95', desc: 'Pan-fried phyllo rolls stuffed with feta cheese and parsley' },
          { name: 'Falafel', qty: '4 balls', price: '12.95', desc: 'Falafel balls served with a scoop of hummus & tahini sauce' },
          { name: 'Fried Calamari', price: '15.95' },
          { name: 'Kibbeh (Icli Kofte)', price: '14.95', desc: 'Two pieces of cracked wheat, stuffed with ground meat, walnuts & herbs' },
          { name: 'Calf Liver', price: '17.95', desc: 'Served with potato cubes, cherry tomatoes, parsley and red onion with sumac' },
          { name: 'Grilled Octopus', price: '21.95', desc: 'Char-grilled octopus served with tomatoes, onion, parsley, garlic, olive oil and vinegar' },
        ],
      },
      {
        id: 'salads',
        title: 'Salads',
        items: [
          { name: 'Greek Salad', price: '14.95', desc: 'Freshly diced tomatoes, cucumbers, onions, parsley, lettuce, black olives, feta cheese, olive oil and lemon juice' },
          { name: 'Mediterranean Salad', price: '14.95', desc: 'Lettuce, red cabbage, carrots, tomatoes, cucumbers, feta cheese, olive oil and lemon juice' },
          {
            name: 'Salad Toppings',
            prices: [
              { label: 'Shrimp', price: '12.95' },
              { label: 'Grilled Chicken', price: '11.95' },
              { label: 'Lamb Doner (Gyro)', price: '11.95' },
              { label: 'Falafel (4 balls)', price: '8.95' },
            ],
          },
        ],
      },
      {
        id: 'oven',
        title: 'Oven Specialties',
        items: [
          { name: 'Lahmacun', qty: '2 pcs', price: '19.95', desc: 'Anatolian version of the ancient Turkish meat pie: ground lamb topped with parsley, fresh tomatoes, red peppers and onions on thin dough, served with lemon, parsley, tomatoes and onions' },
          { name: 'Cheese Pide', price: '19.95', desc: 'Flattened dough with tomatoes and a mozzarella & parmesan cheese mix' },
          { name: 'Spinach Pide', price: '21.95', desc: 'Flattened dough with spinach, onions, tomatoes and a mozzarella & parmesan cheese mix' },
          { name: "Chef's Special Pide", price: '24.95', desc: 'Flattened dough with Turkish sausages, pastirma (highly seasoned air-dried cured beef) and a mozzarella & parmesan cheese mix' },
        ],
      },
      {
        id: 'entrees',
        title: 'Entrees',
        items: [
          { name: 'Chicken Shish', price: '24.95', desc: 'Tender chunks of marinated chicken breast served with rice' },
          { name: 'Chicken Chops', price: '24.95', desc: 'Char-grilled chicken chops served with rice' },
          { name: 'Chicken Adana', price: '24.95', desc: 'Hand-chopped chicken served with sumac onions & rice' },
          { name: 'Lamb Doner (Gyro)', price: '24.95', desc: 'Homemade thinly sliced lamb doner served with rice' },
          { name: 'Iskender', price: '26.95', desc: 'Lamb doner served over buttery bread with garlic yogurt and fresh tomato sauce on top' },
          { name: 'Lamb Adana', price: '26.95', desc: 'Hand-chopped lamb served with sumac, onions & rice' },
          { name: 'Lamb Shish Kebab', price: '28.95', desc: 'Marinated chunks of grilled lamb served with rice' },
          { name: 'Lamb Chops', qty: '4 pcs', price: '37.95', desc: 'Char-grilled baby lamb chops served with rice' },
          { name: 'Mix Grill for One', price: '47.95', desc: 'One skewer of lamb adana, one skewer of chicken adana, one lamb chop, one chicken chop, one piece of lamb shish, one piece of chicken shish and lamb doner served over rice' },
          { name: 'Mix Grill for Two', price: '82.95', desc: 'One skewer of lamb adana, one skewer of chicken adana, two lamb chops, two chicken chops, two pieces of lamb shish, two pieces of chicken shish and lamb doner served over rice' },
          { name: 'Manti / Turkish Ravioli', price: '23.95', desc: 'Dumplings stuffed with seasoned lamb, served with garlic yogurt and a light tomato sauce blend of herbs and spices' },
          { name: 'Eggplant Musakka', price: '23.95', desc: 'Baked eggplant, ground lamb, green peppers, onions, tomatoes and mozzarella cheese served with rice' },
        ],
      },
      {
        id: 'seafood',
        title: 'Seafood',
        items: [
          { name: 'Mediterranean Whole Branzino', price: '33.95', desc: 'Char-grilled whole branzino served with arugula salad' },
          { name: 'Grilled Salmon', price: '27.95', desc: 'Char-grilled fillet of salmon served with sautéed spinach and arugula salad' },
          { name: 'Shrimp Skewers', price: '27.95', desc: 'Char-grilled jumbo shrimp skewers served with arugula salad' },
        ],
      },
      {
        id: 'vegetarian',
        title: 'Vegetarian Dishes',
        items: [
          { name: 'Okra', price: '19.95', desc: 'Baby okra cooked with fresh tomatoes, green peppers, onions, carrots and lemon juice, served with rice' },
          { name: 'Falafel Dinner', price: '21.95', desc: 'Six balls of falafel served on a bed of oven-baked warm homemade hummus and tomatoes, topped with tahini sauce' },
        ],
      },
      {
        id: 'sautes',
        title: 'Sautés',
        items: [
          { name: 'Chicken Saute', price: '24.95', desc: 'Chunks of chicken sautéed with onions, mushrooms, green peppers, tomatoes, garlic & heavy cream, served with rice' },
          { name: 'Lamb Saute', price: '27.95', desc: 'Chunks of lamb sautéed with onions, mushrooms, green peppers, tomatoes, garlic & heavy cream, served with rice' },
          { name: 'Shrimp Saute', price: '27.95', desc: 'Char-grilled jumbo shrimp with onions, mushrooms, green peppers, tomatoes, garlic & heavy cream, served with rice' },
        ],
      },
      {
        id: 'sides',
        title: 'Sides',
        compact: true,
        items: [
          { name: 'Homemade Bread', qty: '1 pc', price: '1.00' },
          { name: 'Balloon Bread', price: '4.25' },
          { name: 'Lavash Bread', price: '2.95' },
          { name: 'Simit', price: '4.25', desc: 'Turkish sesame bagel' },
          { name: 'French Fries', price: '6.95' },
          { name: 'White Rice', price: '5.95' },
          { name: 'Sautéed Spinach', price: '6.95' },
          { name: 'Steamed Broccoli', price: '6.95' },
          { name: 'Extra Sauce', price: '0.75', desc: 'Hot, white or tahini sauce' },
        ],
      },
      {
        id: 'desserts',
        title: 'Desserts',
        items: [
          { name: 'Kunefe', price: '14.95', desc: 'Oven-baked shredded wheat with pistachios and cheese filling, served with simple syrup and pistachios on top' },
          { name: 'Katmer', price: '13.95', desc: 'Oven-baked phyllo pastry, pistachios and clotted cream, served with ice cream' },
          { name: 'Kazandibi', price: '9.95', desc: 'Delicate Ottoman milk pudding with a burned top layer that adds a toasted, caramel-like flavor' },
          { name: 'Baklava', price: '10.95' },
          { name: 'Rice Pudding', price: '9.95' },
          { name: 'Fig Pudding', price: '9.95' },
        ],
      },
      {
        id: 'drinks',
        title: 'Soft Drinks',
        compact: true,
        items: [
          { name: 'Turkish Tea', price: '2.50' },
          { name: 'Turkish Coffee', price: '4.25' },
          { name: 'Water', prices: [{ label: 'Medium', price: '2.95' }, { label: 'Large', price: '5.95' }] },
          { name: 'San Pellegrino', prices: [{ label: 'Medium', price: '4.95' }, { label: 'Large', price: '7.95' }] },
          { name: 'Ayran', price: '4.25' },
          { name: 'Salgam', price: '4.25' },
          { name: 'Turkish Club Soda', price: '4.25' },
          { name: 'Turkish Gazoz', price: '4.25', desc: 'Orange or mixed fruit' },
          { name: 'Can Sodas', price: '3.95' },
        ],
      },
      {
        id: 'lunch',
        title: 'Lunch',
        note: 'Monday through Friday, 11 AM – 3 PM. Lunch special (except holidays): all menu items are 20% off, except wraps.',
        items: [
          { name: 'Falafel Wrap', price: '12.95' },
          { name: 'Lamb Adana Wrap', price: '13.95' },
          { name: 'Lamb Doner Wrap', price: '13.95' },
          { name: 'Chicken Adana Wrap', price: '13.95' },
          { name: 'Chicken Shish Wrap', price: '14.95' },
        ],
        compact: true,
      },
    ],
  },
  {
    id: 'breakfast',
    label: 'Breakfast',
    shortLabel: 'Breakfast',
    note: 'Saturday & Sunday, 11:00 AM – 3:00 PM',
    images: [{ src: 'images/menu/safir3.png', alt: 'Printed breakfast menu' }],
    sections: [
      {
        id: 'breakfast-specialties',
        title: 'Breakfast Specialties',
        items: [
          { name: 'Traditional Turkish Breakfast Platter', price: '25.95', desc: 'Two sigara böreks, assorted cheeses, honey & butter, jam, black olives, tomatoes and cucumbers, served with one simit (homemade Turkish sesame bagel)' },
          { name: 'Menemen', price: '14.95', desc: 'Two eggs cooked with tomatoes, peppers, onions and garlic, served with one homemade roll' },
          { name: 'Eggs with Sucuk', price: '14.95', desc: 'Two eggs cooked with sucuk (Turkish spiced dry sausage), served with one homemade roll' },
          { name: 'Eggs with Pastırma', price: '14.95', desc: 'Two eggs cooked with pastırma (Turkish air-dried cured beef), served with one homemade roll' },
          { name: 'Two Eggs, Any Style', price: '8.95', desc: 'Two eggs cooked your choice of style. Add toppings for $3.95: feta cheese, cheddar cheese, spinach & onion mix' },
          { name: 'Sigara Börek', price: '12.95', desc: 'Four pan-fried phyllo rolls stuffed with feta cheese and parsley' },
          {
            name: 'Turkish Pides',
            prices: [
              { label: 'Cheese & Tomato', price: '20.95' },
              { label: 'Spinach', price: '22.95' },
              { label: 'Sucuk & Pastırma', price: '25.95' },
            ],
          },
        ],
      },
      {
        id: 'breakfast-breads',
        title: 'Breads',
        compact: true,
        items: [
          { name: 'Simit', price: '4.95', desc: 'Homemade Turkish sesame bagel' },
          { name: 'Homemade Balloon Bread', price: '4.95' },
          { name: 'Homemade Roll', price: '1.50' },
        ],
      },
      {
        id: 'breakfast-drinks',
        title: 'Beverages',
        compact: true,
        items: [
          { name: 'Turkish Tea', price: '2.95' },
          { name: 'Pot of Turkish Tea', price: '20.00' },
          { name: 'Turkish Coffee', price: '4.95' },
          { name: 'Orange Juice', price: '4.95' },
        ],
      },
    ],
  },
  {
    id: 'specials',
    label: "This Week's Specials",
    shortLabel: 'Specials',
    images: [{ src: 'images/menu/safir4.png', alt: "Printed menu of this week's specials" }],
    sections: [
      {
        id: 'specials-entrees',
        title: 'Entrees',
        items: [
          { name: 'Ali Nazik', price: '27.95', desc: 'Chicken shish, lamb shish or lamb doner served on a bed of eggplant puree' },
          { name: 'Cokertme Kebab', price: '27.95', desc: 'Chicken shish, lamb shish or lamb doner served on a bed of french fries, topped with tomato sauce and yogurt' },
          { name: 'Beyti Adana Kebab', price: '27.95', desc: 'Ground lamb or chicken Adana kebab, wrapped and cut in lavash bread, topped with tomato and yogurt sauces' },
          { name: 'Lamb Shank', price: '37.95', desc: 'Slow-cooked, very generous roasted lamb leg with special herbs and spices, topped with tomato sauce, served with rice' },
          { name: 'For Kids', price: '18.95', desc: 'Chicken tenders and french fries' },
        ],
      },
      {
        id: 'specials-mix-grill',
        title: 'Mix Grill to Share',
        compact: true,
        items: [
          { name: 'Mix Grill for 3', price: '130.95' },
          { name: 'Mix Grill for 5', price: '213.95' },
          { name: 'Mix Grill for 7', price: '296.95' },
        ],
      },
      {
        id: 'specials-drinks',
        title: 'Beverages',
        compact: true,
        items: [
          { name: 'Troy Turkish Lager – Turk Tuborg', price: '8.50' },
          { name: 'Individual champagne bottle “Off the Hook”, Spain', price: '15.00' },
        ],
      },
    ],
  },
];
