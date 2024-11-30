import { child, get, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { db } from "../utils/firebase"


interface Section {
    id : string;
    lessons : Lessons[];
    title : string;
}

interface Lessons {
    id : string;
    duration : number;
    description : string;
    title : string;
    videourl : string;
}

interface Course {
 id : string;
 description : string;
 imageurl : string;
 averageRating : number;
 categoryid : string;
 createdAt : string;
 instructorid : string;
 price : number;
 quizzes : any;
 sections : Section[];
}
export default function Courses () {

    const [data, setData] = useState<Course[] | null>(null);
    

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
    },[])
    return (
        <div className="">
            
        </div>
    )
}
