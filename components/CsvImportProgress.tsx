'use client';

import { useEffect, useState } from 'react';

export default function CsvImportProgress() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-12">
          {/* Animated Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="absolute inset-0 w-24 h-24 bg-blue-200 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>

          {/* Status Text */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Importing Products{dots}
            </h2>
            <p className="text-gray-600 text-lg">
              Please wait while we process your CSV file
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4 mb-8">
            <ProgressStep
              title="Parsing CSV data"
              description="Reading and validating CSV content"
              status="completed"
            />
            <ProgressStep
              title="Downloading images"
              description="Fetching product images from URLs"
              status="in-progress"
            />
            <ProgressStep
              title="Creating products"
              description="Importing products and variants to database"
              status="pending"
            />
            <ProgressStep
              title="Finalizing import"
              description="Completing import and generating report"
              status="pending"
            />
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">This may take a few minutes</p>
                <p className="text-sm text-blue-700">
                  Import time depends on the number of products and images. Large imports can take several minutes. Please do not close this page.
                </p>
              </div>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="mt-8">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProgressStepProps {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
}

function ProgressStep({ title, description, status }: ProgressStepProps) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mr-4">
        {status === 'completed' && (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === 'in-progress' && (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        {status === 'pending' && (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className={`font-semibold mb-1 ${
          status === 'in-progress' ? 'text-blue-900' :
          status === 'completed' ? 'text-green-900' :
          'text-gray-500'
        }`}>
          {title}
        </h3>
        <p className={`text-sm ${
          status === 'in-progress' ? 'text-blue-700' :
          status === 'completed' ? 'text-green-700' :
          'text-gray-500'
        }`}>
          {description}
        </p>
      </div>
    </div>
  );
}
