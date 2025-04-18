import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Profile</h1>
      {user && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">{user.name}</h2>
          <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
        </div>
      )}
    </motion.div>
  );
};

export default ProfilePage; 