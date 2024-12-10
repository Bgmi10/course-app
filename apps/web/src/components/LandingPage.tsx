import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import Header from './Header'


export default function LandingPage() {
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
    <div className="min-h-screen bg-[#0D0D0D] text-white relative overflow-hidden">
      
      <div className="relative z-10 container mx-auto px-4 py-6">
   
          <Header />
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 "
          >
            <svg className="w-full h-full" viewBox="0 0 800 600">
              <motion.path
                d="M 200,300 Q 400,500 600,300"
                fill="none"
                stroke="#2165BF"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              {/* Glowing dots */}
              <motion.circle
                cx="200"
                cy="300"
                r="4"
                fill="#2165BF"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.circle
                cx="600"
                cy="300"
                r="4"
                fill="#2165BF"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
            </svg>
          </motion.div>

          {/* Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Revolutionizing future steps in{" "}
              <span className="bg-transparent bg-clip-text text-transparent w-full  xl:leading-snug bg-gradient-to-r from-[#3A53FE] via-[#00D1FF] to-[#00D1FF] ">Ed-Tech</span> and{" "}
              <span className="text-[#714fa7]">AI</span>
            </h1>
            <div className="text-center text-gray-400">
             <p className="text-xl mb-2">Leveraging innovative solutions that will take you to</p>
             <p className="text-xl w-4/5 mx-auto mb-1">this next level in your learning</p>
             <p className="text-xl w-2/3 mx-auto">and professional journey</p>
          </div>

            <div className="space-y-4 mt-20">
              <p className="text-[#613AA0]">Get our App from</p>
              <div className="flex justify-center gap-4">
                <>
                <img
                  src="/placeholder.svg?height=44&width=150"
                  alt="Get it on Google Play"
                  width={150}
                  height={44}
                  className="h-11 w-auto"
                />
                <img
                  src="/placeholder.svg?height=44&width=150"
                  alt="Download on the App Store"
                  width={150}
                  height={44}
                  className="h-11 w-auto"
                />
                </>
              </div>
            </div>
          </motion.div>

          {/* Feature carousel */}
          <div className="relative max-w-5xl mx-auto">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + features.length) % features.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800/50 rounded-full hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % features.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800/50 rounded-full hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="overflow-hidden">
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

            {/* Carousel dots */}
            <div className="flex justify-center gap-2 mt-8">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSlide === index ? "bg-[#2165BF]" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

