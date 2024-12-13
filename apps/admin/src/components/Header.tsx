import { useState, useContext} from 'react';
import { FaBars, FaTimes, FaUserGraduate, FaChalkboardTeacher, FaClipboardList, FaTicketAlt, FaUserCircle, FaUpload, FaCalendarAlt, FaAccusoft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOut } from '@fortawesome/free-solid-svg-icons';


export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  //@ts-ignore
  const { isauthenticated, user, Logout } =  useContext(AuthContext);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="p-5 bg-black text-white">
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-stone-500 mt-[-10px]">SecX</span>

        <nav className="hidden md:flex gap-6 items-center">
          <Link to="/pathway" className=" text-sm font-medium hover:text-blue-400 transition-colors flex items-center gap-2 ">
            <FaAccusoft /> <span>Create Pathway</span>
          </Link>
          <Link to="/upload-videos" className=" text-sm font-medium hover:text-blue-400 transition-colors flex items-center gap-2 ">
            <FaUpload /> <span>Upload videos</span>
          </Link>
          <Link to="/create-course" className=" text-sm font-medium hover:text-blue-400 transition-colors flex items-center gap-2 ">
            <FaChalkboardTeacher /> <span>Create Course</span>
          </Link>
          <Link to="/view-courses" className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors">
            <FaClipboardList /> <span>View Courses</span>
          </Link>
          <Link to="/student-list" className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors">
            <FaUserGraduate /> <span>Student List</span>
          </Link>
          <Link to="/events" className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors">
            <FaTicketAlt/> <span>Events planning</span>
          </Link>
           <Link to="/events-management" className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors">
           <FaCalendarAlt /> <span>Events Management</span>
          </Link>
          <div className="flex items-center gap-4">
          {isauthenticated ?   <span onClick={() => Logout()} className='cursor-pointer text-sm font-medium'>Logout <FontAwesomeIcon icon={faSignOut} /></span> : <button className="bg-blue-400 p-2 w-32 font-medium rounded-lg text-white hover:bg-blue-500 transition-colors" onClick={() => window.location.href = '/signin'}>
            Sign in
          </button>}
          
        </div>
        </nav>

        <div className="md:hidden flex gap-3">
          <button onClick={toggleMenu}>
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
          {/* { isauthenticated && <FaUserCircle fontSize={24} onClick={() => Logout()}/> } */}
           { isauthenticated && <span onClick={() => Logout()}>Logout <FontAwesomeIcon icon={faSignOut} /></span>}
        </div>
      </div>

      {isOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 md:hidden flex flex-col gap-4 text-center "
        >
          <Link to="/upload-videos" className="justify-center text-sm font-medium hover:text-blue-400 transition-colors flex items-center gap-2">
            <FaUpload /> <span>Upload videos</span>
          </Link>
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
