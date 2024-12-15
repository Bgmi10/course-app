import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LearningPlanHeader from "./LearningPlanHeader";
import { faLock, faMedal, faPlay, faSearch, faTasks } from "@fortawesome/free-solid-svg-icons";
import e1 from "../imgs/e1.png";
import e2 from "../imgs/e2.png";
import e3 from "../imgs/e3.png";


export default function LearningPlan (){
    return(
        <>
          <div>
            <LearningPlanHeader />
          </div>
          <div className="bg-[#F1F1F1] border rounded-[30px] justify-between  h-auto m-7 flex">
            <div className="flex flex-col m-10">
                <span className="text-black text-3xl font-bold">
                    My Learning Plan
                </span>
                <div className="flex flex-col absolute text-black mt-20 gap-6 ml-[-11px] bg-[#E1DEDE] p-2 rounded-full">
                  <FontAwesomeIcon icon={faTasks} className="bg-black text-white p-1 rounded-md"/>
                  <FontAwesomeIcon icon={faMedal}  className="text-[#290FD3]"/>
                </div>
                <div className="bg-white rounded-2xl p-4 flex flex-col mt-7 ml-10 w-[255px]">
                    <FontAwesomeIcon icon={faLock} className="absolute text-black ml-52 bg-[#E1DEDE] p-2 border-2 border-white rounded-full mt-[-23px]"/>
                    <span className="text-black text-2xl font-semibold">AI CV Rater</span>
                    <span className="text-[#8F8F8F] text-sm font-normal mt-3">Master your chances of being</span>
                    <span className="text-[#8F8F8F] text-sm font-normal">shortlisted. Seamlessly monitor</span>
                    <span className="text-[#8F8F8F] text-sm font-normal">and manage resume shortcomings.</span>
                    <button className="text-black bg-[#C2FCCB] w-1/2 p-1 rounded-3xl font-medium mt-3">Explore</button>
                </div>
                <div className="bg-gradient-to-r from-[#E2A3E7] to-[#F8C8FB] rounded-2xl flex flex-col mt-12 p-4 w-[350px] h-[236px] rotate-12"> 
                   <span className="text-2xl font-bold text-black ">Checklist</span>
                   <div className="flex gap-12">
                    <div className="flex flex-col">
                     <span className="text-sm mt-4 text-[#979797]">Easily track and manage your</span>
                     <span  className="text-sm text-[#979797]">engagements on bug bouny</span>
                     <span  className="text-sm text-[#979797]">programs</span>
                    </div> 
                    <FontAwesomeIcon icon={faPlay} className="text-black border-8 rounded-full p-4 border-white mt-4"/> 
                   </div>
                   <div className="flex mt-4 gap-8">
                   <button className="text-black bg-white w-1/2 p-1 rounded-3xl font-bold mt-4">10K + Users</button>
                   <div className="flex items-center ml-2 mt-3">
                      <img src={e1} alt="e1" className="h-[43px] w-[43px] absolute " />
                      <img src={e2} alt="e1" className="h-[43px] w-[43px] absolute ml-8"/>
                      <img src={e3} alt="e1" className="h-[43px] w-[43px] absolute ml-16"/>
                   </div>
                   </div>
                </div>
                <div className="bg-white rounded-2xl p-4 flex flex-col mt-14 ml-10 w-[255px]">
                    <FontAwesomeIcon icon={faLock} className="absolute text-black ml-52 bg-[#E1DEDE] p-2 border-2 border-white rounded-full mt-[-23px]"/>
                    <span className="text-black text-2xl font-semibold">AI Interview Taker</span>
                    <span className="text-[#8F8F8F] text-sm font-normal mt-3">Easily track and manage your</span>
                    <span className="text-[#8F8F8F] text-sm font-normal">verbal and technical skills</span>
                    <button className="text-black bg-[#C2FCCB] w-1/2 p-1 rounded-3xl font-medium mt-3">Explore</button>
                </div>
                <div className="bg-white rounded-2xl p-4 flex flex-col mt-7 ml-10 w-[255px]">
                    <FontAwesomeIcon icon={faLock} className="absolute text-black ml-52 bg-[#E1DEDE] p-2 border-2 border-white rounded-full mt-[-23px]"/>
                    <span className="text-black text-2xl font-semibold">Report Generator</span>
                    <span className="text-[#8F8F8F] text-sm font-normal mt-3">Easy out your hassle of making</span>
                    <span className="text-[#8F8F8F] text-sm font-normal">reports</span>
                    <button className="text-black bg-[#C2FCCB] w-1/2 p-1 rounded-3xl font-medium mt-3">Explore</button>
                </div>
            </div>
            <div className="m-10 flex flex-col">
            <div className="relative ">
              <FontAwesomeIcon icon={faSearch} className="text-[#686868] absolute left-4 text-lg top-1/2 transform -translate-y-1/2"/>
                <input 
                  type="text" 
                  name="search" 
                  id="search" 
                  className="text-gray-600 outline-none bg-[#E1DEDE] p-4 pl-12 rounded-full font-bold w-[258px]" 
                  placeholder="Search" 
                />
            </div>
              <div className="flex gap-3">
                <div className="bg-[#C6EEFA] rounded-2xl justify-center flex w-24 mt-10">
                   <div className="flex flex-col gap-6">
                      <span className="text-black text-3xl mt-7 font-bold">26</span>
                      <span className="text-[15px] text-black font-medium ">Total</span>
                   </div>
                </div>
                <div className="bg-[#C2FCCB] rounded-2xl justify-center flex w-24 mt-10">
                    <span className="absolute ml-20  text-2xl">🎉</span>
                   <div className="flex flex-col gap-6 justify-center items-center ">
                      <span className="text-black text-3xl mt-5 font-bold">5</span>
                      <span className="text-[15px] text-black font-medium">Completed</span>
                   </div>
                </div>
                <div className="bg-[#F1F1F1] rounded-2xl justify-center flex w-24 mt-10 border border-gray-300">
                   <div className="flex flex-col gap-6 justify-center items-center p-2">
                      <span className="text-black text-3xl mt-5 font-bold ">23</span>
                      <span className="text-[15px] text-black font-medium">Upcoming</span>
                   </div>
                </div>
                </div>
                <div>

                </div>
                <div>

                </div>
                <div>

                </div>
                <div>

                </div>
            </div>
            <div className="flex flex-col m-10 bg-[#ECE9E9]">
                <span className="text-black text-3xl font-bold">My Quizzes</span>
                <div>

                </div>
                <div>

                </div>
                <div>

                </div>
                <div>

                </div>
                <div>

                </div>
            </div>
          </div>
        </>
    )
}