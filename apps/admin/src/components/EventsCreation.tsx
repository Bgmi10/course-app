import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight, faCheck, faUpload, faTimes } from '@fortawesome/free-solid-svg-icons'
import { ref, set } from 'firebase/database'
import { db } from '@secx/utils/src/firebase'
import { deleteFromS3, uploadToS3 } from '@secx/utils/src/s3upload'
import { useDropzone } from 'react-dropzone'
import { ErrorMessage } from './ErrorMessage'
import { SuccessMessage } from './SuccessMessage'
import { useNavigate } from 'react-router-dom'

interface Form {
  title: string
  description: string
  location: string
  capacity: number
  registeredUser: string[]
  status: string
  createdBy: string
  startTime: string
  endTime: string
  thumbnail: string[]
  date: string
  startTimeAMPM: 'AM' | 'PM';
  endTimeAMPM: 'AM' | 'PM';
  speaker: string;
  price: number;
}

export default function EventCreation() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<Form>({
    title: '',
    description: '',
    location: '',
    capacity: 0,
    registeredUser: [],
    status: 'opened',
    createdBy: '',
    startTime: '',
    endTime: '',
    thumbnail: [],
    date: '',
    startTimeAMPM: 'AM',
    endTimeAMPM: 'PM',
    speaker: '',
    price: 0,
  });
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^[0-9]+$/.test(value)) {
      setForm(prev => ({ ...prev, capacity: parseInt(value) || 0 }))
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow decimal prices with two decimal places
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setForm(prev => ({ ...prev, price: parseFloat(value) || 0 }))
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name.endsWith('AMPM')) {
      setForm(prev => ({ ...prev, [name]: value }))
    } else {
      const formattedValue = value.replace(/[^0-9:]/g, '').slice(0, 5)
      setForm(prev => ({ ...prev, [name]: formattedValue }))
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)
    setUploadProgress(0)
    try {
      const url = acceptedFiles.map((i) => uploadToS3(i,'events-thumbnails', (percentage) => {
        setUploadProgress(percentage);
      }));
      const urls = await Promise.all(url);
      setForm((prev : any) => ({ ...prev, thumbnail: [...prev.thumbnail, urls]}));
      setSuccess('Thumbnail uploaded successfully!')
    } catch (error) {
      console.error('Error uploading thumbnail:', error)
      setError('Failed to upload thumbnail. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(100)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleSubmit = async () => {
    // Validate all required fields
    if (!form.title || !form.capacity || !form.date || !form.description 
        || !form.endTime || !form.location || !form.startTime 
        || !form.thumbnail || !form.speaker) {
      setError('All fields are required')
      return
    }

    const formattedStartTime = `${form.startTime} ${form.startTimeAMPM}`;
    const formattedEndTime = `${form.endTime} ${form.endTimeAMPM}`;

    try {
      const event_id = `eventId_${Date.now()}`
      const eventsRef = ref(db, 'events/' + event_id)
      await set(eventsRef, {
        ...form,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
      })
      setSuccess('Event created successfully!')
      navigate('/events-management')
      
      // Reset form to initial state
      setForm({
        title: '',
        description: '',
        location: '',
        capacity: 0,
        registeredUser: [],
        status: 'opened',
        createdBy: '',
        startTime: '',
        endTime: '',
        thumbnail: [],
        date: '',
        startTimeAMPM: 'AM',
        endTimeAMPM: 'PM',
        speaker: '',
        price: 0,
      })
    } catch (e) {
      console.error(e)
      setError('Failed to create event. Please try again.')
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleFormChange}
              placeholder="Event Title"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Event Description"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              required
            />
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleFormChange}
              placeholder="Event Location"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="speaker"
              value={form.speaker}
              onChange={handleFormChange}
              placeholder="Event Speaker"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-2">
              <input
                type="text"
                name="startTime"
                value={form.startTime}
                onChange={handleTimeChange}
                placeholder="Start Time (HH:MM)"
                className="flex-grow p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                name="startTimeAMPM"
                value={form.startTimeAMPM}
                onChange={handleTimeChange}
                className="p-3 bg-gray-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                name="endTime"
                value={form.endTime}
                onChange={handleTimeChange}
                placeholder="End Time (HH:MM)"
                className="flex-grow p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                name="endTimeAMPM"
                value={form.endTimeAMPM}
                onChange={handleTimeChange}
                className="p-3 bg-gray-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleFormChange}
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="capacity"
              value={(form.capacity) != 0 ? form.capacity : ''}
              onChange={handleCapacityChange}
              placeholder="Event Capacity"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="price"
              value={(form.price) != 0 ? form.price : ''} 
              onChange={handlePriceChange}
              placeholder="Event Price ($)"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </motion.div>
        )
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
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
            {isUploading && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                className="h-2 bg-blue-500 rounded-full"
              />
            )}
            {form.thumbnail.length > 0  && (
              <div className="relative group">
                {form.thumbnail?.map((i, index) => (
                  <div key={index} className='m-3 p-1'>
                    <img src={i} alt="Event thumbnail" className="w-60 h-32 rounded-md" />
                    <button
                      onClick={async () => {
                        await deleteFromS3(i);
                        setForm(prev => ({ 
                          ...prev, 
                          thumbnail: [...prev.thumbnail.filter((item) => item !== i)]
                        }))
                      }}
                      className="top-4 mt-4 right-2 bg-red-500 text-white rounded-full p-2 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-4xl mx-auto border border-slate-900 bg-black/40 p-8 rounded-xl shadow-lg backdrop-blur-sm">
        <motion.h1 
          className="sm:text-3xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl font-extrabold leading-tight text-center bg-clip-text text-transparent w-full mx-6 pb-4 xl:leading-snug dark:bg-gradient-to-b dark:from-blue-600 dark:via-gray-600 dark:to-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Event Creation
        </motion.h1>

        <ErrorMessage message={error} />
        <SuccessMessage message={success} />
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
        
        <motion.div
          className="mt-8 flex justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition duration-300 flex items-center"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Previous
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 flex items-center ml-auto"
            >
              Next
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 flex items-center ml-auto"
            >
              Create Event
              <FontAwesomeIcon icon={faCheck} className="ml-2" />
            </button>
          )}
        </motion.div>
      </div>
    </div>
  )
}

