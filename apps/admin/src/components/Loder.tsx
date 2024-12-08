import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Loader (){
    return(
        <>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
         <motion.div
           initial={{ opacity: 0, scale: 0.5 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5 }}
           className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center"
          >
           <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 mr-4 animate-spin" />
           Loading...
         </motion.div>
        </div>
        </>
    )
}