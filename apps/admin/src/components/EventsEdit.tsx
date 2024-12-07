import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faPencilAlt, faTrash, faUpload, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { child, get, ref, update, remove } from "firebase/database";
import { db } from "../utils/firebase";
import { uploadToS3, deleteFromS3 } from '../utils/s3upload';
import { useDropzone } from 'react-dropzone';
import { ErrorMessage } from './ErrorMessage';
import { SuccessMessage } from './SuccessMessage';
import { Loader2Icon } from 'lucide-react';

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
    thumbnail: string[];
    title: string;
}

export default function EventsEdit() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Data | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const snapshot = await get(child(ref(db), `events/${id}`));
        if (snapshot.exists()) {
          setData(snapshot.val());
        } else {
          setError('Event not found');
        }
      } catch (e) {
        console.error(e);
        setError('Failed to fetch event data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleChangeStatus = (e: string) => {
     setData(prev => prev ? {...prev, status: e} : null)
  }

  const handleSave = async () => {
    if (!data) return;
    setIsLoading(true);
    try {
      await update(ref(db, `events/${id}`), data);
      setSuccessMessage('Event updated successfully!');
      setEditMode(false);
    } catch (e) {
      console.error(e);
      setError('Failed to update event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!data) return;
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    setIsLoading(true);
    try {
      const urls = data?.thumbnail?.map((i) => deleteFromS3(i));
      await Promise.all(urls);
      await remove(ref(db, `events/${id}`));
      setSuccessMessage('Event deleted successfully!');
      navigate('/events-management');
    } catch (e) {
      console.error(e);
      setError('Failed to delete event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!data) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const file = acceptedFiles[0];
      const uploadFiles = acceptedFiles?.map((i) => uploadToS3(i, 'events-thumbnails'));
      const urls = await Promise.all(uploadFiles);
      //@ts-ignore
      setData(prev => prev ? { ...prev, thumbnail: [...prev.thumbnail, urls]} : null);
      setSuccessMessage('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [data]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold flex items-center"
        >
          <Loader2Icon className="w-10 h-10 mr-4 animate-spin" />
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-red-500 text-2xl"
        >
          {error}
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold"
        >
          Event not found
        </motion.div>
      </div>
    );
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
            Edit Event
          </motion.h1>
        </div>

        <ErrorMessage message={error} />
        <SuccessMessage message={successMessage} />

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
              {editMode ? 'Save Changes' : 'Edit Event'}
            </button>
            {editMode && (
              <button
                onClick={handleDeleteEvent}
                className="px-4 py-2 bg-red-500   hover:bg-red-600 rounded-md transition duration-300"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Delete Event
              </button>
            )}
          </div>

          <div className="space-y-4">
            <input
              type="text"
              name="title"
              value={data.title}
              onChange={handleInputChange}
              placeholder="Event Title"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!editMode}
            />
            <textarea
              name="description"
              value={data.description}
              onChange={handleInputChange}
              placeholder="Event Description"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              disabled={!editMode}
            />
            <input
              type="text"
              name="location"
              value={data.location}
              onChange={handleInputChange}
              placeholder="Event Location"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!editMode}
            />
            <input
              type="date"
              name="date"
              value={data.date}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!editMode}
            />
            <div className="flex space-x-4">
              <input
                type="text"
                name="startTime"
                value={data.startTime}
                onChange={handleInputChange}
                className="w-1/2 p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!editMode}
              />
              <span className="items-center flex font-serif">to</span>
              <input
                type="text"
                name="endTime"
                value={data.endTime}
                onChange={handleInputChange}
                className="w-1/2 p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!editMode}
              />
            </div>
            <input
              type="number"
              name="capacity"
              value={data.capacity}
              onChange={handleInputChange}
              placeholder="Event Capacity"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!editMode}
            />
          </div>

          {
            !editMode && <input value={data?.status} className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled/>
          }
          
          {
            editMode && <select name="status" className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={!editMode} onChange={(e: any) => handleChangeStatus(e.target.value)} value={data?.status}>
              <option>Opened</option>
              <option>Closed</option>
            </select>
          }

          {editMode && (
            <div
              {...getRootProps()}
              className={`p-6 border-2 border-dashed rounded-md text-center cursor-pointer transition-colors duration-300 ${
                isDragActive ? 'border-blue-500 bg-blue-500 bg-opacity-10' : 'border-gray-600 hover:border-blue-500 hover:bg-blue-500 hover:bg-opacity-10'
              }`}
            >
              <input {...getInputProps()} />
              <FontAwesomeIcon icon={faUpload} className="text-4xl mb-2 text-blue-400" />
              <p className="text-gray-300">Drag 'n' drop event thumbnail here, or click to select file</p>
            </div>
          )}

          {isUploading && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              className="h-2 bg-blue-500 rounded-full"
            />
          )}

          <div className="mt-4">
            {data.thumbnail.length > 0 && (
              <div className="relative group">
                {
                  data?.thumbnail.map((i, index) =>
                  <div key={index}>
                    <img src={i} alt="Event thumbnail" className="w-52 h-auto object-cover rounded-md m-1" />
                    {editMode && <button
                    onClick={
                      async () => {
                      await deleteFromS3(i);
                      setData(prev => prev ? { ...prev, thumbnail: prev.thumbnail.filter((thumbnail, thumbIndex) => thumbIndex !== index) } : null);
                    }}
                    className=" ml-1 mt-2 top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                     <FontAwesomeIcon icon={faTimes} />
                    </button>}
                  </div>
                )}
              </div>
            )}
          </div>
          

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
