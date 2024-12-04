import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const SuccessMessage = ({ message }: { message: string }) => (
    <>{ message && <div className="bg-green-100 border mb-10 border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center" role="alert">
      <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
      <span className="block sm:inline">{message}</span>
    </div>}</>
  );
