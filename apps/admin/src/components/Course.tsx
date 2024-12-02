import { child, get, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { db } from "../utils/firebase"
import { Link } from "react-router-dom";


// interface Section {
//     id : string;
//     lessons : Lessons[];
//     title : string;
// }

// interface Lessons {
//     id : string;
//     duration : number;
//     description : string;
//     title : string;
//     videourl : string;
// }

// interface Course {
//  id : string;
//  description : string;
//  imageFiles : string[];
//  averageRating : number;
//  categoryid : string;
//  createdAt : string;
//  instructorid : string;
//  price : number;
//  quizzes : any;
//  sections : Section[];
//  title : string;
// }

export default function Courses () {

    const [data, setData] = useState(null);

    useEffect(() => {
        const fetch_course = async () => {
            try {
                 await get(child(ref(db), '/courses')).then((snapshot) => {
                    if(snapshot.exists()){
                        const val = snapshot.val()
                        const coursearray = Object.keys(val).map((e) => ({
                            id: e,
                            ...val[e]
                        }))
                        //@ts-ignore
                        setData(coursearray);
                    }
                    else {
                        console.log('no data available')
                    }
                })
                
            }
            catch(e){
                console.log(e);
            }
        }

        fetch_course();
    },[]);

    const length = Array.from({ length : 10} , (i) => i);

    if(!data){
    return (
      <>
        {
            length.map((i,index) => (
                //@ts-ignore
              <div className="w-52 h-52 bg-gray-400 animate-pulse flex flex-wrap justify-start rounded-lg" key={i}></div>
            ))
        }
       </>
      )
    }
    return (
       <> 
         <div className="justify-center flex mt-10 text-white">
         <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl font-extrabold leading-tight text-center  bg-clip-text text-transparent w-full mx-6 pb-4 xl:leading-snug dark:bg-gradient-to-b dark:from-blue-600 dark:via-gray-600 dark:to-white">
           Courses
         </h1>
         </div>

         <div className="flex flex-wrap text-white lg:justify-start sm: justify-center p-6 px-10">
          {
            //@ts-ignore
             data?.map((i) => (
                <Link key={i?.id} to={`/edit-course/${i?.id}`} className="m-4">
                   <img src={i?.imageFiles?.[0]}  alt="course-img" className="rounded-lg w-96 cursor-pointer"/>
                   <span className="font-semibold text-xl px-1 ">{i?.title}</span>
                </Link>  
             ))
          }
         </div>
        </>
    )
}
