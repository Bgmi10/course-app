import { motion } from 'framer-motion';

export default function EventsCreation (){

    return (
    <>
     <div className="justify-center flex text-white mt-10">
     <motion.h1 
     initial={{ opacity: 0, y: -20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.5 }}
     className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl font-extrabold leading-tight text-center bg-clip-text text-transparent w-full mx-6 pb-4 xl:leading-snug bg-gradient-to-b from-blue-600 via-gray-600 to-white"
     >
       Event Creation
     </motion.h1>
     </div>
     <div className='justify-center flex text-white'>
        <div>
        </div>
     </div>
     </>
    )
}