import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faPencilAlt, faTrash, faUpload, faSave, faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";
import { child, get, ref, update, remove } from "firebase/database";
import { db } from "../utils/firebase";
import { uploadToS3, deleteFromS3 } from '../utils/s3upload';
import { useDropzone } from 'react-dropzone';

// issue while deleting non-url of lessons and also and minor bugs in s3 file 

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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

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
      await remove(ref(db, `courses/${id}`));
      // Delete all images from S3
      await Promise.all(course.imageFiles.map(imageUrl => deleteFromS3(imageUrl)));
      // Delete all video files from S3
      await Promise.all(course.sections.flatMap(section =>
        section.lessons.map(lesson => deleteFromS3(lesson.videoUrl))
      ));
      setSuccessMessage('Course deleted successfully!');
      // Redirect to courses list or home page
    } catch (e) {
      console.error(e);
      setError('Failed to delete course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!course) return;
    if (!window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) return;
    try {
      const updatedSections = course?.sections.filter(section => section.id !== sectionId);
      const sectionToDelete = course?.sections.find(section => section.id === sectionId);
      if (sectionToDelete) {
        // Delete all video files from S3 for this section
        await Promise.all(sectionToDelete?.lessons?.map(lesson => deleteFromS3(lesson?.videoUrl)));
      }
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
      const updatedSections = course.sections.map(section => {
        if (section.id === sectionId) {
          const lessonToDelete = section.lessons.find(lesson => lesson.id === lessonId);
          if (lessonToDelete) {
            // Delete video file from S3
            deleteFromS3(lessonToDelete.videoUrl);
          }
          return {
            ...section,
            lessons: section.lessons.filter(lesson => lesson.id !== lessonId)
          };
        }
        return section;
      });
      setCourse(prev => prev ? { ...prev, sections: updatedSections } : null);
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
      const url = await uploadToS3(file, 'course-videos');
      setCourse(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  lessons: section.lessons.map(lesson =>
                    lesson.id === lessonId ? { ...lesson, videoUrl: url } : lesson
                  )
                }
              : section
          )
        };
      });
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
                    ? { ...lesson, quizzes: [...lesson.quizzes, newQuiz] }
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
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
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

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-black/40 p-8 rounded-xl shadow-lg backdrop-blur-sm">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-blue-400 text-center mb-8"
        >
          Edit Course
        </motion.h1>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500 text-white p-4 rounded-md mb-6"
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
          <div className="flex justify-between items-center mb-4">
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
            {course.imageFiles.map((image, index) => (
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
                            <h4 className="text-lg font-medium text-blue-300">{lesson.title}</h4>
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
                                value={lesson.title}
                                onChange={(e) => handleLessonChange(section.id, lesson.id, e)}
                                placeholder="Lesson Title"
                                className="w-full p-2 bg-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                              />
                              <textarea
                                name="description"
                                value={lesson.description}
                                onChange={(e) => handleLessonChange(section.id, lesson.id, e)}
                                placeholder="Lesson Description"
                                className="w-full p-2 bg-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none mb-2"
                              />
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => handleVideoUpload(section.id, lesson.id, e)}
                                  className="hidden"
                                  id={`video-upload-${lesson.id}`}
                                />
                                <label
                                  htmlFor={`video-upload-${lesson.id}`}
                                  className="cursor-pointer flex items-center justify-center w-full p-2 bg-gray-600 rounded-md text-white hover:bg-gray-500 transition duration-300"
                                >
                                  <FontAwesomeIcon icon={faUpload} className="mr-2" />
                                  {lesson.videoUrl ? 'Change Video' : 'Upload Video'}
                                </label>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-gray-400 mb-2">{lesson.description}</p>
                              {lesson.videoUrl && (
                                <div className="aspect-w-16 aspect-h-9">
                                  <video src={lesson.videoUrl} controls className="rounded-md" />
                                </div>
                              )}
                            </>
                          )}
                          <div className="mt-4">
                            <h5 className="text-md font-medium text-blue-300 mb-2">Quizzes</h5>
                            {lesson.quizzes.map((quiz) => (
                              <div key={quiz.id} className="bg-gray-600 p-3 rounded-md mb-2">
                                {editMode ? (
                                  <>
                                    <div className="flex justify-between items-center mb-2">
                                      <input
                                        type="text"
                                        name="question"
                                        value={quiz.question}
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
                                      value={quiz.answer}
                                      onChange={(e) => handleQuizChange(section.id, lesson.id, quiz.id, e)}
                                      placeholder="Correct Answer"
                                      className="w-full p-2 bg-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </>
                                ) : (
                                  <p className="font-medium text-white">{quiz.question}</p>
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

