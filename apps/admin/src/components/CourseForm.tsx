import { useState, useRef } from "react";
import AWS from 'aws-sdk';
import {motion} from 'framer-motion'; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faInfoCircle, faExclamationCircle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { ref, set } from "firebase/database";
import { db } from "../utils/firebase";

interface Lesson {
  id: string;
  title: string;
  description: string;
  videourl: string;
  duration: number;
}

interface Quiz {
  id: string;
  options : string[];
  answer: string;
  question: string;
  createdAt: string;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  title: string;
  description: string;
  price: number;
  language: string;
  sections: Section[];
  quizzes : Quiz[];
  instructorid?: string;
  categoryid?: string;
}

export default function CourseForm() {
  const [currentSection, setCurrentSection] = useState<Section>({
    id: `section_${Date.now()}`,
    title: "",
    lessons: [],
  });

  const [currentLesson, setCurrentLesson] = useState<Partial<Lesson>>({
    title: "",
    description: "",
    videourl: "",
    duration: 0,
  });

  const [sections, setSections] = useState<Section[]>([]);
  const [info, setInfo] = useState(false);

  const [course, setCourse] = useState<Course>({
    title: "",
    description: "",
    price: 0,
    language: "",
    sections: [],
    quizzes : [],
    instructorid : "as",
    categoryid : "aasd"
  });
  const [currentQuiz, setCurrentQuiz] = useState<Partial<Quiz>>({
    question: "",
    options : ["", "", "", ""],
    answer: ""
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [awsUploadFileLoading, setAwsUploadFileLoading] = useState(false);
  const [infoquiz, setInfoQuiz] = useState(false);
  const [progress, setProgress] = useState({
    percentage: 0,
    uploaded: '0.00',
    total: '0.00',
  });
  const uploadRef = useRef<AWS.S3.ManagedUpload | null>(null);

  // Reset entire form to initial state
  const resetForm = () => {
    setCurrentSection({
      id: `section_${Date.now()}`,
      title: "",
      lessons: [],
    });
    setCurrentLesson({
      title: "",
      description: "",
      videourl: "",
      duration: 0,
    });
    setSections([]);
    setCourse({
      title: "",
      description: "",
      price: 0,
      language: "",
      sections: [],
      quizzes: [],
      instructorid: "as",
      categoryid: "aasd"
    });
    setCurrentQuiz({
      question: "",
      options: ["", "", "", ""],
      answer: ""
    });
    setUploadFile(null);
    setError(null);
    setSuccessMessage(null);
    setAwsUploadFileLoading(false);
  };

  // Enhanced Error Message Component
  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center" role="alert">
      <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
      <span className="block sm:inline">{message}</span>
    </div>
  );

  // Enhanced Success Message Component
  const SuccessMessage = ({ message }: { message: string }) => (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center" role="alert">
      <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
      <span className="block sm:inline">{message}</span>
    </div>
  );

  // Existing methods from the original implementation
 
  
  const addSection = () => {
    if (!currentSection.title.trim()) {
      setError('Section title is required');
      return;
    }

    const newSection: Section = {
      id: `section_${Date.now()}`,
      title: currentSection.title,
      lessons: [...currentSection.lessons],
    };

    setSections(prev => [...prev, newSection]);
    setCourse(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    setError(null);
    setCurrentSection({ id: `section_${Date.now()}`, title: "", lessons: [] });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validVideoTypes = ["video/mp4"];
      if (!validVideoTypes.includes(file.type)) {
        setError('Only mp4 video format is allowed');
        return;
      }
      setUploadFile(file);
      setError(null);
    }
  };

  const addLessonToSection = async () => {
    if (!currentLesson.title?.trim()) {
      setError('Lesson title is required');
      return;
    }
  
    if (!currentSection.title?.trim()) {
      setError('Section title is required before adding a lesson');
      return;
    }
  
    try {
      const awsVideoUrl = async (file: File) => {
        setAwsUploadFileLoading(true);
  
        const getVideoDuration = (file: File) => {
          return new Promise<number>((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            const url = URL.createObjectURL(file);
            video.src = url;
            video.onloadedmetadata = () => {
              const duration = video.duration;
              URL.revokeObjectURL(url);
              resolve(duration);
            };
            video.onerror = () => {
              reject(new Error('Failed to load video'));
            };
          });
        };
  
        const duration = await getVideoDuration(file);
  
        AWS.config.update({
          region: 'eu-north-1',
          accessKeyId: import.meta.env.VITE_APP_AWS_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_APP_AWS_SECRET_ACCESS_KEY,
        });
  
        const s3 = new AWS.S3({
          apiVersion: '2006-03-01',
          params: { Bucket: import.meta.env.VITE_APP_AWS_NAME },
        });
  
        const fileName = `videos/course_${Date.now()}_${Math.random().toString(36).substring(2)}.mp4`;
        const params: AWS.S3.PutObjectRequest = {
          Bucket: import.meta.env.VITE_APP_AWS_NAME,
          Key: fileName,
          Body: file,
          ContentType: file.type,
        };
  
        const upload = s3.upload(params, {
          partSize: 10 * 1024 * 1024,
          queueSize: 1,
        });
  
        uploadRef.current = upload;
        upload.on('httpUploadProgress', (e) => {
          const uploaded = (e.loaded / (1024 * 1024)).toFixed(2);
          const total = (e.total / (1024 * 1024)).toFixed(2);
          const percentage = Math.round((e.loaded / e.total) * 100);
          setProgress({ uploaded, total, percentage });
        });
  
        const result = await upload.promise();
        setProgress({
          uploaded : 0, total :  "",percentage : ""
        });
        setAwsUploadFileLoading(false);
  
        return { url: result.Location, duration };
      };
  
      let videoDetails = { url: '', duration: 0 };
  
      if (uploadFile) {
        videoDetails = await awsVideoUrl(uploadFile);
      }
  
      // Add lesson to the appropriate section
      const newLesson = {
        ...currentLesson,
        id: `lesson_${Date.now()}`,
        videourl: videoDetails.url,
        duration: videoDetails.duration,
      };
  
      const updatedSections = [...sections];
      const sectionIndex = updatedSections.findIndex(
        section => section.title.trim().toLowerCase() === currentSection.title.trim().toLowerCase()
      );
  
      if (sectionIndex !== -1) {
        // Update the existing section if title matches
        updatedSections[sectionIndex].lessons.push(newLesson);
      } else {
        // Add a new section if no match is found
        const newSection: Section = {
          id: `section_${Date.now()}`,
          title: currentSection.title,
          lessons: [newLesson],
        };
        updatedSections.push(newSection);
      }
  
      setSections(updatedSections);
      setCourse(prev => ({ ...prev, sections: updatedSections }));
      setCurrentSection({ id: `section_${Date.now()}`, title: "", lessons: [] });
      setCurrentLesson({
        title: "",
        description: "",
        videourl: "",
        duration: 0,
      });
      setUploadFile(null);
      setSuccess(true);
    } catch (error) {
      console.error('Error uploading video or adding lesson:', error);
      setError('Failed to add lesson');
      setAwsUploadFileLoading(false);
    }
  };
 

  const addQuiz = () => {
    if (!currentQuiz.question?.trim()) {
      setError('Quiz question is required');
      return;
    }

    const quizId = `quiz_${Date.now()}`;
    setCourse(prev => ({
      ...prev,
      quizzes: {
        ...prev.quizzes,
        [quizId]: {
          ...currentQuiz,
          id: quizId
        } as Quiz
      }
    }));

    setCurrentQuiz({
      question: '',
      options: ['', '', '', ''],
      answer: ''
    });
  };

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setCourse(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateCourse = (): boolean => {
    const errors = [];

    if (!course.title?.trim()) {
      errors.push('Course title is required');
    }
    if (!course.description?.trim()) {  
      errors.push('Course description is required');
    }
    if ((course.price || 0) <= 0) {
      errors.push('Price must be greater than 0');
    }
    if (!course.language?.trim()) {
      errors.push('Course language is required');
    }
    if (!course.instructorid?.trim()) {
      errors.push('Instructor ID is required');
    }
    if (sections.length === 0) {
      errors.push('At least one section is required');
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset previous messages
    setError(null);
    setSuccessMessage(null);

    if(!validateCourse()) return;

    try {
      const courseId = `course_${Date.now()}`;
      const courseRef = ref(db, "courses/" + courseId);
      const finalCourse: Course = {
        ...course,
        id: courseId,
        averageRating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        categoryId : '',
        sections: sections,
      } as Course;

      await set(courseRef, finalCourse);

      // Show success message
      setSuccessMessage('Course created successfully!');
      
      // Reset form after 3 seconds
      setTimeout(resetForm, 3000);
    } catch (e) {
      console.error(e);
      setError('Failed to create course. Please try again.');
    }
  };

  const cancleUpload = () => {
    if(uploadRef.current) {
      uploadRef.current.abort();
      setAwsUploadFileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
    <div className="max-w-3xl mx-auto bg-black/40 p-8 rounded-xl shadow-md backdrop-blur-md">
      <h1 className="text-3xl font-bold text-blue-400 text-center mb-6">Create New Course</h1>
      {error && <ErrorMessage message={error} />}
        {successMessage && <SuccessMessage message={successMessage} />}
  
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-lg font-medium">Course Title</label>
          <input
            type="text"
            name='title'
            value={course.title || ''}
            onChange={handleFormChange}
            placeholder="Enter course title"
            className="w-full p-2 rounded-md bg-gray-800 text-white placeholder-gray-500"
            required
          />
        </div>
  
        <div className="space-y-2">
          <label className="block text-lg font-medium">Description</label>
          <textarea
            value={course.description || ''}
            name='description'
            onChange={handleFormChange}
            placeholder="Detailed course description"
            className="w-full p-2 rounded-md bg-gray-800 text-white placeholder-gray-500"
            required
          />
        </div>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-lg font-medium">Price</label>
            <input
              type="number"
              value={course.price || 0}
              onChange={handleFormChange}
              name='price'
              min="0"
              step="0.01"
              className="w-full p-2 rounded-md bg-gray-800 text-white placeholder-gray-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-lg font-medium">Language</label>
            <input
              type="text"
              value={course.language || ''}
              name="language"
              onChange={handleFormChange}
              placeholder="Course language"
              className="w-full p-2 rounded-md bg-gray-800 text-white placeholder-gray-500"
              required
            />
          </div>
        </div>
  
        {/* Sections and Lessons Management */}
        <div className="space-y-4">
          <div className="flex justify-between">
          <h2 className="text-xl font-semibold">Sections</h2>
          <FontAwesomeIcon icon={ info ? faClose : faInfoCircle} className="text-white cursor-pointer" onClick={() => setInfo(prev => !prev)} />{info && (
          <div className="bg-gray-800 rounded-md text-white text-xs absolute ml-20 lg:w-[600px] sm: w-[200px] p-1 shadow-lg">
            <span>
              <span className="text-blue-400 font-semibold text-xs">Note: </span> 
              After you add a section, you can add more lessons to it later by using the same section title. The new lessons will be automatically added under that section. You don't need to create a new section for each lesson.
            </span>
          </div>
          )}

          </div>
          <div className="space-y-2">
            <input
              type="text"
              value={currentSection.title}
              onChange={(e) => {setCurrentSection(prev => ({ ...prev, title: e.target.value }));
               setError(''); 
              }}
              placeholder="Section Title"
              className="w-full p-2 rounded-md bg-gray-800 text-white placeholder-gray-500"
            />
  
            {/* Lesson Management */}
            <div className="space-y-2">
              <input
                type="text"
                value={currentLesson.title || ''}
                onChange={(e) =>{ setCurrentLesson(prev => ({ ...prev, title: e.target.value })); 
                setError('');}}
                placeholder="Lesson Title"
                className="w-full p-2 rounded-md bg-gray-800 text-white placeholder-gray-500"
              />
               <input
                type="text"
                value={currentLesson.description || ''}
                onChange={(e) =>{ setCurrentLesson(prev => ({ ...prev, description: e.target.value })); 
                setError('');}}
                placeholder="Lesson Description"
                required={false}
                className="w-full p-2 rounded-md bg-gray-800 text-white placeholder-gray-500"
              />
              <div className='text-white font-semibold'>Uploadvideo</div>
              {error === "only accepts mp4" && <span className='text-red-500 font-normal px-4'>{error}</span>}
              {error === "video uploaded successfully" && <span className='text-green-500 font-normal px-4'>video uploaded successfully</span>}
              {awsUploadFileLoading ? (
                  <>
                     <div className='flex gap-2'>
                          <FontAwesomeIcon icon={faClose} className='text-white mt-[-5px] cursor-pointer' fontSize={24} onClick={cancleUpload}/>
                         <div className="relative w-full h-4 bg-gray-800 rounded-md">
                          <motion.div
                            className="absolute top-0 left-0 h-full bg-blue-500 rounded-md"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress?.percentage}%` }}
                            transition={{ duration: 0.3 }}
                          />
                         <span className="absolute right-2 top-[-2px] text-sm text-white">{progress?.uploaded} / {progress?.total} mb</span>
              
                         </div>
                       </div>
                    </>) : (
                <input
                type="file"
                onChange={handleFileChange}
                placeholder="Video URL"
                className="w-full p-2 rounded-md bg-gray-800 text-white placeholder-gray-500"
              />)}
        
              <motion.button
                type="button"
                onClick={addLessonToSection}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                whileTap={{ scale: 0.95 }}
              >
                Add Lesson
              </motion.button>
            </div>
  
          <motion.button
            className="bg-blue-500 text-white px-6 py-2 rounded-md"
            onClick={addSection}
            whileTap={{ scale: 0.95 }}
          >
            Add Section
          </motion.button>
          </div>
        </div>
  
        {/* Quiz Management */}
        <div className="space-y-4">
          <div className="flex justify-between">
          <h2 className="text-xl font-semibold">Quizzes</h2>
          <FontAwesomeIcon icon={ infoquiz ? faClose : faInfoCircle} className="text-white cursor-pointer" onClick={() => setInfoQuiz(prev => !prev)} />{infoquiz && (
          <div className="bg-gray-800 rounded-md text-white text-xs absolute ml-20 lg:w-[600px] sm: w-[200px] p-1 shadow-lg">
            <span>
              <span className="text-blue-400 font-semibold text-xs">Note: </span> 
              If you don't see any quizzes right now, don't worry! Your quizzes are saved automatically, and you can access them later.
            </span>
          </div>
          )}
          </div>
          <div className="space-y-2">
            <input
              type="text"
              value={currentQuiz.question || ''}
              onChange={(e) => {setCurrentQuiz(prev => ({ ...prev, question: e.target.value }));
              setError('');}}
              placeholder="Quiz Question"
              className="w-full p-2 rounded-md bg-gray-800 text-white placeholder-gray-500"
            />
            
            { //@ts-ignore
            currentQuiz.options.map((option, idx) => (
              <input
                key={idx}
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...currentQuiz.options!];
                  newOptions[idx] = e.target.value;
                  setCurrentQuiz(prev => ({ ...prev, options: newOptions }));
                  setError('');
                }}
                placeholder={`Option ${idx + 1}`}
                className="w-full p-2 rounded-md bg-gray-800 text-white placeholder-gray-500"
              />
            ))}
            <input
              type="text"
              value={currentQuiz.answer || ''}
              onChange={(e) => {setCurrentQuiz(prev => ({ ...prev, answer: e.target.value }));
              setError('');}}
              placeholder="Correct Answer"
              className="w-full p-2 rounded-md bg-gray-800 text-white placeholder-gray-500"
            />
            <button
              type="button"
              onClick={addQuiz}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add Quiz
            </button>
          </div>
        </div>
  
        <button type="submit" className="bg-blue-500 w-full text-white p-2 rounded-md hover:bg-blue-600">
          Create Course
        </button>
      </form>
    </div>
  </div>
  
  );

}
