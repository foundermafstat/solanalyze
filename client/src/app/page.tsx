import React, { Suspense } from 'react';
import DashboardSection from './components/DashboardSection';
import DashboardLayout from './components/layout/DashboardLayout';

const EndpointsShowcase = React.lazy(() => import('./components/EndpointsShowcase'));

export default function Home() {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <main>
          {/* Chart and statistics section */}
          <DashboardSection />
          {/* API endpoint groups section */}
          <div className="mt-10">
            {/* Новый компонент карточек эндпоинтов с поддержкой тем */}
            <Suspense fallback={<div>Loading endpoints...</div>}>
              <EndpointsShowcase />
            </Suspense>
          </div>
        </main>
        <footer className="mt-12 pt-6 border-t border-gray-200 text-gray-600 text-center">
          <p>© 2025 OKX API Client. Version 1.0.0</p>
          <p className="mt-2">
            <a 
              href="https://www.okx.com/docs-v5/en/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Official OKX API Documentation
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
