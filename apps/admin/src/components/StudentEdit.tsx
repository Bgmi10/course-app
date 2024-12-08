import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faTrash, faUpload, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { child, get, ref, update, remove } from "firebase/database";
import { db } from "../utils/firebase";
import { uploadToS3, deleteFromS3 } from '../utils/s3upload';
import { useDropzone } from 'react-dropzone';
import Loader from './Loder';
import { ErrorMessage } from './ErrorMessage';
import { UserCircle } from 'lucide-react';

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
  specialization: string;
  password: string;
  profession: string;
  state: string;
  profileUrl: string;
  isOnline: boolean;
  suspended: boolean;
}

export default function StudentEdit() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const snapshot = await get(child(ref(db), `Users/${id}`));
        const value = snapshot.val();
        setUser(value);
      } catch (e) {
        console.error(e);
        setError('Failed to fetch user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await update(ref(db, `Users/${id}`), user);
      setSuccessMessage('User updated successfully!');
      setEditMode(false);
    } catch (e) {
      console.error(e);
      setError('Failed to update user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setIsLoading(true);
    try {
      if (user.profileUrl) {
        await deleteFromS3(user.profileUrl);
      }
      await remove(ref(db, `Users/${id}`));
      setSuccessMessage('User deleted successfully!');
      // Redirect to users list or home page
    } catch (e) {
      console.error(e);
      setError('Failed to delete user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!user) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const file = acceptedFiles[0]; 
      const url = await uploadToS3(file, 'profile-images');
      setUploadProgress(100);
      setUser(prev => prev ? { ...prev, profileUrl: url } : null);
      setSuccessMessage('Profile image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeProfileImage = async () => {
    if (!user || !user.profileUrl) return;
    try {
      await deleteFromS3(user.profileUrl);
      setUser(prev => prev ? { ...prev, profileUrl: '' } : null);
      setSuccessMessage('Profile image removed successfully!');
    } catch (error) {
      console.error('Error removing image:', error);
      setError('Failed to remove image. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <ErrorMessage message={error} />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold"
        >
          User not found
        </motion.div>
      </div>
    );
  }

  const handleSuspend = (value: boolean) => {
    setUser((prev: any) => ({...prev, suspended: value}));
  }

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-4xl mx-auto bg-black/80 border border-slate-900 p-8 rounded-xl shadow-lg backdrop-blur-sm">
        <div className='flex items-center'>
          <button
            onClick={() => setEditMode(prev => !prev)}
            className={`relative lg:inline-flex items-center h-8 sm:hidden rounded-full w-[85px] transition-colors duration-300 focus:outline-none ${
              editMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={editMode}
          >
            <span className="sr-only">{editMode ? 'Disable edit mode' : 'Enable edit mode'}</span>
            <motion.span
              className={`inline-block w-6 h-6 transform rounded-full transition-transform duration-300 ${
                editMode ? 'translate-x-9 bg-white' : 'translate-x-1 bg-blue-600'
              }`}
              layout
              transition={{
                type: 'spring',
                stiffness: 700,
                damping: 30
              }}
            />
          </button>
          <span className="ml-3 text-xs font-medium text-gray-200 sm:hidden lg:inline">
            {editMode ? 'Editor Mode' : 'Viewer Mode'}
          </span>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl font-extrabold leading-tight text-center bg-clip-text text-transparent w-full mx-6 pb-4 xl:leading-snug dark:bg-gradient-to-b dark:from-blue-600 dark:via-gray-600 dark:to-white"
          >
            Edit {user?.firstName}
          </motion.h1>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-red-500 text-white p-4 rounded-md mb-4"
          >
            {error}
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-green-500 text-white p-4 rounded-md mb-4"
          >
            {successMessage}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center mb-4 gap-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-md ${
                editMode ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'
              } transition duration-300`}
            >
              <FontAwesomeIcon icon={editMode ? faSave : faPencilAlt} className="mr-2" />
              {editMode ? 'Save Changes' : user?.firstName}
            </button>
            {editMode && (
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md transition duration-300"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Delete {user?.firstName}
              </button>
            )}
          </div>

          <div className="space-y-4">
            <input
              type="text"
              name="firstName"
              value={user.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!editMode}
            />
            <input
              type="text"
              name="lastName"
              value={user.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!editMode}
            />
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!editMode}
            />
            <input
              type="text"
              name="phoneNumber"
              value={user.phoneNumber}
              onChange={handleInputChange}
              placeholder="Phone Number"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!editMode}
            />
            <input
              type="text"
              name="country"
              value={user.country}
              onChange={handleInputChange}
              placeholder="Country"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!editMode}
            />
            <input
              type="text"
              name="state"
              value={user.state}
              onChange={handleInputChange}
              placeholder="State"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!editMode}
            />
            <select
              name="suspended"
              onChange={(e) => handleSuspend(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!editMode}
            >   {!editMode && <option>{user?.suspended ? "Suspended" : "Active"}</option>}
                <option value={"true"}>Suspended</option>
                <option value={"false"}>Active</option>
            </select>
          </div>

          {editMode && (
            <div
              {...getRootProps()}
              className={`p-6 border-2 border-dashed rounded-md text-center cursor-pointer transition-colors duration-300 ${
                isDragActive ? 'border-blue-500 bg-blue-500 bg-opacity-10' : 'border-gray-600 hover:border-blue-500 hover:bg-blue-500 hover:bg-opacity-10'
              }`}
            >
              <input {...getInputProps()} />
              <FontAwesomeIcon icon={faUpload} className="text-4xl mb-2 text-blue-400" />
              <p className="text-gray-300">Drag 'n' drop profile image here, or click to select file</p>
            </div>
          )}

          {isUploading && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              className="h-2 bg-blue-500 rounded-full"
            />
          )}

          {user.profileUrl ? (
            <div className="relative group">
              <img src={user.profileUrl} alt="Profile" className="w-full h-64 object-cover rounded-md" />
              {editMode && (
                <button
                  onClick={removeProfileImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>

          ) : <>{!editMode && <div> <UserCircle /> <span className='text-semibold text-red-500'>user profile not found upload one !</span></div>}</>}

          {editMode && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 flex items-center"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Save Changes
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

