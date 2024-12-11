import { motion } from 'framer-motion';

export const RenderEffectiveRenderSlide = ({ secondslide, itemPerSection, effectiveLearing} : {
    secondslide: number, itemPerSection: number, effectiveLearing: any
}) => {
    const startIndex = secondslide * itemPerSection;
    const endIndex = startIndex + itemPerSection;
    const currentSection = effectiveLearing.slice(startIndex, endIndex);

    return(
      <motion.div 
        className='gap-4 sm:gap-7 mt-8 sm:mt-10 px-4 sm:px-20 flex flex-col sm:flex-row overflow-hidden'
        key={secondslide}
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 200 }}
        transition={{ duration: 0.5 }}
      >
        {currentSection.map((i: any) => (
          <motion.div 
            key={i.id} 
            className='border p-4 sm:p-5 h-auto sm:h-[381px] w-full sm:w-[537px] flex rounded-3xl flex-col border-gray-700'
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <img 
              src={i.imageUrl} 
              alt={i.title}  
              className='w-full h-40 sm:h-52 rounded-xl object-cover'
            />
            <span className='text-white font-normal text-lg sm:text-xl mt-3'>{i.title}</span> 
            <span className='text-[#979797] text-xs sm:text-sm mt-1'>{i.description}</span>
            <div className='border-[#E8E8E8] border-2 rounded-2xl text-center p-2 w-full sm:w-[429px] h-auto sm:h-[59px] mt-3'>
              <span className='bg-transparent bg-clip-text text-transparent w-full xl:leading-snug bg-gradient-to-r from-[#381CA5] to-[#00D1FF] text-xl sm:text-3xl font-semibold'>
                {i.button}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    )
}

