import { useState, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FetchFoldersFromS3,
  deleteFolderFromS3,
  uploadToS3,
} from '@secx/utils/src/s3upload';
import {
  FolderIcon,
  UploadIcon,
  PlusIcon,
  Trash,
} from 'lucide-react';
import { SuccessMessage } from './SuccessMessage';
import { ErrorMessage } from './ErrorMessage';
import { bucketName } from '@secx/utils/src/constants';
import Loader from './Loder';

interface UploadProgress {
  fileName: string;
  progress: number;
}

export default function UploadVideoToS3() {
  const [userInput, setUserInput] = useState<string>('');
  const [subfoldername, setSubFolderName] = useState<Record<number, string>>({});
  const [userFolders, setUserFolders] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress[]>>({});

  useEffect(() => {
    const fetchS3Folders = async () => {
      try {
        const { folders } = await FetchFoldersFromS3(bucketName);
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

  const handleCreateAFolder = (parentIndex: any = null) => {
    let folderName = parentIndex === null ? userInput : subfoldername[parentIndex] || '';

    if (!folderName) {
      setError('Please provide a folder name');
      return;
    }
    let newFolder: string;
    if (parentIndex === null) {
      newFolder = `${folderName}/`;
    } else {
      const parentFolder = userFolders[parentIndex].endsWith('/')
        ? userFolders[parentIndex].slice(0, -1)
        : userFolders[parentIndex];
      newFolder = `${parentFolder}/${folderName}/`;
    }

    setUserFolders((prev) => [...prev, newFolder]);
    setMessage(`Folder "${newFolder}" created successfully`);
    setUserInput('');
    setSubFolderName((prev) => ({ ...prev, [parentIndex]: '' }));
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, folderPath: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setError('Please select files to upload');
      return;
    }

    const fileArray = Array.from(files);

    try {
      // Upload files in parallel using Promise.all
      await Promise.all(
        fileArray.map((file) => {
          const fileName = file.name;
          const uniqueId = `${folderPath}-${Date.now()}-${fileName}`;

          // Add upload progress placeholder
          setUploadProgress((prev) => ({
            ...prev,
            [folderPath]: [...(prev[folderPath] || []), { fileName, progress: 0 }],
          }));

          return uploadToS3(file, folderPath, (percentage) => {
            // Update progress for each file
            setUploadProgress((prev) => {
              const folderUploads = prev[folderPath] || [];
              return {
                ...prev,
                [folderPath]: folderUploads.map((upload) =>
                  upload.fileName === fileName
                    ? { ...upload, progress: percentage }
                    : upload
                ),
              };
            });
          })
            .then(() => {
              // Display success message for the uploaded file
              setMessage(`File "${fileName}" uploaded successfully`);
            })
            .catch((err) => {
              console.error('Upload failed', err);
              setError(`Failed to upload file "${fileName}". Please try again.`);
            })
            .finally(() => {
              // Remove the file from the progress list after upload
              setUploadProgress((prev) => ({
                ...prev,
                [folderPath]: (prev[folderPath] || []).filter(
                  (upload) => upload.fileName !== fileName
                ),
              }));
            });
        })
      );
    } catch (err) {
      console.error('Error during parallel upload:', err);
      setError('Failed to upload some files. Please try again.');
    }
  };

  const handleDelete = async (folderPath: string) => {
    try {
      await deleteFolderFromS3(folderPath);
      setMessage(`${folderPath} deleted successfully`);
      setUserFolders((prev) =>
        prev.filter((folder) => !folder.startsWith(folderPath))
      );
    } catch (e) {
      console.error(e);
      setError('Failed to delete folder. Please try again.');
    }
  };

  if (isLoading) {
    return <Loader />;
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
          Upload Videos to S3
        </motion.h1>

        <AnimatePresence>
          {message && <SuccessMessage message={message} />}
          {error && <ErrorMessage message={error} />}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Create Folder Name"
              className="flex-1 border border-gray-700 outline-none p-2 rounded-md text-white bg-gray-800"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
              onClick={() => handleCreateAFolder(null)}
            >
              <PlusIcon className="w-5 h-5 inline-block" /> Add Folder
            </button>
          </div>
        </motion.div>

        <div className="mt-8">
          {userFolders.map((folder, index) => (
            <div
              key={folder}
              className="border border-gray-600 rounded-md bg-gradient-to-b from-gray-700 to-gray-900 p-4 mb-4"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <FolderIcon className="w-6 h-6 text-blue-400 mr-2" />
                  <span className="text-lg font-semibold">{folder}</span>
                </div>
                <div>
                  <button
                    className="text-red-500 hover:text-red-700 transition duration-300"
                    onClick={() => handleDelete(folder)}
                  >
                    <Trash className="w-5 h-5 inline-block" /> Delete
                  </button>
                </div>
              </div>

              <div className="flex space-x-4 mb-2">
                <input
                  type="text"
                  placeholder="Create Subfolder"
                  className="flex-1 border p-2 rounded-md text-black bg-gray-800 outline-none border-gray-600"
                  value={subfoldername[index] || ''}
                  onChange={(e) =>
                    setSubFolderName((prev) => ({
                      ...prev,
                      [index]: e.target.value,
                    }))
                  }
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                  onClick={() => handleCreateAFolder(index)}
                >
                  <PlusIcon className="w-5 h-5 inline-block" /> Add Subfolder
                </button>
              </div>

              <div className="flex space-x-4">
                <label
                  htmlFor={`upload-${index}`}
                  className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300"
                >
                  <UploadIcon className="w-5 h-5 inline-block" /> Upload Files
                </label>
                <input
                  id={`upload-${index}`}
                  type="file"
                  className="hidden"
                  multiple // Allow multiple file selection
                  onChange={(e) => handleFileChange(e, folder)}
                />
              </div>

              {uploadProgress[folder] && uploadProgress[folder].length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadProgress[folder].map(({ fileName, progress }) => (
                    <div key={fileName} className="relative">
                      <div className="h-2 bg-gray-300 rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-400 mt-1 inline-block">
                        {fileName} - {progress.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
