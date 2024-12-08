import { child, get, ref } from "firebase/database";
import { motion } from 'framer-motion';
import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { Loader2, Search, UserCircle, CheckCircle, Ban } from 'lucide-react';
import { Link } from "react-router-dom";

interface User {
  age: string;
  country: string;
  course: string;
  designation: string;
  company: string;
  email: string;
  experience: string;
  firstName: string;
  id: string;
  instituteName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  specialization: string
  password: string;
  profession: string;
  state: string;
  profileUrl: string;
  isOnline: boolean;
  suspended: boolean;
}

export default function StudentsList() {
  const [data, setData] = useState<User[] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "suspended" | "online" | "offline">("all");

  useEffect(() => {
    const fetch_users = async () => {
      try {
        const snapshot = await get(child(ref(db), 'Users'));

        if (snapshot.exists()) {
          const value = snapshot.val();
          const userArray = Object.keys(value).map((i) => ({
            id: i,
            ...value[i]
          }));
          setData(userArray);
        }
      } catch (e) {
        console.log(e);
      }
    }
    fetch_users();
  }, [])

  const filteredData = data?.filter((user) => {
    // Apply filter based on the selected status
    if (filter === "online" && !user.isOnline) return false;
    if (filter === "active" && user.suspended) return false;
    if (filter === "suspended" && !user.suspended) return false;
    if(filter === "offline" && user.isOnline) return false

    // Apply search term filter
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });
  

  if (!data) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl font-extrabold leading-tight text-center bg-clip-text text-transparent w-full mx-6 pb-4 xl:leading-snug bg-gradient-to-b from-blue-600 via-gray-600 to-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Users List
        </motion.h1>

        <div className="mt-8 mb-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-800 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:ring-2 transition duration-200"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md transition duration-200 ${
                filter === "all" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-md transition duration-200 ${
                filter === "active" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("suspended")}
              className={`px-4 py-2 rounded-md transition duration-200 ${
                filter === "suspended" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Suspended
            </button>
            <button
              onClick={() => setFilter("online")}
              className={`px-4 py-2 rounded-md transition duration-200 ${
                filter === "online" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Online
            </button>
            <button
              onClick={() => setFilter("offline")}
              className={`px-4 py-2 rounded-md transition duration-200 ${
                filter === "offline" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Offline
            </button>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredData?.map((user) => (
            <Link to={`/student/${user.id}`} key={user.id} className="block">
              <motion.div
                className="border-gray-900 border rounded-lg p-6 hover:bg-gray-900 transition-colors duration-200 relative"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {(
                  <div className={`absolute top-2 right-2 flex items-center ${user?.suspended ? "text-red-500" : "text-green-500"}`}>
                    {user?.suspended ? <Ban size={16} className="mr-1"/> : <CheckCircle size={16} className="mr-1" />}
                    <span className="text-xs font-semibold">{!user?.suspended ? "Active" : "Suspended"}</span>
                  </div>
                )}
                <div className="flex items-center mb-4">
                  <div className="relative">
                    {user.profileUrl ? (
                      <img src={user.profileUrl} alt={`${user.firstName} ${user.lastName}`} className="w-12 h-12 rounded-full mr-4" />
                    ) : (
                      <UserCircle className={`w-12 h-12 text-gray-400 mr-4 ${user.isOnline ? "border-green-500" :  "border-red-500"} border-2 rounded-full`} />
                    )}
                    {/* <FontAwesomeIcon 
                      icon={faCircle} 
                      className={`${user.isOnline ? "text-green-500" : "text-red-500"} absolute bottom-1 right-5 text-xs`} 
                    /> */}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{user.firstName} {user.lastName}</h2>
                    <p className="text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  <p><span className="font-semibold text-gray-300">Profession:</span> {user.profession || 'N/A'}</p>
                  <p><span className="font-semibold text-gray-300">Company:</span> {user.company || 'N/A'}</p>
                  <p><span className="font-semibold text-gray-300">Country:</span> {user.country || 'N/A'}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {filteredData?.length === 0 && (
          <motion.p
            className="text-center text-gray-400 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No users found matching your search.
          </motion.p>
        )}
      </div>
    </div>
  )
}

