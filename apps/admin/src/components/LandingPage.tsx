import { useState } from 'react'
import { Link } from 'react-router-dom'


export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const features = [
    {
      title: "Unified Platform",
      description: "Access all your educational resources in one place with our comprehensive platform",
    },
    {
      title: "AI-Powered Learning",
      description: "Experience personalized learning paths adapted to your unique needs and goals",
    },
    {
      title: "Smart Progress",
      description: "Track your progress with detailed analytics and performance insights",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
   

      {/* Hero Section */}
      <main className="container relative mx-auto px-4 py-20 text-center backdrop-blur-sm">
        <div className="relative mx-auto max-w-4xl rounded-xl bg-black/30 p-8 backdrop-blur-md">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Revolutionizing future steps in{" "}
            <span className="text-blue-400">Ed-Tech</span> and{" "}
            <span className="text-blue-400">AI</span>
          </h1>
          <p className="mb-12 text-lg text-gray-400">
            Leveraging innovative solutions that will take you to the next level in
            your learning and professional journey
          </p>

          {/* App Store Buttons */}
          <div className="mb-16">
            <p className="mb-4 text-sm font-medium">Get our App from</p>
            <div className="flex justify-center gap-4">
              <Link to="#">
                <img
                  src="/placeholder.svg?height=40&width=135"
                  alt="Get it on Play Store"
                  width={135}
                  height={40}
                  className="hover:opacity-80"
                />
              </Link>
              <Link to="#">
                <img
                  src="/placeholder.svg?height=40&width=135"
                  alt="Download on App Store"
                  width={135}
                  height={40}
                  className="hover:opacity-80"
                />
              </Link>
            </div>
          </div>

          {/* Feature Cards Carousel */}
          {/* <Carousel 
            className="mx-auto max-w-xs sm:max-w-xl bg-black/20 backdrop-blur-sm rounded-xl p-4"
            onSelect={(index) => setCurrentSlide(index)}
          >
            <CarouselContent>
              {features.map((feature, index) => (
                <CarouselItem key={index}>
                  <Card className="bg-black/30 p-6 backdrop-blur-sm">
                    <h3 className="mb-2 text-lg font-semibold text-blue-400">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-gray-800 bg-gray-900/50 text-gray-400 hover:bg-gray-800 hover:text-white" />
            <CarouselNext className="border-gray-800 bg-gray-900/50 text-gray-400 hover:bg-gray-800 hover:text-white" />
          </Carousel> */}

          {/* Carousel Indicators */}
          {/* <div className="mt-4 flex justify-center gap-2">
            {features.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${
                  currentSlide === index ? 'bg-blue-400' : 'bg-gray-600'
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div> */}
        </div>
      </main>
    </div>
  )
}

