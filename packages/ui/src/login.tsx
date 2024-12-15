import { FcGoogle } from "react-icons/fc";
import React, { useState, useEffect, useRef } from 'react';
import { validEmail } from "@secx/utils/src/ValidEmail";
import { auth } from "@secx/utils/src/firebase";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup,createUserWithEmailAndPassword,updateProfile } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import LoginPageContent from "./LoginPageContent";

export default function Signin() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: ''});
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useNavigate();
  const googleProvider = new GoogleAuthProvider();
  const firstName = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const registerPath = window.location.pathname === "/register";

  useEffect(() => {
    firstName.current?.focus();
  }, []);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!form.email || !form.password) {
      setErr('All fields are required');
      setLoading(false);
      return;
    }

    if (!validEmail(form.email)) {
      setErr('Email is not valid');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      if (user) {
        router('/');
      }
    } catch (E: any) {
      console.log(E.message);
      setErr(E.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      setErr('All fields are required');
      setLoading(false);
      return;
    }

    if (!validEmail(form.email)) {
      setErr('Email is not valid');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      if(user){
        await updateProfile(user, {
          displayName: `${form.firstName} ${form.lastName}`
        });
        router('/');
      }
    } catch (E: any) {
      console.log(E.message);
      setErr(E.message);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleAuth = () => {
    signInWithPopup(auth, googleProvider)
      .then((res: any) => {
        console.log(res);
        router('/');
      })
      .catch(e => console.log(e.code));
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-4 text-white">
      <LoginPageContent />
      <div className="w-full max-w-[400px] space-y-6 p-8 rounded-xl bg-zinc-800 border border-zinc-700">
        <div className="space-y-2 text-center">
          <span className="bg-transparent bg-clip-text text-transparent bg-gradient-to-r from-[#5F05FF] to-[#05BFF1] text-2xl font-semibold">{ !registerPath ? "Login with" : "Register with"}</span>
        </div>

        <button
          className="w-full flex justify-center items-center py-2 rounded-md bg-zinc-700 border text-white border-zinc-600 hover:bg-zinc-600 hover:text-white"
          aria-label="Login with Google"
          onClick={handleGoogleAuth}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-600"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-800 px-2 text-zinc-400">or</span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={registerPath ? handleRegister : handleLogin} aria-labelledby="login-form">
          <div className="flex gap-2 ">
            { registerPath && <><input
                id="firstName"
                name="firstName"
                type="firstName"
                placeholder="First Name"
                className="bg-zinc-700 p-2 rounded-md w-full border border-zinc-600 text-white outline-none placeholder:text-zinc-400 focus:border-purple-500 focus:ring-purple-500"
                value={form.firstName}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                ref={firstName}
                aria-label="firstName"
                aria-describedby="firstName-error"
                aria-invalid={err ? "true" : "false"}
            />
            <input
              id="lastName"
              name="lastName"
              type="lastName"
              placeholder="Last Name"
              className="bg-zinc-700 p-2 rounded-md w-full border border-zinc-600 text-white outline-none placeholder:text-zinc-400 focus:border-purple-500 focus:ring-purple-500"
              value={form.lastName}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              aria-label="lastName"
              aria-describedby="lastName-error"
              aria-invalid={err ? "true" : "false"}
            /> </>}
          </div>
          <div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              className="bg-zinc-700 p-2 rounded-md w-full border border-zinc-600 text-white outline-none placeholder:text-zinc-400 focus:border-purple-500 focus:ring-purple-500"
              value={form.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              aria-label="Email"
              aria-describedby="email-error"
              aria-invalid={err ? "true" : "false"}
            />
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              className="bg-zinc-700 p-2 rounded-md w-full border border-zinc-600 text-white outline-none placeholder:text-zinc-400 focus:border-purple-500 focus:ring-purple-500"
              value={form.password}
              onChange={handleChange}
              ref={passwordRef}
              aria-label="Password"
            />
            <div className="text-end">
            {window.location.pathname === "/login" && <span className="font-inter text-[14px] font-normal leading-[16.94px] text-left cursor-pointer  hover:text-gray-300" onClick={()=> router('/forget-password')}>Forget password?</span>}
            </div>
          </div>

          {err && (
            <div>
              <span className="font-medium text-red-500">{err}</span>
            </div>
          )}

          <button
            className="w-full outline-none bg-blue-600 hover:bg-blue-700 text-white font-inter font-normal py-2 px-4 rounded-md flex justify-center items-center "
            aria-label="Login"
            type="submit"
            disabled={loading}
          >
            {loading ? <FontAwesomeIcon icon={faSpinner} spin aria-hidden="true" /> : !registerPath ? "Login" : "Sign up"}
          </button>
        </form>
       {window.location.pathname === "/login" && <div className="text-center">
          <span className="center font-normal font-inter">Don't have an account? <span className="text-[#2b52ff] cursor-pointer hover:text-[#4357b3]" onClick={() => router("/register")}>Register</span></span>
        </div>}
        {
          registerPath && <div className="text-center">
          <span className="center font-normal font-inter">Already have an account? <span className="text-[#2b52ff] cursor-pointer hover:text-[#4357b3]" onClick={() => router("/login")}>Login</span></span>
        </div>
        }
      </div>
    </div>
  );
}

