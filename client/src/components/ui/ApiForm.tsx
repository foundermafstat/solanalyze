import React, { useState } from 'react';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  required?: boolean;
  options?: { label: string; value: string }[];
}

interface ApiFormProps {
  fields: Field[];
  onSubmit: (data: Record<string, string>) => void;
  isLoading?: boolean;
  method?: 'GET' | 'POST';
  title?: string;
  description?: string;
}

const ApiForm: React.FC<ApiFormProps> = ({
  fields,
  onSubmit,
  isLoading = false,
  method = 'GET',
  title,
  description,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      {title && <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="grid grid-cols-1 gap-2">
            <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                required={field.required}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Выберите опцию</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                required={field.required}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white font-medium ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? 'Загрузка...' : `Отправить ${method} запрос`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApiForm;
