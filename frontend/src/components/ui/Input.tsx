import React, { forwardRef } from 'react';
import { theme } from '../../styles/design-system';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rtl?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rtl = false,
  className = '',
  ...props
}, ref) => {
  const inputStyles = `
    w-full px-4 py-2.5 rounded-lg
    bg-white border-2 transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    ${error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
      : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
    }
    ${icon && iconPosition === 'left' ? 'pl-10' : ''}
    ${icon && iconPosition === 'right' ? 'pr-10' : ''}
    ${rtl ? 'text-right' : 'text-left'}
  `;

  const labelStyles = `
    block text-sm font-medium text-gray-700 mb-1
    ${rtl ? 'text-right' : 'text-left'}
  `;

  const iconStyles = `
    absolute top-1/2 transform -translate-y-1/2 text-gray-400
    ${iconPosition === 'left' ? 'left-3' : 'right-3'}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className={labelStyles}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <span className={iconStyles}>
            {icon}
          </span>
        )}
        
        <input
          ref={ref}
          className={inputStyles}
          dir={rtl ? 'rtl' : 'ltr'}
          {...props}
        />
        
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-lg opacity-0 blur transition-opacity duration-300 pointer-events-none peer-focus:opacity-20" />
      </div>
      
      {(hint || error) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'} ${rtl ? 'text-right' : 'text-left'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  rtl?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  hint,
  fullWidth = false,
  rtl = false,
  className = '',
  ...props
}, ref) => {
  const textareaStyles = `
    w-full px-4 py-2.5 rounded-lg
    bg-white border-2 transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    resize-y min-h-[100px]
    ${error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
      : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
    }
    ${rtl ? 'text-right' : 'text-left'}
  `;

  const labelStyles = `
    block text-sm font-medium text-gray-700 mb-1
    ${rtl ? 'text-right' : 'text-left'}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className={labelStyles}>
          {label}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          className={textareaStyles}
          dir={rtl ? 'rtl' : 'ltr'}
          {...props}
        />
        
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-lg opacity-0 blur transition-opacity duration-300 pointer-events-none peer-focus:opacity-20" />
      </div>
      
      {(hint || error) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'} ${rtl ? 'text-right' : 'text-left'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  rtl?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  hint,
  options,
  placeholder,
  fullWidth = false,
  rtl = false,
  className = '',
  ...props
}, ref) => {
  const selectStyles = `
    w-full px-4 py-2.5 rounded-lg appearance-none
    bg-white border-2 transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    ${error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
      : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
    }
    ${rtl ? 'text-right pr-10' : 'text-left pr-10'}
  `;

  const labelStyles = `
    block text-sm font-medium text-gray-700 mb-1
    ${rtl ? 'text-right' : 'text-left'}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className={labelStyles}>
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={selectStyles}
          dir={rtl ? 'rtl' : 'ltr'}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className={`absolute top-1/2 transform -translate-y-1/2 pointer-events-none ${rtl ? 'left-3' : 'right-3'}`}>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {(hint || error) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'} ${rtl ? 'text-right' : 'text-left'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';