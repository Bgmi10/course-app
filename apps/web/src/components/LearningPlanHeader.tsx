import { faAngleDown, faChessQueen, faFire } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function LearningPlanHeader (){

    const { user } = useContext(AuthContext);
    
    return(
        <>
          <div className="m-10 flex justify-between ">
            <span className="text-4xl">SecX</span>
            <div className="flex gap-3 items-center">
                <span className="text-2xl">Learning Plan</span> 
                <FontAwesomeIcon icon={faFire} className="text-[#FF7722] text-xl rounded-full p-2 bg-[#37455F]" />
                <div className="flex ">
                <span className="text-white bg-[#37455F] h-7 p-1 rounded-lg">10:30</span>
                </div>
                    <div className="border border-[#85710994] rounded-full bg-[#3D2A06] gap-1 flex p-2">
                    <span><FontAwesomeIcon icon={faChessQueen} className="text-[#EBC80F] "/></span>
                    <span className="text-[#EBC80F]">Go Premium</span>
                </div>
             </div>
             <div className="flex gap-2">
                <div className="items-center flex">
                <img src={user?.reloadUserInfo?.photoUrl} className="rounded-full h-10 w-10" alt="profile image"/>
                </div>
                <div className="flex flex-col">
                 <span className="text-lg"> {user?.displayName}</span>
                 <span className="text-xs font-normal">{user?.email}</span>
                </div>
                <div className="items-center flex">
                <FontAwesomeIcon icon={faAngleDown} className="text-xl cursor-pointer hover:text-gray-200"/>
                </div>
             </div>
          </div>
        </>
    )
}