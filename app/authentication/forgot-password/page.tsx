"use client"
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import React, { useState } from 'react';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await sendPasswordResetEmail(getAuth(), email)
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Check Your Email
                        </h2>
                        <p className="text-gray-600">
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>

                            <p className="text-sm text-gray-600 mb-6">
                                Click the link in the email to reset your password.
                                If you don't see it, check your spam folder.
                            </p>

                            <Link
                                href="/"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                ← Back to sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Forgot Password?
                    </h2>
                    <p className="text-gray-600">
                        Enter your email address and we'll send you a link to reset your password
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter your email"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                        >
                            Send Reset Link
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => window.history.back()}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            ← Back to Sign In
                        </button>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Remember your password?{' '}
                        <button
                            onClick={() => window.history.back()}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;