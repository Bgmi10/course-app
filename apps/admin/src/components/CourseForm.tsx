import { ref, set } from 'firebase/database';
import { db } from '../utils/firebase';
import { useRef, useState } from 'react';
import AWS from 'aws-sdk';
import {motion} from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

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
    rating: number;
    userId: string;
    comment: string;
    createdAt: string;
}

interface Review {
    id: string;
    userId: string;
    rating: number; // 1-5 stars
    comment: string;
    createdAt: string;
  }

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    language: string;categoryId: string;
    sections: {
      [sectionId: string]: {
        title: string;
        lessons: { [lessonId: string]: Lesson };
        reviews: { [reviewId: string]: Review };
      }
    };
    quizzes: { [quizId: string]: Quiz };
    averageRating?: number;
    enrollments: number;
    createdAt: string;
    updatedAt: string;
}

export default function CourseForm(){

  const [currentSection, setCurrentSection] = useState({
    title: "",
    lessons: [] as Partial<Lesson>[]
  });
  const [currentLesson, setCurrentLesson] = useState<Partial<Lesson>>({
   title: "",
   description: "",
   videourl: "",
   duration: 0
  });
  const [sections, setSections] = useState<{id: string; title: string; lessons: Partial<Lesson>[]}[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Partial<Quiz>>({
    question: "",
    options : ["", "", "", ""],
    answer: ""

  })
  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: 0,
    instructorid: "asd",
    categoryid: "",
    enrollments: 0,
    reviews: {},
    sections: {},
    progress: {},
    quizzes:{},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: "",
    courseimageurl: "",
    trailer: "",
  });
  const [uploadfile,setUploadFile] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [awsuploadfileloading, setAwsuploadfileloading] = useState(false);
  const [progress, setProgress] = useState({
    percentage : 0,
    uploaded : '0.00',
    total : '0.00'
  });
  const uploadRef = useRef<AWS.S3.ManagedUpload | null>(null);

  console.log(course, currentSection , currentLesson)
  
  const addSection = () => {
  
    if (!currentSection.title.trim()) {
      setError('Section title is required');
      return;
    }
    // const lessonsArray = currentSection.lessons.map((lesson, index) => ({
    //   ...lesson,
    //   id: `lesson_${Date.now()}_${index}`,
    //   order: index + 1
    // }));

    const newSection = {
      id: `section_${Date.now()}`,
      title: currentSection.title,
      lessons: currentSection.lessons.map((lesson, index) => ({
        ...lesson,
        id: `lesson_${Date.now()}_${index}`,
        order: index + 1
      }))
    };
    //@ts-ignore
    setSections(prev => [...prev,newSection]);
    setCourse(prev => ({...prev, sections : newSection}));
    setError('');
    setCurrentSection({ title: '', lessons: [] });
  };

  const handleFileChange = (e : any) => {
    
    setUploadFile(e.target.files[0]);
   
    if(uploadfile.type === "image/png" || uploadfile.type === "application/pdf" || uploadfile.type === "image/jpeg" || uploadfile.type === "image/jpeg" || uploadfile.type === "" ){
       setError('only accepts mp4');
       return;
    }
  };

  const addLessonToSection = async () =>{ 

    if(!currentLesson.title?.trim()) {
      setError('Lesson title is required');
      return;
    }

    if(!currentSection?.title.trim()){
        setError('Section title is required');
        return;
    }

    const aws_vid_url = async (file: File | undefined) => {

        if (!file) {
          setError('No file selected');
          return;
        }
      
        setAwsuploadfileloading(true);

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
        
            // Handle any errors while loading the video
            video.onerror = () => {
              reject(new Error('Failed to load video'));
            };
          });
        };
        
        const duration1 =  await getVideoDuration(file);
      
        AWS.config.update({
          region : 'eu-north-1',
          accessKeyId: import.meta.env.VITE_APP_AWS_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_APP_AWS_SECRET_ACCESS_KEY,
        });
      
        const s3 = new AWS.S3({
          apiVersion: '2006-03-01',
          params: { Bucket: import.meta.env.VITE_APP_AWS_NAME }
        });
      
        const fileExtension = file.name.split('.').pop();
        const fileName = `videos/course_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
      
        const params: AWS.S3.PutObjectRequest = {
          Bucket: import.meta.env.VITE_APP_AWS_NAME,
          Key: fileName,
          Body: file,
          ContentType: file.type,
        };
  
        try {
          const upload = s3.upload(params, {
            partSize: 10 * 1024 * 1024,
            queueSize: 1
          })
         uploadRef.current = upload;
         upload.on('httpUploadProgress', (e) => {
            const uploaded1 = (e.loaded / (1024 * 1024)).toFixed(2);
            const total1 = (e.total / (1024 * 1024)).toFixed(2);
            const percentage1 = Math.round((e.loaded / e.total) * 100);
            //@ts-ignore
            setProgress(prev => ({...prev, uploaded: uploaded1, total : total1, percentage: percentage1}));

         })

         const result = await upload.promise();
         const urlParams = {
            Bucket: import.meta.env.VITE_APP_AWS_NAME,
            Key: fileName,
            Expires: 60 * 60 * 24 * 7
          };
      
          const signedUrl = s3.getSignedUrl('getObject', urlParams);
          setSuccess(true)
          //@ts-ignore
          setCurrentSection(prev => ({
            ...prev,
            lessons: [...prev.lessons, { 
              ...currentLesson, 
              id: `lesson_${Date.now()}`,
              videourl : result?.Location,
              duration :  duration1
            }]
           }));
      
          setAwsuploadfileloading(false);
          return {
            publicUrl: result.Location,
            signedUrl: signedUrl
          };
        }
        catch(error) {
          console.error('Detailed S3 Upload Error:')
    
          setAwsuploadfileloading(false);
          return null;
        }
      };
    

    try{
    
      // if(uploadfile){
      //     let videourl : any = '';
      //     videourl = await aws_vid_url(uploadfile);
      // }
      setCurrentSection(prev => ({
        ...prev,
        lessons: [...prev.lessons, { 
          ...currentLesson, 
          id: `lesson_${Date.now()}`,
          // videourl : result?.Location,
          // duration :  duration1
        }]
       }));
      
       setSections(prevSections => 
        prevSections.map(section => 
          section.title === currentSection.title 
            ? {
                ...section, 
                lessons: [
                  ...section.lessons, 
                  { 
                    ...currentLesson, 
                    id: `lesson_${Date.now()}` 
                  }
                ]
              }
            : section
        )
      );
      setCurrentLesson({
        title: '',
        description: '',
        videourl: '',
        duration: 0
        });
       }
    catch(e){
      console.log(e);
    };
}

  
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

    // Reset quiz
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
    if (!course.title?.trim()) {
      setError('Course title is required');
      return false;
    }
    if (!course.description?.trim()) {  
      setError('Course description is required');
      return false;
    }
    if ((course.price || 0) <= 0) {
      setError('Price must be greater than 0');
      return false;
    }
    if (!course.language?.trim()) {
      setError('Course language is required');
      return false;
    }
    if (!course.instructorid?.trim()) {
      setError('Instructor ID is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!validateCourse())return;

    if (!course?.title || !course?.description || !course?.price || !course?.instructorid || !course?.categoryid) {
      setError("All fields are required");
      return;
    }
   
    try {
      const courseId = `course_${Date.now()}`;
      const courseRef = ref(db, "courses/" + courseId);
      const finalCourse: Course = {
        ...course,
        id: courseId,
        averageRating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        categoryId : ''
      } as Course;

      await set(courseRef, finalCourse);

      setSuccess(true);
      setError(null);

      // Reset form
      setCourse({
        title: '',
        description: '',
        price: 0,
        language: '',
        instructorid: 'lasd',
        progress: {},
        categoryid: '',
        sections: {},
        quizzes: {},
        reviews: {},
        enrollments: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        courseimageurl: "",
        trailer: ""
      });

    } catch (e) {
      console.log(e);
      //@ts-ignore
      setError(e);
    }
}


  const cancleUpload = () => {
    if(uploadRef.current) {
      uploadRef.current.abort();
      setAwsuploadfileloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
    <div className="max-w-3xl mx-auto bg-black/40 p-8 rounded-xl shadow-md backdrop-blur-md">
      <h1 className="text-3xl font-bold text-blue-400 text-center mb-6">Create New Course</h1>
  
      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
      {success && <div className="text-green-500 mb-4 text-center">Course created successfully!</div>}
  
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
          <h2 className="text-xl font-semibold">Sections</h2>
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
              {success && <span className='text-green-500 font-normal px-4'>video uploaded successfully</span>}
              {awsuploadfileloading ? (
                  <>
                     <div className='flex gap-2'>
                          <FontAwesomeIcon icon={faClose} className='text-white mt-[-5px] cursor-pointer' fontSize={24} onClick={cancleUpload}/>
                         <div className="relative w-full h-4 bg-gray-800 rounded-md">
                          <motion.div
                            className="absolute top-0 left-0 h-full bg-blue-500 rounded-md"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percentage}%` }}
                            transition={{ duration: 0.3 }}
                          />
                         <span className="absolute right-2 top-[-2px] text-sm text-white">{progress.uploaded} / {progress.total} mb</span>
              
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
          <h2 className="text-xl font-semibold">Quizzes</h2>
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
