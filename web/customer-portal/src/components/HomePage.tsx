import RestaurantCard from './RestaurantCard';
import { Restaurant } from '../types/cart';

const SAMPLE_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "Burger Palace",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    rating: 4.5,
    cuisine: "American • Burgers",
    deliveryTime: "25-35 min",
    minimumOrder: "$15",
    address: "123 Burger Street, Foodville, FD 12345"
  },
  {
    id: "2",
    name: "Pizza Heaven",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    rating: 4.3,
    cuisine: "Italian • Pizza",
    deliveryTime: "30-45 min",
    minimumOrder: "$20",
    address: "456 Pizza Avenue, Foodville, FD 12345"
  },
  {
    id: "3",
    name: "Sushi Master",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    rating: 4.8,
    cuisine: "Japanese • Sushi",
    deliveryTime: "35-50 min",
    minimumOrder: "$25",
    address: "789 Sushi Lane, Foodville, FD 12345"
  }
];

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

const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurants */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Popular Restaurants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_RESTAURANTS.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              {...restaurant}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 