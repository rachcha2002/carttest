import { useState } from 'react';
import { motion } from 'framer-motion';
import RestaurantCard from '../components/RestaurantCard';
import { Restaurant } from '../types/cart';

const CATEGORIES = [
  "All",
  "Pizza",
  "Burgers",
  "Sushi",
  "Chinese",
  "Mexican",
  "Indian",
  "Thai"
];

const SAMPLE_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "Burger Palace",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    cuisine: "American • Burgers",
    rating: 4.5,
    deliveryTime: "25-35 min",
    minimumOrder: "$15",
    address: "123 Burger Street"
  },
  {
    id: "2",
    name: "Pizza Heaven",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    cuisine: "Italian • Pizza",
    rating: 4.3,
    deliveryTime: "30-45 min",
    minimumOrder: "$20",
    address: "456 Pizza Avenue"
  },
  {
    id: "3",
    name: "Sushi Master",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    cuisine: "Japanese • Sushi",
    rating: 4.8,
    deliveryTime: "35-50 min",
    minimumOrder: "$25",
    address: "789 Sushi Lane"
  }
];

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRestaurants = SAMPLE_RESTAURANTS.filter(restaurant => {
    const matchesCategory = selectedCategory === "All" || restaurant.cuisine.includes(selectedCategory);
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <div className="bg-primary/5 dark:bg-gray-800 rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Delicious food delivered to your doorstep
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Choose from hundreds of restaurants and get your favorite meals delivered fast
        </p>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Categories</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-primary dark:hover:border-primary hover:text-primary dark:text-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search restaurants or cuisines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Restaurants Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Popular Restaurants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <motion.div
              key={restaurant.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RestaurantCard {...restaurant} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default HomePage; 