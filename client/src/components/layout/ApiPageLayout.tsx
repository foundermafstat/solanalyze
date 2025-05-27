import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ApiPageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  apiEndpoint?: string;
  docsUrl?: string;
}

const ApiPageLayout: React.FC<ApiPageLayoutProps> = ({
  children,
  title,
  description,
  apiEndpoint,
  docsUrl,
}) => {
  const pathname = usePathname();
  const categoryMatch = pathname.match(/^\/([^\/]+)/);
  const category = categoryMatch ? categoryMatch[1] : '';

  const getCategoryName = (cat: string): string => {
    const categoryMap: Record<string, string> = {
      'account': 'Аккаунт',
      'trade': 'Торговля',
      'market': 'Рыночные данные',
      'public': 'Публичные данные',
      'system': 'Система',
    };
    return categoryMap[cat] || cat;
  };

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Навигация</h3>
          <div className="space-y-1">
            <Link href="/" className="block text-blue-600 hover:text-blue-800 hover:underline mb-4">
              ← На главную
            </Link>
            
            <div className="py-2">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                {getCategoryName(category)}
              </h4>
              <nav className="space-y-1">
                {/* Эта часть будет заполнена динамически на основе категории */}
                {/* Тут можно также добавить динамический список навигации */}
              </nav>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
            {description && (
              <p className="text-gray-600 mb-4">{description}</p>
            )}
            {(apiEndpoint || docsUrl) && (
              <div className="flex flex-wrap gap-4 text-sm">
                {apiEndpoint && (
                  <div className="bg-gray-100 px-3 py-1 rounded">
                    <span className="font-medium">API Endpoint:</span> {apiEndpoint}
                  </div>
                )}
                {docsUrl && (
                  <a 
                    href={docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Документация
                  </a>
                )}
              </div>
            )}
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default ApiPageLayout;
