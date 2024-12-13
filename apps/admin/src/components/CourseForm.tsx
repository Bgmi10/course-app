import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faPlus,
  faUpload,
  faTimes,
  faFolder,
  faFile,
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { ref, set } from "firebase/database";
import { db } from "../utils/firebase";
import { uploadToS3, FetchFoldersFromS3 } from "../utils/s3upload";
import { useDropzone } from "react-dropzone";
import { bucketName, region_aws } from "../utils/contants";
import { ErrorMessage } from "./ErrorMessage";
import { SuccessMessage } from "./SuccessMessage";

interface Quiz {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  quizzes: Quiz[];
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  title: string;
  description: string;
  price: string;
  language: string;
  sections: Section[];
  instructorId?: string;
  categoryId?: string;
  imageFiles: string[];
}

interface FolderItem {
  name: string;
  type: "folder" | "file";
  children?: FolderItem[];
}

export default function CourseForm() {
  const [step, setStep] = useState(1);
  const [course, setCourse] = useState<Course>({
    title: "",
    description: "",
    price: "",
    language: "",
    sections: [],
    instructorId: "",
    categoryId: "",
    imageFiles: [],
  });
  const [currentSection, setCurrentSection] = useState<Section>({
    id: "",
    title: "",
    lessons: [],
  });
  const [currentLesson, setCurrentLesson] = useState<Lesson>({
    id: "",
    title: "",
    description: "",
    videoUrl: "",
    duration: 0,
    quizzes: [],
  });
  const [currentQuiz, setCurrentQuiz] = useState<Quiz>({
    id: "",
    question: "",
    options: ["", "", "", ""],
    answer: "",
  });
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [folderStructure, setFolderStructure] = useState<FolderItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [showS3Selector, setShowS3Selector] = useState<boolean>(false);


  useEffect(() => {
    fetchRootFolders();
  }, []);

  const fetchRootFolders = async () => {
    try {
      const { folders } = await FetchFoldersFromS3(bucketName);
      setFolderStructure(
        folders.map((folder) => ({ name: folder, type: "folder" }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSubFolders = async (folderPath: string) => {
    try {
      const { folders, files } = await FetchFoldersFromS3(
        "sec-x",
        folderPath,
        "/"
      );
      return [
        ...folders.map((folder) => ({ name: folder, type: "folder" as const })),
        ...files.map((file) => ({ name: file, type: "file" as const })),
      ];
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const toggleFolder = async (folderPath: string) => {
    const newExpandedFolders = new Set(expandedFolders);
    if (newExpandedFolders.has(folderPath)) {
      newExpandedFolders.delete(folderPath);
    } else {
      newExpandedFolders.add(folderPath);
      const subItems = await fetchSubFolders(folderPath);
      setFolderStructure(
        updateFolderStructure(folderStructure, folderPath, subItems)
      );
    }
    setExpandedFolders(newExpandedFolders);
  };

  const updateFolderStructure = (
    items: FolderItem[],
    path: string,
    newChildren: FolderItem[]
  ): FolderItem[] => {
    return items.map((item) => {
      if (item.name === path) {
        return { ...item, children: newChildren };
      } else if (item.children) {
        return {
          ...item,
          children: updateFolderStructure(item.children, path, newChildren),
        };
      }
      return item;
    });
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
  };

  const addSection = () => {
    if (currentSection.title.trim()) {
      setCourse((prev) => ({
        ...prev,
        sections: [
          ...prev.sections,
          { ...currentSection, id: `section_${Date.now()}`, lessons: [] }, // Clear lessons when adding a new section
        ],
      }));
  
      setCurrentSection({
        id: "",
        title: "",
        lessons: [], // Reset the lessons array when adding a new section
      });
      setCurrentLesson({
        id: "",
        title: "",
        description: "",
        videoUrl: "",
        duration: 0,
        quizzes: [],
      }); // Reset the current lesson state as well
    } else {
      setError("Section title cannot be empty");
    }
  };
  

  const addLesson = () => {
    if (currentLesson.title.trim() && selectedSectionId) {
      setCourse((prev) => ({
        ...prev,
        sections: prev.sections.map((section) =>
          section.id === selectedSectionId
            ? {
                ...section,
                lessons: [
                  ...section.lessons,
                  { ...currentLesson, id: `lesson_${Date.now()}`, quizzes: [] },
                ],
              }
            : section
        ),
      }));
      
      console.log(course);
      console.log(currentLesson);
      console.log(currentSection);
      setCurrentLesson({
        id: "",
        title: "",
        description: "",
        videoUrl: "",
        duration: 0,
        quizzes: [],
      });
      setShowS3Selector(false);
    } else {
      setError("Lesson title cannot be empty and a section must be selected");
    }
  };

  const addQuiz = () => {
    if (currentQuiz.question.trim() && selectedSectionId && selectedLessonId) {
      const newQuiz = {
        ...currentQuiz,
        id: `quiz_${Date.now()}`,
      };

      setCourse((prev) => {
        const updatedSections = prev.sections.map((section) => {
          if (section.id === selectedSectionId) {
            return {
              ...section,
              lessons: section.lessons.map((lesson) => {
                if (lesson.id === selectedLessonId) {
                  return {
                    ...lesson,
                    quizzes: [...lesson.quizzes, newQuiz],
                  };
                }
                return lesson;
              }),
            };
          }
          return section;
        });

        return {
          ...prev,
          sections: updatedSections,
        };
      });

      setCurrentQuiz({
        id: "",
        question: "",
        options: ["", "", "", ""],
        answer: "",
      });
    } else {
      setError("Quiz question cannot be empty and a lesson must be selected");
    }
  };

  const handleSubmit = async () => {
    if (
      !course.title ||
      !course.description ||
      course.price === "" ||
      !course.language
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const courseId = `course_${Date.now()}`;
      const courseRef = ref(db, "courses/" + courseId);
      const finalCourse: Course = {
        ...course,
      };

      await set(courseRef, finalCourse);
      setSuccessMessage("Course created successfully!");
      setCourse({
        title: "",
        description: "",
        price: "",
        imageFiles: [],
        language: "",
        sections: [],
        categoryId: "",
        instructorId: "",
      });
    } catch (e) {
      console.error(e);
      setError("Failed to create course. Please try again.");
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const uploadedUrls = await Promise.all(
        acceptedFiles.map(async (file, index) => {
          const url = await uploadToS3(file, "course-images", (percentage) => {
            setUploadProgress(percentage);
          });
          //setUploadProgress((prev) => prev + (100 / acceptedFiles.length));
          return url;
        })
      );
      setCourse((prev) => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...uploadedUrls],
      }));
      setSuccessMessage("Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const url = await uploadToS3(file, "course-videos", (percentage) => {
          setUploadProgress(percentage);
        });
        setCurrentLesson((prev) => ({ ...prev, videoUrl: url }));
        setSuccessMessage("Video uploaded successfully!");
      } catch (error) {
        console.error("Error uploading video:", error);
        setError("Failed to upload video. Please try again.");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        setSuccessMessage("");
      }
    }
  };

  const removeImage = (index: number) => {
    setCourse((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));
  };

  const renderFolderStructure = (
    items: FolderItem[],
    currentPath: string = ""
  ) => {
    return (
      <ul className="pl-4">
        {items.map((item, index) => {
          const fullPath = `${item.name}`;
          const isExpanded = expandedFolders.has(fullPath);
          return (
            <li key={index} className="my-2">
              {item.type === "folder" ? (
                <div>
                  <button
                    onClick={() => toggleFolder(fullPath)}
                    className="flex items-center text-blue-400 hover:text-blue-300"
                  >
                    <FontAwesomeIcon
                      icon={isExpanded ? faChevronDown : faChevronRight}
                      className="mr-2"
                    />
                    <FontAwesomeIcon icon={faFolder} className="mr-2" />
                    {item.name}
                  </button>
                  {isExpanded &&
                    item.children &&
                    renderFolderStructure(item.children, `${fullPath}/`)}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setCurrentLesson((prev) => ({
                      ...prev,
                      videoUrl: `https://${bucketName}.s3.${region_aws}.amazonaws.com/${fullPath}`,
                    }));
                    setShowS3Selector(false);
                  }}
                  className="flex items-center text-gray-300 hover:text-white ml-4"
                >
                  <FontAwesomeIcon icon={faFile} className="mr-2" />
                  {item.name}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

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
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={course.title}
                onChange={handleFormChange}
                placeholder="Course Title"
                className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                name="description"
                value={course.description}
                onChange={handleFormChange}
                placeholder="Course Description"
                className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                required
              />
              <input
                type="number"
                name="price"
                value={course.price}
                onChange={handleFormChange}
                placeholder="Price"
                className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="language"
                value={course.language}
                onChange={handleFormChange}
                placeholder="Language"
                className="w-full p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div
                {...getRootProps()}
                className={`p-6 border-2 border-dashed rounded-md text-center cursor-pointer transition-colors duration-300 ${
                  isDragActive
                    ? "border-blue-500 bg-blue-500 bg-opacity-10"
                    : "border-gray-600 hover:border-blue-500 hover:bg-blue-500 hover:bg-opacity-10"
                }`}
              >
                <input {...getInputProps()} />
                <FontAwesomeIcon
                  icon={faUpload}
                  className="text-4xl mb-2 text-blue-400"
                />
                <p className="text-gray-300">
                  Drag 'n' drop course images here, or click to select files
                </p>
              </div>
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
                    <img
                      src={image}
                      alt={`Course image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="lg:text-4xl sm: text-xl text-center font-bold text-blue-400 mb-6">
              Sections and Lessons
            </h2>
            <div className="space-y-6">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={currentSection.title}
                  onChange={(e) =>
                    setCurrentSection((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Section Title"
                  className="flex-grow p-3 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addSection}
                  className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 flex items-center"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Add Section
                </button>
              </div>

              {course.sections.map((section, sectionIndex) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer ${
                    selectedSectionId === section.id
                      ? "border border-gray-600"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedSectionId(section.id);
                    setCurrentSection(section);
                  }}
                >
                  <h3 className="text-2xl font-semibold text-blue-400 mb-4">
                    {section.title}
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={currentLesson.title}
                      onChange={(e) =>
                        setCurrentLesson((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Lesson Title"
                      className="w-full p-3 bg-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={currentLesson.description}
                      onChange={(e) =>
                        setCurrentLesson((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Lesson Description"
                      className="w-full p-3 bg-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    />
                    <div className="relative">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id={`video-upload-${section.id}`}
                      />
                      <label
                        htmlFor={`video-upload-${section.id}`}
                        className="cursor-pointer flex items-center justify-center w-full p-3 bg-gray-700 rounded-md text-white hover:bg-gray-600 transition duration-300"
                      >
                        <FontAwesomeIcon icon={faUpload} className="mr-2" />
                        Upload Video
                      </label>
                      {isUploading && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-full"
                        />
                      )}
                    </div>
                    {currentLesson.videoUrl && (
                      <p className="text-green-400">
                        Video uploaded successfully!
                      </p>
                    )}
                    <button
                      onClick={() => setShowS3Selector(!showS3Selector)}
                      className="w-full px-6 py-3 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition duration-300 flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faFolder} className="mr-2" />
                      {showS3Selector ? "Hide S3 Selector" : "Select from S3"}
                    </button>
                    {showS3Selector && (
                      <div className="bg-gray-700 p-4 rounded-md max-h-60 overflow-y-auto">
                        <h4 className="text-lg font-semibold text-blue-400 mb-2">
                          Select from S3:
                        </h4>
                        {renderFolderStructure(folderStructure)}
                      </div>
                    )}
                    <button
                      onClick={addLesson}
                      className="w-full px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      Add Lesson
                    </button>
                  </div>
                  {section.lessons.map((lesson, lessonIndex) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        setSelectedSectionId(section.id);
                        setSelectedLessonId(lesson.id);
                        setCurrentLesson(lesson);
                      }}
                      className={`mt-6 bg-gray-700 p-4 rounded-md cursor-pointer ${
                        selectedLessonId === lesson.id
                          ? "border border-gray-600"
                          : ""
                      }`}
                    >
                      <h4 className="text-xl font-medium text-blue-300 mb-2">
                        {lesson.title}
                      </h4>
                      <p className="text-sm text-gray-400 mb-4">
                        {lesson.description}
                      </p>
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={currentQuiz.question}
                          onChange={(e) =>
                            setCurrentQuiz((prev) => ({
                              ...prev,
                              question: e.target.value,
                            }))
                          }
                          placeholder="Quiz Question"
                          className="w-full p-3 bg-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {currentQuiz.options.map((option, optionIndex) => (
                          <input
                            key={optionIndex}
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...currentQuiz.options];
                              newOptions[optionIndex] = e.target.value;
                              setCurrentQuiz((prev) => ({
                                ...prev,
                                options: newOptions,
                              }));
                            }}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="w-full p-3 bg-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ))}
                        <input
                          type="text"
                          value={currentQuiz.answer}
                          onChange={(e) =>
                            setCurrentQuiz((prev) => ({
                              ...prev,
                              answer: e.target.value,
                            }))
                          }
                          placeholder="Correct Answer"
                          className="w-full p-3 bg-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={addQuiz}
                          className="w-full px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-300 flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faPlus} className="mr-2" />
                          Add Quiz
                        </button>
                      </div>
                      {lesson.quizzes.map((quiz, quizIndex) => (
                        <div
                          key={quiz.id}
                          className="mt-4 bg-gray-600 p-3 rounded-md"
                        >
                          <p className="font-medium text-white">
                            {quiz.question}
                          </p>
                        </div>
                      ))}
                    </motion.div>
                  ))}
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-4xl mx-auto border border-slate-900 bg-black/40 p-8 rounded-xl shadow-lg backdrop-blur-sm">
        <motion.h1
          className="sm: text-3xl sm: ml-[-5px] md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl font-extrabold leading-tight text-center bg-clip-text text-transparent w-full mx-6 pb-4 xl:leading-snug dark:bg-gradient-to-b dark:from-blue-600 dark:via-gray-600 dark:to-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Create New Course
        </motion.h1>

        <ErrorMessage message={error} />

        <SuccessMessage message={successMessage} />

        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

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
          {step < 2 ? (
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
              Submit
              <FontAwesomeIcon icon={faCheck} className="ml-2" />
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
