import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import Header from './Header'

export default function LandingPage(){
  const [currentSlide, setCurrentSlide] = useState(0)

  const features = [
    {
      color: 'bg-blue-500',
      icon: '👤',
      title: 'Personal Learning',
      description: 'Customized learning paths tailored to your needs and goals'
    },
    {
      color: 'bg-red-500',
      icon: '🔒',
      title: 'Secure Platform',
      description: 'State-of-the-art security measures to protect your data'
    },
    {
      color: 'bg-green-500',
      icon: '🤖',
      title: 'AI Integration',
      description: 'Advanced AI technology to enhance your learning experience'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white relative overflow-hidden mb-40">
      <div className="relative z-20 container mx-auto px-4 py-6">
        <Header />
        </div>
        <div className="flex flex-col items-center justify-center relative">
             <motion.div className='w-24 rounded-2xl border-b-gray-900 border-gray-900 border-t-gray-700 border-l-gray-700 h-12 border absolute z-20 -top-7 left-[110px]'>
             </motion.div>
             <motion.div className='w-24 rounded-2xl border-b-gray-900 border-gray-900 border-t-gray-700 border-l-gray-700 h-12 border absolute z-20 -top-10 right-[150px]'>
             </motion.div>
             <motion.div className='w-24 rounded-2xl border-b-gray-900 border-gray-900 border-t-gray-700 border-l-gray-700 h-12 border absolute z-20 top-[328px] right-[200px]'>
             </motion.div>
             <motion.div className='w-24 rounded-2xl border-b-gray-900 border-gray-900 border-t-gray-700 border-l-gray-700 h-12 border absolute z-20 top-[388px] left-[137px]'>
             </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="z-10 absolute inset-0 mt-[-200px]"
          >
          <motion.div className="absolute my-20">
          <svg width="1000" height="370" xmlns="http://www.w3.org/2000/svg" viewBox="5401 70 602 602">
             <motion.line x1="5501.68" y1="329.32" x2="5368.70" y2="332.32"
                   stroke="url(#innerGradient)" stroke-width="3" stroke-linecap="round" />
           
             <motion.line x1="5306.10" y1="261.56" x2="5368.79" y2="329.90"
                   stroke="url(#line-2)" stroke-width="4" stroke-linecap="round" />
            
             <motion.line x1="5200.20" y1="258.76" x2="5305.90" y2="262.80"
                   stroke="url(#line-1)" stroke-width="5" stroke-linecap="round"  />
           </svg>
           <svg width="1000" height="370" xmlns="http://www.w3.org/2000/svg" viewBox="5501 70 602 602">
             <motion.line x1="5531.68" y1="329.32" x2="5368.70" y2="332.32"
                   stroke="url(#innerGradient)" stroke-width="3" stroke-linecap="round" />
           </svg>
         
          </motion.div>
          
          <motion.div className='absolute z-20 mt-72 ml-32'>
          <svg width="1000" height="370" xmlns="http://www.w3.org/2000/svg" viewBox="4394 -170 802 602">
             <motion.line x1="5501.68" y1="259.32" x2="5328.70" y2="253.32"
                stroke="url(#innerGradient)" stroke-width="3" stroke-linecap="round" />
           </svg>
          </motion.div>
          <motion.div className='absolute mt-14 ml-32'>
          <svg width="1000" height="370" xmlns="http://www.w3.org/2000/svg" viewBox="4300 -20 802 602">
             <motion.line x1="5531.68" y1="219.32" x2="5368.70" y2="332.32"
                stroke="url(#innerGradient)" stroke-width="3" stroke-linecap="round" />
           </svg>
          </motion.div>

            <svg className="w-full h-full" viewBox="0 0 1000 1000">

              <motion.path
                d="M 200,500 A 300,300 0 0 1 800,500"
                fill="none"
                stroke="url(#outerGradient)"
                strokeWidth="4"
                strokeDasharray="20,10,5,5,5,10"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, ease: "easeInOut", delay: 0.5 }}
              />
              <motion.path
              d="M 325,329 A 109,185 0 0 0 310,670"
              fill="none"
              stroke="url(#innerGradient)"
              strokeWidth="4"
              strokeDasharray="10,11,1,1,1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: "easeInOut", delay: 0.7 }}
              />
               <motion.path
               d="M 675,329 A 109,185 0 0 1 690,670"
               fill="none"
               stroke="url(#innerGradientrigth)"
               strokeWidth="4"
               strokeDasharray="10,11,1,1,1"
               initial={{ pathLength: 0 }}
               animate={{ pathLength: 1 }}
               transition={{ duration: 2.5, ease: "easeInOut", delay: 0.7 }}
             />

              <motion.circle
                cx="200"
                cy="500"
                r="12"
                fill="#00D1FF"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 3.5 }}
                filter="url(#blur)"
              />
               <motion.circle
                cx="680"
                cy="330"
                r="12"
                fill="#00D1FF"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 3.5 }}
                filter="url(#blur)"
              />
              <motion.circle
                cx="310"
                cy="670"
                r="12"
                fill="#01BEF9"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 3.7 }}
                filter="url(#blur)"
              />
              <defs>
                <linearGradient id="outerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="30%" stopColor="#00D1FF" />
                  <stop offset="70%" stopColor="#01BEF9" />
                  <stop offset="100%" stopColor="#0A1E24" />
                </linearGradient>
                <linearGradient id="line-1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="100%" stopColor="#00D1FF" />
                  <stop offset="70%" stopColor="#01BEF9" />
                  <stop offset="100%" stopColor="#0A1E24" />
                </linearGradient>
                <linearGradient id="line-2" x1="200%" y1="20%" x2="200%" y2="-100%">
                  <stop offset="100%" stopColor="#00D1FF" />
                  <stop offset="70%" stopColor="#01BEF9" />
                  <stop offset="10%" stopColor="#0A1E24" />
                </linearGradient>
                <linearGradient id="innerGradient" x1="70%" y1="250%" x2="110%" y2="10%">
                <stop offset="30%" stopColor="#00D1FF" />
                  <stop offset="70%" stopColor="#01BEF9" />
                  <stop offset="100%" stopColor="#0A1E24" />
                </linearGradient>
                <linearGradient id="innerGradientrigth" x1="0%" y1="-40%" x2="60%" y2="100%">
                  <stop offset="30%" stopColor="#00D1FF" />
                  <stop offset="70%" stopColor="#01BEF9" />
                  <stop offset="100%" stopColor="#0A1E24" />
                </linearGradient>
                <filter id="blur">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
              </defs>
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mt-16 mb-16 relative z-20"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Revolutionizing future steps in{" "}
              <span className="bg-transparent bg-clip-text text-transparent w-full xl:leading-snug bg-gradient-to-r from-[#3A53FE] via-[#00D1FF] to-[#00D1FF] ">Ed-Tech</span> and{" "}
              <span className="text-[#714fa7]">AI</span>
            </h1>
            <div className="text-center text-gray-400">
             <p className="text-xl mb-2">Leveraging innovative solutions that will take you to</p>
             <p className="text-xl w-4/5 mx-auto mb-1">this next level in your learning</p>
             <p className="text-xl w-2/3 mx-auto">and professional journey</p>
            </div>

        <div className="space-y-4 mt-10">
              <span className="bg-transparent bg-clip-text text-transparent w-full xl:leading-snug bg-gradient-to-r from-[#381CA5] to-[#00D1FF] text-2xl font-semibold">Get our App from</span>
            <div className="flex justify-center gap-4 ">
          <div className="flex gap-2 ml-3 mt-[-10px]">
            <button className="cursor-pointer">
              <div
                className="flex max-w-32 px-2 lg:h-8 gap-2 rounded-lg items-center justify-center bg-white text-black sm: h-14"
              >
                <svg viewBox="30 336.7 120.9 129.2" className="lg:w-4 sm: w-7">
                  <path
                    d="M119.2,421.2c15.3-8.4,27-14.8,28-15.3c3.2-1.7,6.5-6.2,0-9.7  c-2.1-1.1-13.4-7.3-28-15.3l-20.1,20.2L119.2,421.2z"
                    fill="#FFD400"
                  ></path>
                  <path
                    d="M99.1,401.1l-64.2,64.7c1.5,0.2,3.2-0.2,5.2-1.3  c4.2-2.3,48.8-26.7,79.1-43.3L99.1,401.1L99.1,401.1z"
                    fill="#FF3333"
                  ></path>
                  <path
                    d="M99.1,401.1l20.1-20.2c0,0-74.6-40.7-79.1-43.1  c-1.7-1-3.6-1.3-5.3-1L99.1,401.1z"
                    fill="#48FF48"
                  ></path>
                  <path
                    d="M99.1,401.1l-64.3-64.3c-2.6,0.6-4.8,2.9-4.8,7.6  c0,7.5,0,107.5,0,113.8c0,4.3,1.7,7.4,4.9,7.7L99.1,401.1z"
                    fill="#3BCCFF"
                  ></path>
                </svg>
                <div>
                  <div className="lg:text-xs font-semibold font-sans sm: text-xs">
                    Play Store
                  </div>
                </div>
              </div>
            </button>
          
            <button className="cursor-pointer">
    <div
      className="flex max-w-48 lg:h-8 px-2  rounded-lg items-center justify-center bg-black text-white dark:text-black dark:bg-white lg:gap-1 sm:gap-3 sm:h-14"
    >
      <svg viewBox="0 0 384 512" className="lg:w-4 h-4 sm:w-7">
        <path
          d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
          fill="currentColor"
        ></path>
      </svg>
      <div>
        <span className="lg:text-xs font-semibold font-sans sm: text-2xl">
          App Store
        </span>
      </div>
    </div>
  </button>
</div>

            </div>
        </div>   
          </motion.div>

          <div className="relative max-w-5xl mx-auto z-20">
             <button
               onClick={() => setCurrentSlide((prev) => (prev - 1 + features.length) % features.length)}
               className="absolute left-60 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full border border-gray-800 border-t-[2px] border-l-[2px] border-b-gray-900 border-r-gray-900 shadow-md hover:shadow-lg hover:bg-gray-800 transition-all duration-300 ease-in-out"
             >
               <ArrowLeft className="w-6 h-6" />
             </button>
             
             <button
               onClick={() => setCurrentSlide((prev) => (prev + 1) % features.length)}
               className="absolute right-60 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full border border-gray-800 border-t-[2px] border-l-[2px] border-b-gray-900 border-r-gray-900 shadow-md hover:shadow-lg hover:bg-gray-800 transition-all duration-300 ease-in-out"
             >
               <ArrowRight className="w-6 h-6" />
             </button>
          

            <div className="overflow-hidden ">
              <motion.div
                animate={{ x: `-${currentSlide * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex"
              >
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="min-w-full flex justify-center px-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-lg w-full max-w-sm overflow-hidden"
                    >
                      <div className={`${feature.color} h-2 w-full`} />
                      <div className="p-6">
                        <div className="text-4xl mb-4">{feature.icon}</div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-400">{feature.description}</p>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </div>
            
            <div className="flex justify-center gap-2 mt-8">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSlide === index ? "bg-white" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
         
        </div>
        
      </div>
      <motion.div className='justify-center flex flex-col'>
            <motion.div className='ml-20 mt-20'>
                <motion.span className='bg-transparent bg-clip-text text-transparent w-full xl:leading-snug bg-gradient-to-r from-[#381CA5] to-[#00D1FF] text-2xl font-semibold'>Effective Learning</motion.span>
                  
            </motion.div>
            <motion.div className='ml-[78px]'>
              <span className='font-semibold text-6xl'>Effortless Review and</span>
            </motion.div>
            <motion.div className="ml-[78px]">
              <span className='font-semibold text-6xl'>Interview</span>
            </motion.div>
        </motion.div>

        <motion.div className='mt-10 ml-20 rounded-xl border-[#424242] border h-[400px] w-[1100px]'>
           <motion.div className='flex'>
              <div className='m-4 p-4 flex flex-col'>
                 <span className='font-ligth text-6xl'>Track</span>
                 <span className='font-ligth text-6xl'>Resumes</span>
                 <span className='font-ligth text-6xl'>Scores</span>
                 <span className='mt-3'>Master your chances of being shortlisted. Seamlessly monitor </span>
                 <span>and manage resume shortcomings.</span>
              </div>
              <div className='m-4 p-4'>
                 <img src='https://s3-alpha-sig.figma.com/img/e986/713e/6a7983e67e22500ef0068f6b207a4ec1?Expires=1734912000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=dVzqptRe~U1~81qEcWpptS869tmVkl2CZmVsAP5x1zW7nOuiWwJ3xbdmLgY5bCrlG0vE~XJPVNa3AsOBjkVG-ZazBTGzPiO687s3-B2mTys5rKVQVc4uEnTdzwIcKXnL1kTSJzSxnbCKKU-80rXtklgOBH3jPytoQWsNyR8MApan~RhdOEpWZc5KJAt1szAxBWRWgpxl-JDVCsTjHeGWKuyZRc9H8MjLfT9vsr0rTdxpS9xcvwsj5uCCo2ZTeoLs0faMdc1FGYktXVi6eIptXduhGruXLC-LpmkibC4r46VS1xxKuLyYRyaqkkTHm8i2duYW-RXr1JO9REClvqOIqA__' className='h-60 w-[452px] rounded-md'/>
                 <div className='border-[#E8E8E8] border  rounded-2xl text-center p-2 w-[389px] h-[59px] mt-7 ml-[35px]'>
                   <span className='bg-transparent bg-clip-text text-transparent w-full xl:leading-snug bg-gradient-to-r from-[#381CA5] to-[#00D1FF] text-4xl font-semibold'>AI CV Rater</span>
                 </div>
              </div>
           </motion.div>
        </motion.div>
    </div>
  
)

}

