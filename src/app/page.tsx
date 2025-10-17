import Link from 'next/link';
import { getUser } from '@/lib/auth/authHelpers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold text-gray-900'>Exams Platform</h1>
            <nav className='flex items-center space-x-4'>
              <div className='hidden md:flex space-x-8 mr-8'>
                <a href='#' className='text-gray-600 hover:text-gray-900'>
                  Features
                </a>
                <a href='#' className='text-gray-600 hover:text-gray-900'>
                  About
                </a>
                <a href='#' className='text-gray-600 hover:text-gray-900'>
                  Contact
                </a>
              </div>
              <Link
                href='/auth/login'
                className='text-gray-600 hover:text-gray-900 font-medium'
              >
                Sign In
              </Link>
              <Link
                href='/auth/signup'
                className='bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors'
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className='flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto text-center'>
          <div className='mb-8'>
            <div className='inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6'>
              <span className='w-2 h-2 bg-green-400 rounded-full mr-2'></span>
              System Online
            </div>
            <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
              Modern Exam
              <span className='text-blue-600'> Management</span>
            </h1>
            <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
              A secure, scalable, and user-friendly platform for creating,
              managing, and conducting online examinations with real-time
              analytics.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center mb-12'>
            <Link
              href='/auth/signup'
              className='bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center'
            >
              Get Started
            </Link>
            <Link
              href='/auth/login'
              className='border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center'
            >
              Sign In
            </Link>
          </div>

          {/* Features Grid */}
          <div className='grid md:grid-cols-3 gap-8 mt-16'>
            <div className='bg-white p-6 rounded-xl shadow-sm border'>
              <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto'>
                <span className='text-2xl'>🔒</span>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Secure & Reliable
              </h3>
              <p className='text-gray-600'>
                Enterprise-grade security with end-to-end encryption and secure
                authentication.
              </p>
            </div>

            <div className='bg-white p-6 rounded-xl shadow-sm border'>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto'>
                <span className='text-2xl'>⚡</span>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Fast Performance
              </h3>
              <p className='text-gray-600'>
                Optimized with Next.js 15 and React 19 for lightning-fast user
                experience.
              </p>
            </div>

            <div className='bg-white p-6 rounded-xl shadow-sm border'>
              <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto'>
                <span className='text-2xl'>📊</span>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Analytics Dashboard
              </h3>
              <p className='text-gray-600'>
                Comprehensive reporting and analytics to track performance and
                insights.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-white border-t mt-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center text-gray-600'>
            <p>© 2024 Exams Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
