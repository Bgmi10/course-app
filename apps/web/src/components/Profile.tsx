import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

export default function Profile (){

    const { user } = useContext(AuthContext);

    console.log(user);

    return(
        <>
          <div>
              <div className="flex flex-col">
                <span>Account</span>
                <span>Real-time information and activities of your property</span>
              </div>

              <div></div>

              <div className="flex justify-between">
                <div className="flex">
                    <img src={user?.reloadUserInfo?.photoUrl} alt="profile" className="rounded-full h-12 w-12" />
                    <div>
                       <span className="font-semibold text-2xl">{user?.displayName}</span>
                       <span className="text-[#BEBEBE] font-semibold text-2xl">PNG, JPEG under 15mb</span>
                    </div>
                </div>
                <div>
                    <button>Upload new picture</button>
                    <button>Delete</button>
                </div>
              </div>

              <div>
                 <span>Full Name</span>
                 <div>
                    <input type="text" placeholder={user?.displayName} />
                 </div>
              </div>

              <div>
                <span>Contact Email</span>
                <span>Manage your accounts small address for the invorans</span>
                <span>Email</span>
                <input type="text" placeholder={user?.email} />
              </div>
          </div>
        </>
    )
}