import { Link } from 'react-router-dom';
import { StarIcon, ClockIcon } from '@heroicons/react/24/solid';
import { Restaurant } from '../types/cart';

const RestaurantCard: React.FC<Restaurant> = ({
  id,
  name,
  image,
  cuisine,
  rating,
  deliveryTime,
  minimumOrder,
}) => {
  return (
    <Link to={`/restaurant/${id}`}>
      <div className="card group cursor-pointer bg-white dark:bg-gray-800 hover:shadow-lg dark:hover:shadow-gray-700/50 transition-all duration-300">
        <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg flex items-center shadow-md">
            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium dark:text-white">{rating}</span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{cuisine}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{deliveryTime}</span>
            </div>
            <span>Min. {minimumOrder}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard; 