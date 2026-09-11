export const AGENCY_ICONS = {
  box: { emoji: '📦', label: 'Box (General)' },
  bag: { emoji: '🛍️', label: 'Bag / Wholesale Sack' },
  ghee: { emoji: '🧈', label: 'Ghee / Dairy' },
  masala: { emoji: '🌶️', label: 'Masala / Spices' },
  sauce: { emoji: '🍅', label: 'Sauce / Condiments' },
  soap: { emoji: '🧼', label: 'Soap / Cleaning' },
  oil: { emoji: '🛢️', label: 'Cooking Oil / Mustard Oil' },
  tea: { emoji: '☕', label: 'Tea & Chai Patti' },
  sugar: { emoji: '🧂', label: 'Sugar & Salt (Karyana)' },
  flour: { emoji: '🌾', label: 'Atta / Flour / Grains' },
  rice: { emoji: '🍚', label: 'Rice / Basmati' },
  pulses: { emoji: '🥣', label: 'Dal & Pulses' },
  biscuit: { emoji: '🍪', label: 'Biscuits / Bakery' },
  rusk: { emoji: '🍞', label: 'Rusk / Toast / Bakery' },
  noodle: { emoji: '🍜', label: 'Noodles & Maggi' },
  bulb: { emoji: '💡', label: 'Bulb / Electrical & Lighting' },
  dryfruits: { emoji: '🥜', label: 'Dry Fruits & Nuts' },
  beverage: { emoji: '🧃', label: 'Cold Drinks & Juices' },
  confectionery: { emoji: '🍬', label: 'Candy & Toffees' },
  snack: { emoji: '🍿', label: 'Namkeen & Chips' },
  pooja: { emoji: '🪔', label: 'Pooja Samagri & Agarbatti' },
  matchbox: { emoji: '🔥', label: 'Matchbox & Dhoop' },
  broom: { emoji: '🧹', label: 'Broom / Cleaning Essentials' }
};

export const ICONS = Object.fromEntries(
  Object.entries(AGENCY_ICONS).map(([key, item]) => [key, item.emoji])
);
