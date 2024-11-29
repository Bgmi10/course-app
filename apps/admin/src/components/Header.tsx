import { useState, useContext} from 'react';
import { FaBars, FaTimes, FaUserGraduate, FaChalkboardTeacher, FaClipboardList, FaTicketAlt, FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';



export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { isauthenticated, user, Logout } =  useContext(AuthContext);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="p-5 bg-black text-white">
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-stone-500 mt-[-10px]">SecX</span>

        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/create-course" className=" text-sm font-medium hover:text-blue-400 transition-colors flex items-center gap-2 ">
            <FaChalkboardTeacher /> <span>Create Course</span>
          </Link>
          <Link to="/view-courses" className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors">
            <FaClipboardList /> <span>View Courses</span>
          </Link>
          <a to="/student-list" className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors">
            <FaUserGraduate /> <span>Student List</span>
          </a>
          <a to="/events" className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors">
            <FaTicketAlt/> <span>Events planning</span>
          </a>
          <div className="flex items-center gap-4">
          {isauthenticated ? <FaUserCircle fontSize={24} onClick={() => Logout()}  className='cursor-pointer hover:text-blue-400'/>  : <button className="bg-blue-400 p-2 w-32 font-medium rounded-lg text-white hover:bg-blue-500 transition-colors" onClick={() => window.location.href = '/signin'}>
            Sign in
          </button>}
        </div>
        </nav>

        <div className="md:hidden flex gap-3">
          <button onClick={toggleMenu}>
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
          { isauthenticated && <FaUserCircle fontSize={24} onClick={() => Logout()}/> }
        </div>
      </div>

      {isOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 md:hidden flex flex-col gap-4 text-center "
        >
         <Link to="/create-course" className="justify-center text-sm font-medium hover:text-blue-400 transition-colors flex items-center gap-2 ">
            <FaChalkboardTeacher /> <span>Create Course</span>
          </Link>
          <Link to="/view-courses" className="justify-center flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors">
            <FaClipboardList /> <span>View Courses</span>
          </Link>
          <Link to="/student-list" className="justify-center flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors">
            <FaUserGraduate /> <span>Student List</span>
          </Link>
          <Link to="/events" className="justify-center flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors">
            <FaTicketAlt/> <span>Events planning</span>
          </Link>
          <div className="justify-center flex items-center gap-4">
          {!isauthenticated && <button className="bg-blue-400 p-2 w-32 font-medium rounded-lg text-white hover:bg-blue-500 transition-colors" onClick={() => window.location.href = '/signin'}>
            Sign in
          </button>}
          </div>

        </motion.nav>
      )}
    </header>
  );
};
