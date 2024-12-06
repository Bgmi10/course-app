import { motion } from 'framer-motion';

export const SuccessMessage = ({ message }: { message: string }) => (
    <>{message && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-green-500 text-white p-3 rounded-md mb-4"
      >
        {message}
      </motion.div>
    )}</>
  );
