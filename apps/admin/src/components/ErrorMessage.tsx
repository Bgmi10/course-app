import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const ErrorMessage = ({ message }: { message: string }) => (
   <> {message && <div className="bg-red-100 border mb-5 border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center" role="alert">
      <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
      <span className="block sm:inline">{message}</span>
    </div>}
   </>
  );