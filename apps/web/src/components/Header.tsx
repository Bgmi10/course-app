import { ArrowRight } from "lucide-react";

export default function Header (){
   return(
     <>
        <header className="flex justify-between items-center mb-16">
          <nav className="hidden md:flex space-x-8">
            {['Home', 'Products', 'Courses', 'Quizes', 'SecX Coin'].map((item) => (
              <a key={item} href="#" className="hover:text-blue-400 transition-colors">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-md hover:text-blue-400 transition-colors">
              Sign in
            </button>
            <button className="px-6 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors group">
              Get started
              <ArrowRight className="ml-2 inline-block transform rotate-[-50deg] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </header>
     </>
   )
}