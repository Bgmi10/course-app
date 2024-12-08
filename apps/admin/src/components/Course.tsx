import { child, get, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { db } from "../utils/firebase"
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Section {
    id: string;
    lessons: Lesson[];
    title: string;
}

interface Lesson {
    id: string;
    duration: number;
    description: string;
    title: string;
    videoUrl: string;
}

interface Course {
 id: string;
 description: string;
 imageFiles: string[];
 averageRating: number;
 categoryId: string;
 createdAt: string;
 instructorId: string;
 price: number;
 quizzes: any;
 sections: Section[];
 title: string;
}

export default function Courses() {
    const [courses, setCourses] = useState<Course[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const snapshot = await get(child(ref(db), '/courses'));
                if (snapshot.exists()) {
                    const val = snapshot.val();
                    const courseArray = Object.keys(val).map((key) => ({
                        id: key,
                        ...val[key]
                    }));
                    setCourses(courseArray);
                } else {
                    setError('No courses available');
                }
            } catch (e) {
                console.error(e);
                setError('Failed to fetch courses');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white p-6">
                <div className="container mx-auto">
                    <motion.h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl font-extrabold leading-tight text-center bg-clip-text text-transparent w-full mx-6 pb-4 xl:leading-snug bg-gradient-to-b from-blue-600 via-gray-600 to-white"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    >
                        Courses
                    </motion.h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse">
                                <div className="h-48 bg-gray-700"></div>
                                <div className="p-4">
                                    <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Oops!</h1>
                    <p className="text-xl">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="container mx-auto">
                <motion.h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl font-extrabold leading-tight text-center bg-clip-text text-transparent w-full mx-6 pb-4 xl:leading-snug bg-gradient-to-b from-blue-600 via-gray-600 to-white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                    Courses
                </motion.h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
                    {courses?.map((course) => (
                        <Link key={course.id} to={`/edit-course/${course.id}`} className="bg-slate-950 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
                            <img 
                                src={course.imageFiles?.[0] || '/placeholder.svg?height=200&width=300'} 
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
    );
}

