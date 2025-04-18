import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
    >
      <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on track!
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
      >
        Back to Home
      </Link>
    </motion.div>
  );
};

export default NotFoundPage; 