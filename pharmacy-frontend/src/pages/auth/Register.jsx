import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiUser,
  FiMail,
  FiLock,
  FiUserPlus,
  FiLoader,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
} from 'react-icons/fi';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, error } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};

    if (!name.trim()) errors.name = 'Full name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email))
      errors.email = 'Please enter a valid email address';

    if (!password) errors.password = 'Password is required';
    else if (password.length < 6)
      errors.password = 'Password must be at least 6 characters';

    if (password !== passwordConfirmation)
      errors.passwordConfirmation = 'Passwords do not match';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await register(name, email, password); // phone removed
    setIsSubmitting(false);

    if (result.success) navigate('/dashboard');
  };

  const getInputClasses = (fieldName) => {
    const baseClasses =
      'w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200';
    const errorClasses = validationErrors[fieldName]
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/30'
      : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100 hover:border-gray-300';
    return `${baseClasses} ${errorClasses}`;
  };

  const getPasswordInputClasses = (fieldName) => {
    const baseClasses =
      'w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200';
    const errorClasses = validationErrors[fieldName]
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/30'
      : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100 hover:border-gray-300';
    return `${baseClasses} ${errorClasses}`;
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 relative overflow-hidden'>
      {/* Decorative background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000'></div>
      </div>

      <div className='max-w-md w-full relative z-10'>
        <div className='bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20 transition-all duration-300 hover:shadow-3xl'>
          {/* Header Section */}
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4'>
              <FiUserPlus className='text-white text-3xl' />
            </div>
            <h2 className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent'>
              Create Account
            </h2>
            <p className='text-gray-500 text-sm mt-2'>
              Join our platform as a regular user
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Full Name */}
            <div className='space-y-1'>
              <label className='text-sm font-medium text-gray-700 flex items-center gap-1'>
                <FiUser className='text-gray-400 text-sm' />
                Full Name
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FiUser className='text-gray-400 group-focus-within:text-blue-500 transition-colors' />
                </div>
                <input
                  type='text'
                  placeholder='e.g., Ahmad Khan, Fatima Noori'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={getInputClasses('name')}
                />
              </div>
              {validationErrors.name && (
                <p className='text-red-500 text-xs flex items-center gap-1 mt-1'>
                  <FiAlertCircle className='text-xs' />
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className='space-y-1'>
              <label className='text-sm font-medium text-gray-700 flex items-center gap-1'>
                <FiMail className='text-gray-400 text-sm' />
                Email Address
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FiMail className='text-gray-400 group-focus-within:text-blue-500 transition-colors' />
                </div>
                <input
                  type='email'
                  placeholder='example@domain.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={getInputClasses('email')}
                />
              </div>
              {validationErrors.email && (
                <p className='text-red-500 text-xs flex items-center gap-1 mt-1'>
                  <FiAlertCircle className='text-xs' />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className='space-y-1'>
              <label className='text-sm font-medium text-gray-700 flex items-center gap-1'>
                <FiLock className='text-gray-400 text-sm' />
                Password
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FiLock className='text-gray-400 group-focus-within:text-blue-500 transition-colors' />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={getPasswordInputClasses('password')}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors'
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {validationErrors.password && (
                <p className='text-red-500 text-xs flex items-center gap-1 mt-1'>
                  <FiAlertCircle className='text-xs' />
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className='space-y-1'>
              <label className='text-sm font-medium text-gray-700 flex items-center gap-1'>
                <FiLock className='text-gray-400 text-sm' />
                Confirm Password
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FiLock className='text-gray-400 group-focus-within:text-blue-500 transition-colors' />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className={getPasswordInputClasses('passwordConfirmation')}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors'
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiEye size={18} />
                  )}
                </button>
              </div>
              {validationErrors.passwordConfirmation && (
                <p className='text-red-500 text-xs flex items-center gap-1 mt-1'>
                  <FiAlertCircle className='text-xs' />
                  {validationErrors.passwordConfirmation}
                </p>
              )}
            </div>

            {/* API Error Display */}
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm'>
                <FiAlertCircle className='flex-shrink-0' />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2'
            >
              {isSubmitting ? (
                <>
                  <FiLoader className='animate-spin' />
                  Creating account...
                </>
              ) : (
                <>
                  <FiUserPlus />
                  Sign Up
                </>
              )}
            </button>

            {/* Login Link */}
            <p className='text-center text-sm text-gray-600 pt-2'>
              Already have an account?{' '}
              <Link
                to='/login'
                className='font-medium text-blue-600 hover:text-indigo-600 transition-colors hover:underline'
              >
                Sign in instead
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
