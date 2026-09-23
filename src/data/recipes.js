import coffeeIcon from '../assets/icons/coffee.svg';
import utensilsIcon from '../assets/icons/utensils.svg';
import soupIcon from '../assets/icons/soup.svg';
import cakeIcon from '../assets/icons/cake.svg';

import heroCarbonara from '../assets/images/hero-carbonara.png';
import categoryBreakfast from '../assets/images/category-breakfast.png';
import categoryLunch from '../assets/images/category-lunch.png';
import categoryDinner from '../assets/images/category-dinner.png';
import categoryDesserts from '../assets/images/category-desserts.png';

import carbonara from '../assets/images/carbonara.png';
import popularCarbonara from '../assets/images/popular-carbonara.png';
import chickenBiryaniCard from '../assets/images/chicken-biryani-card.png';
import chickenBiryaniHero from '../assets/images/chicken-biryani-hero.png';
import fluffyPancakes from '../assets/images/fluffy-pancakes.png';
import chocolateCake from '../assets/images/chocolate-cake.png';
import friedRice from '../assets/images/fried-rice.png';
import caesarSalad from '../assets/images/caesar-salad.png';
import salmonAsparagus from '../assets/images/salmon-asparagus.png';
import berrySmoothieBowl from '../assets/images/berry-smoothie-bowl.png';

export { heroCarbonara };

/** Home page "Browse by Category" cards. */
export const categories = [
  { name: 'Breakfast', icon: coffeeIcon, image: categoryBreakfast },
  { name: 'Lunch', icon: utensilsIcon, image: categoryLunch },
  { name: 'Dinner', icon: soupIcon, image: categoryDinner },
  { name: 'Desserts', icon: cakeIcon, image: categoryDesserts },
];

/** Recipes page filter pills. */
export const filters = ['All', ...categories.map((c) => c.name)];

/**
 * Static recipe data.
 *
 * - `image`        thumbnail used on the Recipes page grid
 * - `homeImage`    optional alternate thumbnail used in Home "Popular Recipes"
 *                  (the Figma home + recipes frames use different Carbonara photos)
 * - `heroImage`    large image on the detail page (falls back to `image`)
 * - `detailDifficulty` optional override of the detail-page difficulty text
 *                  (Figma shows Chicken Biryani as "Hard" on the card but
 *                  "Medium Difficulty" on the detail page)
 * - `ingredients`  `checked: true` items start ticked (as in the Figma detail frame)
 */
export const recipes = [
  {
    id: 'classic-pasta-carbonara',
    title: 'Classic Pasta Carbonara',
    category: 'Dinner',
    time: 25,
    difficulty: 'Medium',
    image: carbonara,
    homeImage: popularCarbonara,
    rating: 4.8,
    reviews: 212,
    servings: 2,
    ingredients: [
      { name: 'Spaghetti' },
      { name: 'Guanciale or pancetta (diced)' },
      { name: 'Egg yolks' },
      { name: 'Whole eggs' },
      { name: 'Pecorino Romano (grated)' },
      { name: 'Freshly cracked black pepper' },
    ],
    steps: [
      {
        title: 'Render the Guanciale',
        text: 'Cook the diced guanciale in a cold pan over medium heat until the fat renders and the pieces turn crisp.',
      },
      {
        title: 'Boil the Pasta',
        text: 'Cook the spaghetti in well-salted water until al dente, reserving a cup of the starchy pasta water.',
      },
      {
        title: 'Make the Sauce',
        text: 'Whisk the egg yolks, whole eggs, Pecorino and plenty of black pepper together into a thick paste.',
      },
      {
        title: 'Combine',
        text: 'Toss the hot pasta with the guanciale off the heat, then stir in the egg mixture with splashes of pasta water until glossy and creamy.',
      },
    ],
  },
  {
    id: 'chicken-biryani',
    title: 'Chicken Biryani',
    category: 'Dinner',
    time: 45,
    difficulty: 'Hard',
    detailDifficulty: 'Medium Difficulty',
    image: chickenBiryaniCard,
    heroImage: chickenBiryaniHero,
    rating: 4.8,
    reviews: 145,
    servings: 4,
    ingredients: [
      { name: 'Basmati Rice', checked: true },
      { name: 'Chicken (bone-in)', checked: true },
      { name: 'Onions (sliced & fried)', checked: true },
      { name: 'Yogurt (curd)' },
      { name: 'Biryani Spice Mix (Masala)' },
      { name: 'Saffron Threads' },
      { name: 'Ghee (clarified butter)' },
      { name: 'Fresh Mint & Cilantro' },
    ],
    steps: [
      {
        title: 'Marination',
        text: 'Marinate the chicken with yogurt, Biryani spices, mint, cilantro, and half the fried onions for at least 2 hours.',
      },
      {
        title: 'Prepare Rice',
        text: 'Wash and soak the long-grain basmati rice for 30 minutes, then parboil in seasoned water until 70% cooked.',
      },
      {
        title: 'Layering',
        text: 'In a deep heavy-bottomed pot, layer the marinated chicken first, then overlay with the cooked aromatic basmati rice.',
      },
      {
        title: 'Dum Cook (Sealing)',
        text: 'Drizzle saffron-infused milk and melted ghee over the rice layer. Seal tightly with dough or foil and dum-cook on low heat for 35 mins.',
      },
    ],
  },
  {
    id: 'fluffy-pancakes',
    title: 'Fluffy Pancakes',
    category: 'Breakfast',
    time: 15,
    difficulty: 'Easy',
    image: fluffyPancakes,
    rating: 4.9,
    reviews: 318,
    servings: 4,
    ingredients: [
      { name: 'All-purpose flour' },
      { name: 'Baking powder' },
      { name: 'Sugar' },
      { name: 'Milk' },
      { name: 'Egg' },
      { name: 'Melted butter' },
      { name: 'Fresh berries & maple syrup' },
    ],
    steps: [
      {
        title: 'Mix the Dry Ingredients',
        text: 'Whisk the flour, baking powder, sugar and a pinch of salt together in a large bowl.',
      },
      {
        title: 'Add the Wet Ingredients',
        text: 'Beat the milk, egg and melted butter, pour into the dry mix and stir until just combined. A few lumps are fine.',
      },
      {
        title: 'Cook',
        text: 'Ladle batter onto a lightly buttered pan over medium heat. Flip when bubbles form on the surface and cook until golden.',
      },
      {
        title: 'Serve',
        text: 'Stack the pancakes and finish with butter, fresh berries and a generous pour of maple syrup.',
      },
    ],
  },
  {
    id: 'decadent-chocolate-cake',
    title: 'Decadent Chocolate Cake',
    category: 'Desserts',
    time: 50,
    difficulty: 'Medium',
    image: chocolateCake,
    rating: 4.7,
    reviews: 187,
    servings: 8,
    ingredients: [
      { name: 'Dark chocolate' },
      { name: 'Unsalted butter' },
      { name: 'Caster sugar' },
      { name: 'Eggs' },
      { name: 'Plain flour' },
      { name: 'Cocoa powder' },
      { name: 'Double cream' },
    ],
    steps: [
      {
        title: 'Prepare the Tins',
        text: 'Heat the oven to 180°C (350°F) and grease and line two round cake tins.',
      },
      {
        title: 'Make the Batter',
        text: 'Melt the chocolate and butter together, then beat in the sugar and eggs before folding in the flour and cocoa.',
      },
      {
        title: 'Bake',
        text: 'Divide the batter between the tins and bake for 30 to 35 minutes, until a skewer comes out with just a few moist crumbs.',
      },
      {
        title: 'Frost and Layer',
        text: 'Cool completely, then sandwich and cover the layers with a glossy chocolate ganache made from warm cream and chocolate.',
      },
    ],
  },
  {
    id: 'authentic-fried-rice',
    title: 'Authentic Fried Rice',
    category: 'Lunch',
    time: 20,
    difficulty: 'Easy',
    image: friedRice,
    rating: 4.6,
    reviews: 264,
    servings: 3,
    ingredients: [
      { name: 'Day-old cooked rice' },
      { name: 'Eggs' },
      { name: 'Carrots (diced)' },
      { name: 'Green peas' },
      { name: 'Spring onions' },
      { name: 'Soy sauce' },
      { name: 'Sesame oil' },
    ],
    steps: [
      {
        title: 'Prep',
        text: 'Break up the cold rice with your fingers so the grains are separate, and dice the vegetables.',
      },
      {
        title: 'Scramble the Eggs',
        text: 'Heat oil in a wok over high heat, scramble the eggs until just set, then push them to the side.',
      },
      {
        title: 'Stir-fry',
        text: 'Add the carrots and peas, then the rice. Toss constantly for 3 to 4 minutes until the rice is hot and lightly toasted.',
      },
      {
        title: 'Season',
        text: 'Splash in the soy sauce and sesame oil, toss with the spring onions and serve immediately.',
      },
    ],
  },
  {
    id: 'caesar-salad-with-croutons',
    title: 'Caesar Salad with Croûtons',
    category: 'Lunch',
    time: 15,
    difficulty: 'Easy',
    image: caesarSalad,
    rating: 4.5,
    reviews: 129,
    servings: 2,
    ingredients: [
      { name: 'Romaine lettuce hearts' },
      { name: 'Crusty bread (cubed)' },
      { name: 'Parmesan (shaved)' },
      { name: 'Garlic' },
      { name: 'Lemon juice' },
      { name: 'Olive oil' },
      { name: 'Anchovy fillets' },
    ],
    steps: [
      {
        title: 'Toast the Croûtons',
        text: 'Toss the bread cubes with olive oil and bake at 200°C (400°F) for 10 minutes until golden and crisp.',
      },
      {
        title: 'Make the Dressing',
        text: 'Mash the garlic and anchovies, then whisk in the lemon juice, olive oil and a spoonful of grated Parmesan.',
      },
      {
        title: 'Assemble',
        text: 'Toss the romaine with the dressing, top with the croûtons and shave plenty of Parmesan over the top.',
      },
    ],
  },
  {
    id: 'grilled-salmon-with-asparagus',
    title: 'Grilled Salmon with Asparagus',
    category: 'Dinner',
    time: 30,
    difficulty: 'Easy',
    image: salmonAsparagus,
    rating: 4.8,
    reviews: 176,
    servings: 2,
    ingredients: [
      { name: 'Salmon fillets' },
      { name: 'Asparagus spears' },
      { name: 'Olive oil' },
      { name: 'Lemon' },
      { name: 'Fresh dill' },
      { name: 'Garlic' },
    ],
    steps: [
      {
        title: 'Season',
        text: 'Pat the salmon dry and rub with olive oil, salt, pepper and minced garlic. Trim the woody ends from the asparagus.',
      },
      {
        title: 'Grill the Salmon',
        text: 'Grill the fillets skin-side down over medium-high heat for 4 to 5 minutes per side, until the flesh flakes easily.',
      },
      {
        title: 'Grill the Asparagus',
        text: 'Toss the asparagus in oil and grill for 5 minutes, turning once, until tender with light char marks.',
      },
      {
        title: 'Plate',
        text: 'Serve the salmon over the asparagus with a squeeze of lemon and a scatter of fresh dill.',
      },
    ],
  },
  {
    id: 'berry-smoothie-bowl',
    title: 'Berry Smoothie Bowl',
    category: 'Breakfast',
    time: 10,
    difficulty: 'Easy',
    image: berrySmoothieBowl,
    rating: 4.7,
    reviews: 98,
    servings: 1,
    ingredients: [
      { name: 'Frozen mixed berries' },
      { name: 'Frozen banana' },
      { name: 'Greek yogurt' },
      { name: 'Almond milk' },
      { name: 'Chia seeds' },
      { name: 'Fresh banana & berries (to top)' },
    ],
    steps: [
      {
        title: 'Blend',
        text: 'Blend the frozen berries, frozen banana, yogurt and a splash of almond milk until thick and smooth.',
      },
      {
        title: 'Pour',
        text: 'Spoon the smoothie into a chilled bowl. It should be thick enough to hold toppings.',
      },
      {
        title: 'Top and Serve',
        text: 'Arrange sliced banana, fresh berries and chia seeds over the top and eat right away.',
      },
    ],
  },
];

export const getRecipeById = (id) => recipes.find((recipe) => recipe.id === id);

export const searchRecipes = (recipeList, query) => {
  const needle = query.trim().toLowerCase();
  if (needle === '') return recipeList;
  return recipeList.filter(r => r.title.toLowerCase().includes(needle));
};

export const filterRecipes = (recipeList, category) => {
  if (category === 'All') return recipeList;
  return recipeList.filter(r => r.category === category);
};
