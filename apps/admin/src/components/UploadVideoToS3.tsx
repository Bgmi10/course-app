import React, { useState, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FetchFoldersFromS3, deleteFromS3, uploadToS3 } from '../utils/s3upload';
import { FolderIcon, UploadIcon, PlusIcon, FolderPlusIcon, Loader2Icon, Delete, Trash } from 'lucide-react';
import { SuccessMessage } from './SuccessMessage';
import { ErrorMessage } from './ErrorMessage';

export default function UploadVideoToS3() {
  const [userInput, setUserInput] = useState<string>('');
  const [userFolders, setUserFolders] = useState<string[] | null>([]);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchS3Folders = async () => {
      try {
        const folders = await FetchFoldersFromS3('sec-xx');
        setUserFolders(folders);
      } catch (error) {
        console.error('Error fetching folders:', error);
        setError('Failed to load folders from S3.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchS3Folders();
  }, []);

  const handleCreateAFolder = (parentIndex: number | null = null) => {
    if (!userInput) {
      setError('Please provide a name');
      return;
    }
    const newFolder = parentIndex === null
      ? userInput
      : `${userFolders[parentIndex]}${userInput}`;

    setUserFolders(prev => [...prev, newFolder]);
    setUserInput('');
    setMessage(`Folder "${newFolder}" created successfully`);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError('Please upload a file');
      return;
    }
    try {
      await uploadToS3(file, userFolders[index]);
      setMessage(`File uploaded successfully to ${userFolders[index]}`);
    } catch (err) {
      console.error('Upload failed', err);
      setError('File upload failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center"
        >
          <Loader2Icon className="w-8 h-8 sm:w-10 sm:h-10 mr-4 animate-spin" />
          Loading...
        </motion.div>
      </div>
    );
  }

  const handleDelete = async (index) => {
    try{
      console.log(userFolders[index])
    await deleteFromS3(userFolders[index])
    setMessage(`${userFolders[index]} deleted sucessfully`);
  }
  catch(e){
    console.log(e);
    setError(e);
  }
  }

  return (
    <div className="min-h-screen text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-center bg-clip-text text-transparent w-full mx-auto pb-8 xl:leading-snug bg-gradient-to-b from-blue-600 via-gray-600 to-white"
        >
          Upload Videos
        </motion.h1>

        <AnimatePresence>
          {message && <SuccessMessage message={message} />}
          {error && <ErrorMessage message={error} />}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl shadow-2xl overflow-hidden border border-gray-900"
        >
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-8">
              <input
                type="text"
                value={userInput}
                placeholder="Enter folder name"
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full sm:flex-grow px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:w-1/2 sm: w-full flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 ease-in-out shadow-lg"
                onClick={() => handleCreateAFolder()}
              >
                <PlusIcon className="w-6 h-6 mr-2" />
                Create Folder
              </motion.button>
            </div>

            <AnimatePresence>
              {userFolders.map((folder, index) => (
                <motion.div
                  key={folder}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-800 rounded-lg p-4 mb-4 hover:bg-gray-700 transition duration-200"
                >
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <FolderIcon className="w-6 h-6 text-blue-400 flex-shrink-0" />
                    <span className="text-lg break-all">{folder}</span>
                  </div>
                  
                  <motion.label
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 ease-in-out cursor-pointer shadow-md"
                  >
                    <UploadIcon className="w-5 h-5 mr-2" />
                    Upload File
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, index)}
                    />
                    
                  </motion.label>
                  <Trash  className='cursor-pointer hover:text-red-500' onClick={() => handleDelete(index)}/>
                </motion.div>
              ))}
            </AnimatePresence>

            {userFolders.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-8 sm:mt-12"
              >
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-blue-400">Create Subfolder in Existing Folder:</h3>
                {userFolders.map((folder, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                    <span className="text-gray-400 text-lg break-all">{folder}</span>
                    <div className="w-full sm:flex-grow flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                      <input
                        type="text"
                        value={userInput}
                        placeholder="Enter subfolder name"
                        onChange={(e) => setUserInput(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="lg:w-1/2 sm: w-full flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 ease-in-out shadow-lg"
                        onClick={() => handleCreateAFolder(index)}
                      >
                        <FolderPlusIcon className="w-5 h-5 mr-2" />
                        Create Subfolder
                      </motion.button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

