import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { motion } from 'framer-motion';
import { child, get, ref } from "firebase/database";
import { Link } from "react-router-dom";

export default function EventManagement (){

    interface Data{
        id: string;
        capacity: number;
        createdBy: string;
        date: string;
        description: string;
        endTime: string;
        endTimeAMPM: string;
        location: string;
        startTime: string;
        startTimeAMPM: string;
        status: string;
        thumbnail: string;
        title: string;
    }

    const [data, setData] = useState<null | Data[]>(null);

    useEffect(() => {
       const fetch_events = async() => {

         const snapshot = await get(child(ref(db),'events'));

         if(snapshot.exists()){
            const value = snapshot.val();
            const eventArray = Object.keys(value).map((i) => ({
                id: i,
                ...value[i]
            }));
            setData(eventArray);
         }
       }

       fetch_events();
    },[]);

    return(
     <>
        <div className="min-h-screen bg-black text-white p-6">
            <div className="container mx-auto">
                <motion.h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl font-extrabold leading-tight text-center bg-clip-text text-transparent w-full mx-6 pb-4 xl:leading-snug bg-gradient-to-b from-blue-600 via-gray-600 to-white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                    Events Zone
                </motion.h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
                    {data?.map((course) => (
                        <Link key={course.id} to={`/events-edit/${course.id}`} className="bg-slate-950 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
                            <img 
                                src={course?.thumbnail?.[0]} 
                                alt={course.title} 
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h2 className="font-semibold text-xl text-white mb-2">{course.title}</h2>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
     </>
    )
}