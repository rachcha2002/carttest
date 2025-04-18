import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const LandingPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { scrollYProgress } = useScroll();
  const [isHovered, setIsHovered] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isRestaurantHovered, setIsRestaurantHovered] = useState<number | null>(null);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const cuisineTypes = [
    'Italian 🍝', 'Japanese 🍱', 'Mexican 🌮', 'Indian 🍛',
    'Chinese 🥡', 'Thai 🍜', 'American 🍔', 'Mediterranean 🥙'
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Food Enthusiast',
      image: '/testimonials/sarah.svg',
      text: 'The best food delivery service I\'ve ever used! Lightning-fast delivery and the food always arrives hot.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Business Professional',
      image: '/testimonials/michael.svg',
      text: 'Perfect for busy professionals. The app is intuitive, and the restaurant selection is outstanding.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Food Blogger',
      image: '/testimonials/emily.svg',
      text: 'As a food blogger, I\'m impressed by the quality and consistency. My go-to delivery service!',
      rating: 5
    }
  ];

  const restaurants = [
    {
      name: 'La Piazza',
      cuisine: 'Italian',
      rating: 4.8,
      image: '/restaurants/italian.svg',
      deliveryTime: '25-35',
      priceRange: '$$'
    },
    {
      name: 'Sakura Sushi',
      cuisine: 'Japanese',
      rating: 4.9,
      image: '/restaurants/japanese.svg',
      deliveryTime: '20-30',
      priceRange: '$$$'
    },
    {
      name: 'El Taco Loco',
      cuisine: 'Mexican',
      rating: 4.7,
      image: '/restaurants/mexican.svg',
      deliveryTime: '15-25',
      priceRange: '$'
    },
    {
      name: 'Taj Mahal',
      cuisine: 'Indian',
      rating: 4.9,
      image: '/restaurants/indian.svg',
      deliveryTime: '30-40',
      priceRange: '$$'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ scale, opacity }}
          className={`absolute inset-0 z-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-[#f29f05] bg-opacity-20 text-[#f29f05] text-sm font-medium mb-4">
              #1 Food Delivery App
            </span>
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#f29f05] to-[#ffc107]"
          >
            Delicious Food,
            <br />
            Delivered to Your Door
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
          >
            Experience the finest restaurants in your city with just a few clicks.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/menu"
                className={`w-full sm:w-auto px-8 py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-[#f29f05] to-[#ffc107] hover:from-[#e69504] hover:to-[#e6af06] text-white transition-all duration-300 shadow-lg hover:shadow-xl inline-block text-center`}
              >
                Order Now
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/restaurants"
                className={`w-full sm:w-auto px-8 py-4 rounded-full text-lg font-semibold border-2 border-[#f29f05] text-[#f29f05] hover:bg-[#f29f05]/10 dark:hover:bg-gray-800 transition-all duration-300 inline-block text-center`}
              >
                View Restaurants
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating cuisine types */}
        <div className="absolute bottom-20 left-0 right-0 overflow-hidden">
          <motion.div
            initial={{ x: -1000 }}
            animate={{ x: 1000 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="whitespace-nowrap"
          >
            {cuisineTypes.map((cuisine, index) => (
              <span
                key={index}
                className="inline-block mx-8 text-2xl opacity-50"
              >
                {cuisine}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-[#f29f05] bg-opacity-20 text-[#f29f05] text-sm font-medium mb-4"
            >
              Why Choose Us
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#f29f05] to-[#ffc107]"
            >
              The Perfect Food Delivery Experience
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg opacity-80 max-w-2xl mx-auto"
            >
              We make food delivery simple and delightful, bringing your favorite meals right to your doorstep
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Lightning Fast Delivery',
                description: 'Get your food delivered in 30 minutes or less, guaranteed fresh and hot',
                icon: '⚡'
              },
              {
                title: 'Premium Restaurants',
                description: 'Partner with the finest restaurants to bring you the best culinary experiences',
                icon: '👨‍🍳'
              },
              {
                title: 'Smart Ordering',
                description: 'Order with just a few taps and track your delivery in real-time',
                icon: '📱'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className={`p-8 rounded-2xl ${
                  isDarkMode ? 'bg-gray-700' : 'bg-white'
                } shadow-xl transform transition-all duration-300 hover:shadow-2xl`}
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="opacity-80 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '500+', label: 'Restaurants' },
              { number: '50,000+', label: 'Happy Customers' },
              { number: '1M+', label: 'Deliveries' },
              { number: '4.8/5', label: 'Customer Rating' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-[#f29f05] mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base opacity-80">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurant Showcase */}
      <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-[#f29f05] bg-opacity-20 text-[#f29f05] text-sm font-medium mb-4"
            >
              Featured Restaurants
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#f29f05] to-[#ffc107]"
            >
              Top-Rated Partners
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg opacity-80 max-w-2xl mx-auto"
            >
              Discover the finest restaurants in your area, carefully selected for quality and service
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {restaurants.map((restaurant, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onHoverStart={() => setIsRestaurantHovered(index)}
                onHoverEnd={() => setIsRestaurantHovered(null)}
                className={`relative rounded-2xl overflow-hidden ${
                  isDarkMode ? 'bg-gray-700' : 'bg-white'
                } shadow-xl transform transition-all duration-300 hover:shadow-2xl`}
              >
                <div className="relative h-48">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"
                    animate={{
                      opacity: isRestaurantHovered === index ? 1 : 0.5
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{restaurant.name}</h3>
                    <span className="flex items-center text-yellow-400">
                      ⭐ {restaurant.rating}
                    </span>
                  </div>
                  <p className="text-sm opacity-80 mb-4">{restaurant.cuisine}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span>🕒 {restaurant.deliveryTime} mins</span>
                    <span>{restaurant.priceRange}</span>
                  </div>
                </div>
                <motion.div
                  className="absolute inset-0 bg-[#f29f05]/10"
                  animate={{
                    opacity: isRestaurantHovered === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-[#f29f05] bg-opacity-20 text-[#f29f05] text-sm font-medium mb-4"
            >
              Testimonials
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#f29f05] to-[#ffc107]"
            >
              What Our Customers Say
            </motion.h2>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className={`max-w-4xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-3xl p-8 md:p-12`}
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden">
                    <img
                      src={testimonials[activeTestimonial].image}
                      alt={testimonials[activeTestimonial].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="text-yellow-400 mb-4">
                      {'⭐'.repeat(testimonials[activeTestimonial].rating)}
                    </div>
                    <p className="text-lg md:text-xl mb-4 italic">
                      "{testimonials[activeTestimonial].text}"
                    </p>
                    <h3 className="text-xl font-semibold">
                      {testimonials[activeTestimonial].name}
                    </h3>
                    <p className="opacity-80">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial
                      ? 'bg-[#f29f05] w-6'
                      : isDarkMode
                      ? 'bg-gray-600'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="inline-block px-4 py-1 rounded-full bg-[#f29f05] bg-opacity-20 text-[#f29f05] text-sm font-medium mb-4"
              >
                Mobile App
              </motion.span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#f29f05] to-[#ffc107]">
                Order On The Go
              </h2>
              <p className="text-lg mb-8 opacity-80">
                Download our mobile app to order your favorite food anytime, anywhere. Track your delivery in real-time and get exclusive offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  } hover:shadow-lg transition-all duration-300`}
                >
                  <span className="text-2xl">🍎</span>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  } hover:shadow-lg transition-all duration-300`}
                >
                  <span className="text-2xl">🤖</span>
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative aspect-[9/16] max-w-[300px] mx-auto">
                <img
                  src="/app/preview.svg"
                  alt="Mobile App Preview"
                  className="w-full h-full object-cover rounded-[2.5rem] shadow-2xl"
                />
                <motion.div
                  className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-[#f29f05]/20 to-[#ffc107]/20"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={`p-12 rounded-3xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            } relative overflow-hidden`}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#f29f05]/20 to-[#ffc107]/20"
              animate={{
                scale: isHovered ? 1.1 : 1,
                opacity: isHovered ? 0.8 : 0.5
              }}
              transition={{ duration: 0.3 }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#f29f05] to-[#ffc107]">
                Ready to Order?
              </h2>
              <p className="text-lg md:text-xl mb-8 opacity-80 text-center max-w-2xl mx-auto">
                Join thousands of satisfied customers who trust us with their meals. Get started in minutes!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className={`px-8 py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-[#f29f05] to-[#ffc107] hover:from-[#e69504] hover:to-[#e6af06] text-white transition-all duration-300 shadow-lg hover:shadow-xl block text-center`}
                  >
                    Get Started
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/about"
                    className={`px-8 py-4 rounded-full text-lg font-semibold border-2 border-[#f29f05] text-[#f29f05] hover:bg-[#f29f05]/10 dark:hover:bg-gray-800 transition-all duration-300 block text-center`}
                  >
                    Learn More
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 