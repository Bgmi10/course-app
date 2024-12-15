import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserFriends, faPlus, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function LoginPageContent() {
    return(
    <>
      <div className="flex flex-col mb-8 md:mb-0 md:mr-8 max-w-md">
        <div className="flex flex-col">
          <span className="font-normal text-2xl">SecX</span>
          <span className="font-normal text-3xl">Start your 1-day free trial</span>
        </div>
        <div className="mt-5">
          <div className="relative">
            <FontAwesomeIcon icon={faPlus} className="absolute left-[-10px] top-1 text-sm text-[#00D1FF]" />
            <FontAwesomeIcon icon={faUserFriends} className="text-[#00D1FF] text-xl" />
          </div>
          <div className="flex mt-2 flex-col">
            <span className="font-normal text-2xl">Invite people to join your mining</span>
            <span className="text-2xl font-normal">network</span>
            <span className="font-normal text-sm mt-2 text-gray-500">Grow your network to increase your mining speed</span>
          </div>
        </div>
        <div className="flex flex-col mt-5">
          <FontAwesomeIcon icon={faCheckCircle} className="text-[#00D1FF] text-2xl self-start" />
          <span className="text-2xl mt-5 font-normal">Enjoy Verified Courses</span>
          <span className="font-normal text-gray-500 text-sm mt-3">Courses which are tailormade for you and will help</span>
          <span className="text-gray-500 font-normal text-md">you gain your professional goals</span>
          <span className="mt-5 text-2xl">Upskill your learning journey</span>
          <span className="mt-1 text-2xl">With live events and quizzes</span>
        </div>
     </div>
    </>
    )
}