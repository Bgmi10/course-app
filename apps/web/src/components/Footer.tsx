import { faEnvelope, faVoicemail } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import instaGram from "../imgs/instagram.png";
import linkDin from "../imgs/linkedin.png";
import X from "../imgs/twitter.png";
import faceBook from "../imgs/facebook.png";

export default function Footer (){
    return(
        <>
         <div className='bg-[#000000] flex justify-between p-20 items-center'>
            <div>
              2024 @<span className="text-2xl font-bold">SecX</span>
            </div>
            <div className='border border-r-[#223E76] bg-gray-950 border-t-[#250BC5] border-b-[hsl(220,55%,30%)] border-l-[#250BC5] p-3 rounded-2xl text-[22px]'>
               <div className='flex gap-2 text-center items-center'><FontAwesomeIcon icon={faEnvelope} /> <span className="text-blue-500">info@sec-x.in</span>
               </div> 
            </div>
            <div className="flex gap-3  ">
             <a href="#" className="w-10 h-10 ">
              <img src={instaGram} alt="instagram"/>
             </a>
              <a href="#" className="w-10 h-10 ">
              <img src={faceBook} alt="facebook" />
              </a>
              <a href="#" className="w-10 h-10 ">
              <img src={X} alt="x" className="bg-white rounded-full"/>
              </a>
              <a href="#" className="w-10 h-10 ">
              <img src={linkDin} alt="linkdin"/>
              </a>
            </div>
          </div>
        </>
    )
}