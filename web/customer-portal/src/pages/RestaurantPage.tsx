import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const RestaurantPage = () => {
  const { id } = useParams();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Restaurant Details</h1>
      {/* Restaurant content will be added later */}
    </motion.div>
  );
};

export default RestaurantPage; 