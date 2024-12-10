import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faPencilAlt, faTrash, faUpload, faSave, faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";
import { child, get, ref, update, remove } from "firebase/database";
import { db } from "../utils/firebase";
import { uploadToS3, deleteFromS3 } from '../utils/s3upload';
import { useDropzone } from 'react-dropzone';
import { ErrorMessage } from './ErrorMessage';
import { SuccessMessage } from './SuccessMessage';
import { Loader2Icon } from 'lucide-react';
import Loader from './Loder';

interface Quiz {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

interface Lesson {
  id: string;
  duration: number;
  description: string;
  title: string;
  videoUrl: string;
  quizzes: Quiz[];
}

interface Section {
  id: string;
  lessons: Lesson[];
  title: string;
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
  sections: Section[];
  title: string;
}

export default function EditCourse() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        const snapshot = await get(child(ref(db), `courses/${id}`));
        const value = snapshot.val();
        setCourse(value);
      } catch (e) {
        console.error(e);
        setError('Failed to fetch course data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourse(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSectionChange = (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCourse(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map(section =>
          section.id === sectionId ? { ...section, [name]: value } : section
        )
      };
    });
  };

  const handleLessonChange = (sectionId: string, lessonId: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourse(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                lessons: section.lessons.map(lesson =>
                  lesson.id === lessonId ? { ...lesson, [name]: value } : lesson
                )
              }
            : section
        )
      };
    });
  };

  const handleQuizChange = (sectionId: string, lessonId: string, quizId: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourse(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                lessons: section.lessons.map(lesson =>
                  lesson.id === lessonId
                    ? {
                        ...lesson,
                        quizzes: lesson.quizzes.map(quiz =>
                          quiz.id === quizId
                            ? { ...quiz, [name]: value }
                            : quiz
                        )
                      }
                    : lesson
                )
              }
            : section
        )
      };
    });
  };

  const handleQuizOptionChange = (sectionId: string, lessonId: string, quizId: string, optionIndex: number, value: string) => {
    setCourse(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                lessons: section.lessons.map(lesson =>
                  lesson.id === lessonId
                    ? {
                        ...lesson,
                        quizzes: lesson.quizzes.map(quiz =>
                          quiz.id === quizId
                            ? {
                                ...quiz,
                                options: quiz.options.map((option, index) =>
                                  index === optionIndex ? value : option
                                )
                              }
                            : quiz
                        )
                      }
                    : lesson
                )
              }
            : section
        )
      };
    });
  };

  const handleSave = async () => {
    if (!course) return;
    setIsLoading(true);
    try {
      await update(ref(db, `courses/${id}`), course);
      setSuccessMessage('Course updated successfully!');
      setEditMode(false);
    } catch (e) {
      console.error(e);
      setError('Failed to update course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    setIsLoading(true);
    try {
      await Promise.all(course?.imageFiles?.map(imageUrl => deleteFromS3(imageUrl)));
      await Promise.all(course?.sections?.flatMap(section =>
        section?.lessons?.map(lesson => deleteFromS3(lesson?.videoUrl))
      ));
      await remove(ref(db, `courses/${id}`));
      setSuccessMessage('Course deleted successfully!');
      navigate('/view-courses')
    } catch (e) {
      console.error(e);
      setError('Failed to delete course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!course) return;
    if (!window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) return;
    
    try {
      const updatedSections = course.sections.filter(section => section.id !== sectionId);
      const sectionToDelete = course.sections.find(section => section.id === sectionId);
  
      if (sectionToDelete) {
        await Promise.all(sectionToDelete?.lessons?.map(lesson => deleteFromS3(lesson.videoUrl)));
      }
      const updates = { [`courses/${course.id}/sections`]: updatedSections };
      await update(ref(db), updates);
      setCourse(prev => prev ? { ...prev, sections: updatedSections } : null);
      setSuccessMessage('Section deleted successfully!');
    } catch (e) {
      console.error(e);
      setError('Failed to delete section. Please try again.');
    }
  };
  

  const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
    if (!course) return;
    if (!window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) return;
  
    try {
      // Initialize an updated sections array and store the video URL to delete
      let videoUrlToDelete = null;
      const updatedSections = course.sections.map(section => {
        if (section.id === sectionId) {
          const lessonToDelete = section.lessons.find(lesson => lesson.id === lessonId);
          if (lessonToDelete) {
            videoUrlToDelete = lessonToDelete.videoUrl;  // Capture the URL for deletion from S3
          }
          return {
            ...section,
            lessons: section.lessons.filter(lesson => lesson.id !== lessonId),
          };
        }
        return section;
      });
  
      // Delete the video file from S3, if any
      if (videoUrlToDelete) {
        await deleteFromS3(videoUrlToDelete);
      }
  
      // Find the updated lessons for the specific section
      const updatedSection = updatedSections.find(section => section.id === sectionId);
      const updatedLessons = updatedSection ? updatedSection.lessons : [];
  
      // Prepare the update for Firebase
      const updates = { [`courses/${course.id}/sections/${sectionId}/lessons`]: updatedLessons };
  
      // Update Firebase with the modified lessons
      console.log(updates)
      await update(ref(db), updates);
  
      // Update the local state
      setCourse(prev => prev ? { ...prev, sections: updatedSections } : null);
  
      // Display success message
      setSuccessMessage('Lesson deleted successfully!');
    } catch (e) {
      console.error(e);
      setError('Failed to delete lesson. Please try again.');
    }
  };
  
  

  const handleDeleteQuiz = (sectionId: string, lessonId: string, quizId: string) => {
    if (!course) return;
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;
    const updatedSections = course.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          lessons: section.lessons.map(lesson => {
            if (lesson.id === lessonId) {
              return {
                ...lesson,
                quizzes: lesson.quizzes.filter(quiz => quiz.id !== quizId)
              };
            }
            return lesson;
          })
        };
      }
      return section;
    });
    setCourse(prev => prev ? { ...prev, sections: updatedSections } : null);
    setSuccessMessage('Quiz deleted successfully!');
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!course) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const uploadedUrls = await Promise.all(
        acceptedFiles.map(async (file, index) => {
          const url = await uploadToS3(file, 'course-images');
          setUploadProgress((prev) => prev + (100 / acceptedFiles.length));
          return url;
        })
      );
      setCourse(prev => prev ? {
        ...prev,
        imageFiles: [...prev.imageFiles, ...uploadedUrls],
      } : null);
      setSuccessMessage('Images uploaded successfully!');
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [course]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleVideoUpload = async (sectionId: string, lessonId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !course) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // 1. Find the existing video URL
      let prevVideoUrl = '';
      course.sections.forEach(section => {
        if (section.id === sectionId) {
          const lesson = section.lessons.find(lesson => lesson.id === lessonId);
          if (lesson) {
            prevVideoUrl = lesson.videoUrl; // Capture the previous video URL
          }
        }
      });
  
      // 2. Delete the existing video from S3 (if there is a previous video URL)
      if (prevVideoUrl) {
        await deleteFromS3(prevVideoUrl);
      }
  
      // 3. Upload the new video to S3
      const newVideoUrl = await uploadToS3(file, 'course-videos');
  
      // 4. Update the lesson with the new video URL
      setCourse(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  lessons: section.lessons.map(lesson =>
                    lesson.id === lessonId ? { ...lesson, videoUrl: newVideoUrl } : lesson
                  )
                }
              : section
          )
        };
      });
  
      // 5. Success message
      setSuccessMessage('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      setError('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  
  
  const removeImage = async (index: number) => {
    if (!course) return;
    const imageUrl = course.imageFiles[index];
    try {
      await deleteFromS3(imageUrl);
      setCourse(prev => prev ? {
        ...prev,
        imageFiles: prev.imageFiles.filter((_, i) => i !== index),
      } : null);
      setSuccessMessage('Image removed successfully!');
    } catch (error) {
      console.error('Error removing image:', error);
      setError('Failed to remove image. Please try again.');
    }
  };
  
  const addQuiz = (sectionId: string, lessonId: string) => {
    if (!course) return;
    const newQuiz: Quiz = {
      id: `quiz_${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      answer: ''
    };

    setCourse(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                lessons: section.lessons.map(lesson =>
                  lesson.id === lessonId
                    ? { ...lesson, quizzes: lesson.quizzes ? [...lesson.quizzes, newQuiz] : [newQuiz] }
                    : lesson
                )
              }
            : section
        )
      };
    });
    setSuccessMessage('New quiz added successfully!');
  };

  if (isLoading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <ErrorMessage message={error}/>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold"
        >
          Course not found
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-white p-6">
      <div className="max-w-4xl mx-auto bg-black/80 border border-slate-900 p-8 rounded-xl shadow-lg backdrop-blur-sm">
       <div className='flex items-center'>
  
    <button
        onClick={()=> setEditMode(prev => !prev)}
        className={`relative lg:inline-flex items-center h-8 sm: hidden  rounded-full w-[85px] transition-colors duration-300 focus:outline-none ${
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
      <span className="ml-3 text-xs font-medium text-gray-200 sm: hidden lg:inline">
        {editMode ? 'Editor Mode' : 'Viewer Mode'}
      </span>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl font-extrabold leading-tight text-center  bg-clip-text text-transparent w-full mx-6 pb-4 xl:leading-snug dark:bg-gradient-to-b dark:from-blue-600 dark:via-gray-600 dark:to-white">
        Edit Course
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
              {editMode ? 'Save Changes' : 'Edit Course'}
            </button>
            {editMode && (
              <button
                onClick={handleDeleteCourse}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md transition duration-300"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Delete Course
              </button>
            )}
          </div>

          <div className="space-y-4">
            <input
              type="text"
              name="title"
              value={course.title}
              onChange={handleInputChange}
              placeholder="Course Title"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!editMode}
            />
            <textarea
              name="description"
              value={course.description}
              onChange={handleInputChange}
              placeholder="Course Description"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              disabled={!editMode}
            />
            <input
              type="number"
              name="price"
              value={course.price}
              onChange={handleInputChange}
              placeholder="Price"
              className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!editMode}
            />
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
              <p className="text-gray-300">Drag 'n' drop course images here, or click to select files</p>
            </div>
          )}

          {isUploading && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              className="h-2 bg-blue-500 rounded-full"
            />
          )}

          <div className="grid grid-cols-3 gap-4 mt-4">
            {course?.imageFiles?.map((image, index) => (
              <div key={index} className="relative group">
                <img src={image} alt={`Course image ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                {editMode && (
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Sections</h2>
            {course?.sections?.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 p-6 rounded-lg shadow-lg mb-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold text-blue-400">{section?.title}</h3>
                  <div>
                    <button
                      onClick={() => toggleSection(section?.id)}
                      className="text-gray-400 hover:text-white transition duration-300 mr-2"
                    >
                      <FontAwesomeIcon icon={expandedSections.includes(section.id) ? faAngleUp : faAngleDown} />
                    </button>
                    {editMode && (
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="text-red-500 hover:text-red-600 transition duration-300"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                </div>
                {editMode && (
                  <input
                    type="text"
                    name="title"
                    value={section?.title}
                    onChange={(e) => handleSectionChange(section.id, e)}
                    placeholder="Section Title"
                    className="w-full p-2 bg-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                )}
                <AnimatePresence>
                  {expandedSections.includes(section.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {section?.lessons?.map((lesson) => (
                        <div key={lesson.id} className="bg-gray-700 p-4 rounded-md mt-2">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-lg font-medium text-blue-300">{lesson?.title}</h4>
                            {editMode && (
                              <button
                                onClick={() => handleDeleteLesson(section.id, lesson.id)}
                                className="text-red-500 hover:text-red-600 transition duration-300"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            )}
                          </div>
                          {editMode ? (
                            <>
                              <input
                                type="text"
                                name="title"
                                value={lesson?.title}
                                onChange={(e) => handleLessonChange(section.id, lesson.id, e)}
                                placeholder="Lesson Title"
                                className="w-full p-2 bg-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                              />
                              <textarea
                                name="description"
                                value={lesson?.description}
                                onChange={(e) => handleLessonChange(section?.id, lesson?.id, e)}
                                placeholder="Lesson Description"
                                className="w-full p-2 bg-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none mb-2"
                              />
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => handleVideoUpload(section?.id, lesson?.id, e)}
                                  className="hidden"
                                  id={`video-upload-${lesson?.id}`}
                                />
                                <label
                                  htmlFor={`video-upload-${lesson?.id}`}
                                  className="cursor-pointer flex items-center justify-center w-full p-2 bg-gray-600 rounded-md text-white hover:bg-gray-500 transition duration-300"
                                >
                                  <FontAwesomeIcon icon={faUpload} className="mr-2" />
                                  {lesson?.videoUrl ? 'Change Video' : 'Upload Video'}
                                </label>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-gray-400 mb-2">{lesson?.description}</p>
                              {lesson?.videoUrl && (
                                <div className="aspect-w-16 aspect-h-9">
                                  <video src={lesson.videoUrl} controls className="rounded-md" />
                                  <img src={lesson?.videoUrl} />
                                </div>
                              )}
                            </>
                          )}
                          <div className="mt-4">
                            <h5 className="text-md font-medium text-blue-300 mb-2">Quizzes</h5>
                            {lesson?.quizzes?.map((quiz) => (
                              <div key={quiz.id} className="bg-gray-600 p-3 rounded-md mb-2">
                                {editMode ? (
                                  <>
                                    <div className="flex justify-between items-center mb-2">
                                      <input
                                        type="text"
                                        name="question"
                                        value={quiz?.question}
                                        onChange={(e) => handleQuizChange(section.id, lesson.id, quiz.id, e)}
                                        placeholder="Quiz Question"
                                        className="w-full p-2 bg-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                      <button
                                        onClick={() => handleDeleteQuiz(section.id, lesson.id, quiz.id)}
                                        className="text-red-500 hover:text-red-600 transition duration-300 ml-2"
                                      >
                                        <FontAwesomeIcon icon={faTrash} />
                                      </button>
                                    </div>
                                    {quiz?.options?.map((option, index) => (
                                      <input
                                        key={index}
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleQuizOptionChange(section.id, lesson.id, quiz.id, index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        className="w-full p-2 bg-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                                      />
                                    ))}
                                    <input
                                      type="text"
                                      name="answer"
                                      value={quiz?.answer}
                                      onChange={(e) => handleQuizChange(section.id, lesson.id, quiz.id, e)}
                                      placeholder="Correct Answer"
                                      className="w-full p-2 bg-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </>
                                ) : (
                                  <p className="font-medium text-white">{quiz?.question}</p>
                                )}
                              </div>
                            ))}
                            {editMode && (
                              <button
                                onClick={() => addQuiz(section.id, lesson.id)}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 flex items-center justify-center mt-2"
                              >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                Add Quiz
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
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

