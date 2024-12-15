import { FormEvent, useRef, useState } from "react";
import { sendPasswordResetEmail, updatePassword } from "firebase/auth"; // Firebase imports
import LoginPageContent from "./LoginPageContent";
import png from "./assets/forgetpassword.png";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { validEmail } from "@secx/utils/src/ValidEmail";
import { auth } from "@secx/utils/src/firebase";


export const Forgetpassword = () => {
  const [form, setForm] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useNavigate();
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErr('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.name === 'email') {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handleForgetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!form?.email) {
      setErr("Email is required");
      setLoading(false);
      return;
    }

    if(!validEmail(form.email)){
      setErr('Email is not valid');
      return;
    }

    // Sending the reset password email using Firebase
    try {
      await sendPasswordResetEmail(auth, form.email);
      setErr('Password reset email sent!');
      //router('/');
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-4 text-white">
      <LoginPageContent />
      <div className="w-full max-w-[400px] space-y-6 p-8 rounded-xl bg-zinc-800 border border-zinc-700">

      {err === "Password reset email sent!" && (
            <div className="flex justify-center">
              <span className="font-medium text-green-500">{err}</span>
            </div>
          )}
        <div className="space-y-2 text-center">
          <span className="bg-transparent bg-clip-text text-transparent bg-gradient-to-r from-[#5F05FF] to-[#05BFF1] text-2xl font-semibold">{"Forgot your password?"}</span>
        </div>
        <div className="justify-center flex">
          <img src={png} className="w-60" />
        </div>

        <form className="space-y-4" onSubmit={handleForgetPassword} aria-labelledby="login-form">
          <div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              className="bg-zinc-700 p-2 rounded-md w-full border border-zinc-600 text-white outline-none placeholder:text-zinc-400 focus:border-purple-500 focus:ring-purple-500"
              value={form.email}
              onChange={handleChange}
              aria-label="Email"
              aria-describedby="email-error"
              aria-invalid={err ? "true" : "false"}
              onKeyDown={handleKeyDown}
            />
          </div>

          {err !== "Password reset email sent!" && (
            <div>
              <span className="font-medium text-red-500">{err}</span>
            </div>
          )}


          <button
            className="w-full outline-none bg-blue-600 hover:bg-blue-700 text-white font-inter font-normal py-2 px-4 rounded-md flex justify-center items-center"
            aria-label="Reset Password"
            type="submit"
            disabled={loading}
          >
            {loading ? <FontAwesomeIcon icon={faSpinner} spin aria-hidden="true" /> : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};
