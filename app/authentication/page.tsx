'use client';

import React, { useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  inMemoryPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,

} from 'firebase/auth'; // Adjust the import path as necessary
import { useRouter } from 'next/navigation';
import { app, auth, db } from '../lib/firebaseConfig';
import Link from 'next/link';
import { loginPasskey } from '../lib/passkeyHelper';
import Script from 'next/script';
interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: string;
  checked: boolean;
}

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const AuthForms: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  // Sign Up Form State
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: '',
    checked: false,
  });
  const [signUpErrors, setSignUpErrors] = useState<Partial<SignUpFormData>>({});

  // Sign In Form State
  const [signInData, setSignInData] = useState<SignInFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [signInErrors, setSignInErrors] = useState<Partial<SignInFormData>>({});

  // Sign Up Handlers
  const handleSignUpChange = (
    field: keyof SignUpFormData,
    value: string | boolean,
  ) => {
    setSignUpData((prev) => ({ ...prev, [field]: value }));
    if (signUpErrors[field]) {
      setSignUpErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateSignUp = (): boolean => {
    const errors: Partial<SignUpFormData> = {};

    if (!signUpData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!signUpData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!signUpData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!signUpData.password) {
      errors.password = 'Password is required';
    } else if (signUpData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!signUpData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (signUpData.password !== signUpData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (signUpData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }

    setSignUpErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Sign In Handlers
  const handleSignInChange = (
    field: keyof SignInFormData,
    value: string | boolean,
  ) => {
    setSignInData((prev) => ({ ...prev, [field]: value }));
    if (signInErrors[field]) {
      setSignInErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };
  const handlePasskeyLogin = async () => {
    const loginRes = await loginPasskey()
    if (loginRes) {
      router.replace("home")
      return
    }
    return
  }

  const validateSignIn = (): boolean => {
    const errors: Partial<SignInFormData> = {};

    if (!signInData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signInData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!signInData.password) {
      errors.password = 'Password is required';
    }

    setSignInErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSignUp()) {
      if (app) {
        const auth = getAuth(app);
        const res = await createUserWithEmailAndPassword(
          auth,
          signUpData.email,
          signUpData.password,
        );
        const user = res.user;
        updateProfile(user, {
          displayName: `${signUpData.firstName}.${signUpData.lastName}`,
        });

        console.log(res);

        router.replace('/home');
      }
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSignIn()) {
      if (app) {
        const auth = getAuth(app);
        const res = await signInWithEmailAndPassword(
          auth,
          signInData.email,
          signInData.password,
        );
        console.log(res);
        const token = await res.user.getIdToken(true);
        if (!signInData.rememberMe) {
          auth.setPersistence(inMemoryPersistence);
        }
        console.log(token);
        router.push('/home');
      }
    }
  };

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setSignUpErrors({});
    setSignInErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };
  const yoloGoogle = () => {
    // @ts-ignore
    const { google } = window as any
    if (!google?.accounts?.id) return;
    google.accounts.id.initialize({
      client_id: "465747096133-sj0hhd2rlirj8oo4vhakpv1bdiv8ivbu.apps.googleusercontent.com",
      callback: async (response: any) => {
        try {
          const idToken = response.credential
          const cred = GoogleAuthProvider.credential(idToken)
          await signInWithCredential(auth, cred)
          router.replace('/home')
        } catch (e) {
          console.log(e)
        }
      },
    });
    google.accounts.id.prompt();
  }
  return (

    <div className="min-h-screen bg-white py-8" id='firebaseui-auth-container'>
      <Script src='https://accounts.google.com/gsi/client' onLoad={yoloGoogle}>
      </Script>
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-black font-medium">
            {isSignUp
              ? 'Sign up to get started with your account'
              : 'Sign in to access your account'}
          </p>
        </div>

        {/* Form Toggle */}
        <div className="bg-gray-100 p-1 rounded-lg mb-6 border-2 border-gray-400 transition-transform duration-300">
          <div className="grid grid-cols-2 gap-1 transition-transform duration-300">
            <button
              type="button"
              onClick={() => !isSignUp && toggleForm()}
              className={`py-2 px-4 rounded-md font-bold text-sm transition-all duration-200 ${isSignUp
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-transparent text-black hover:bg-gray-200'
                }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => isSignUp && toggleForm()}
              className={`py-2 px-4 rounded-md font-bold text-sm transition-all duration-200 ${!isSignUp
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-transparent text-black hover:bg-gray-200'
                }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white shadow-lg rounded-lg border-2 border-gray-400">
          {isSignUp ? (
            /* Sign Up Form */
            <form onSubmit={handleSignUpSubmit} className="p-8 space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-black">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={signUpData.firstName}
                    onChange={(e) =>
                      handleSignUpChange('firstName', e.target.value)
                    }
                    className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 text-black font-medium ${signUpErrors.firstName
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-400 focus:border-blue-600'
                      }`}
                    placeholder="First name"
                  />
                  {signUpErrors.firstName && (
                    <p className="text-red-600 text-sm font-medium">
                      {signUpErrors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-black">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={signUpData.lastName}
                    onChange={(e) =>
                      handleSignUpChange('lastName', e.target.value)
                    }
                    className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 text-black font-medium ${signUpErrors.lastName
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-400 focus:border-blue-600'
                      }`}
                    placeholder="Last name"
                  />
                  {signUpErrors.lastName && (
                    <p className="text-red-600 text-sm font-medium">
                      {signUpErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={signUpData.email}
                  onChange={(e) => handleSignUpChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 text-black font-medium ${signUpErrors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-600'
                    }`}
                  placeholder="Enter your email"
                />
                {signUpErrors.email && (
                  <p className="text-red-600 text-sm font-medium">
                    {signUpErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signUpData.password}
                    onChange={(e) =>
                      handleSignUpChange('password', e.target.value)
                    }
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 text-black font-medium ${signUpErrors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-400 focus:border-blue-600'
                      }`}
                    placeholder="Create password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {signUpErrors.password && (
                  <p className="text-red-600 text-sm font-medium">
                    {signUpErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signUpData.confirmPassword}
                    onChange={(e) =>
                      handleSignUpChange('confirmPassword', e.target.value)
                    }
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 text-black font-medium ${signUpErrors.confirmPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-400 focus:border-blue-600'
                      }`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-blue-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {signUpErrors.confirmPassword && (
                  <p className="text-red-600 text-sm font-medium">
                    {signUpErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signUpData.checked}
                    onChange={(e) =>
                      handleSignUpChange('checked', e.target.checked)
                    }
                    className="mt-1 w-4 h-4 text-blue-600 border-2 border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-black font-medium">
                    I accept the{' '}
                    <a
                      href="#"
                      className="text-blue-600 font-bold hover:text-blue-800 underline"
                    >
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a
                      href="#"
                      className="text-blue-600 font-bold hover:text-blue-800 underline"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {signUpErrors.acceptTerms && (
                  <p className="text-red-600 text-sm font-medium">
                    {signUpErrors.acceptTerms}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-black text-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 border-2 border-blue-700"
              >
                Create Account
              </button>
            </form>
          ) : (
            /* Sign In Form */
            <form onSubmit={handleSignInSubmit} className="p-8 space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={signInData.email}
                  onChange={(e) => handleSignInChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 text-black font-medium ${signInErrors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-600'
                    }`}
                  placeholder="Enter your email"
                />
                {signInErrors.email && (
                  <p className="text-red-600 text-sm font-medium">
                    {signInErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signInData.password}
                    onChange={(e) =>
                      handleSignInChange('password', e.target.value)
                    }
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 text-black font-medium ${signInErrors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-400 focus:border-blue-600'
                      }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {signInErrors.password && (
                  <p className="text-red-600 text-sm font-medium">
                    {signInErrors.password}
                  </p>
                )}
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signInData.rememberMe}
                    onChange={(e) =>
                      handleSignInChange('rememberMe', e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-2 border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-black font-medium">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/authentication/forgot-password"
                  className="text-sm text-blue-600 font-bold hover:text-blue-800 underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-black text-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 border-2 border-blue-700"
              >
                Sign In
              </button>
            </form>
          )}
        </div>

        {/* Social Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-400"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-black font-bold">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  const provider = new GoogleAuthProvider();
                  const result = await signInWithPopup(auth, provider); // Use signInWithPopup for simplicity
                  const user = result.user;

                  console.log("Google sign-in successful:", user);
                  router.replace("/home"); // Redirect to home after successful login
                } catch (error) {
                  console.error("Google sign-in error:", error);
                  alert("Failed to sign in with Google. Please try again.");
                }
              }}
              className="w-full inline-flex justify-center py-3 px-4 border-2 border-gray-400 rounded-lg shadow-sm bg-white text-sm font-bold text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={handlePasskeyLogin}
              className="w-full inline-flex justify-center py-3 px-4 border-2 border-gray-400 rounded-lg shadow-sm bg-white text-sm font-bold text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM18 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
              Log in with Passkey
            </button>
            {/* <button
              type="button"
              className="w-full inline-flex justify-center py-3 px-4 border-2 border-gray-400 rounded-lg shadow-sm bg-white text-sm font-bold text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForms;
