import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white text-center">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-9xl font-bold mb-4"
      >
        404
      </motion.h1>
      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-2xl mb-6"
      >
        Oops! The page you're looking for doesn't exist.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-lg mb-8 text-gray-400"
      >
        It seems you've found a broken link or mistyped the address.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Link
          to="/"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-lg transition-colors"
        >
          Go Back Home
        </Link>
      </motion.div>
    </div>
  );
}
