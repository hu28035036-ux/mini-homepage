'use client';

import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes, useEffect } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>{children}</div>;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'lg',
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  const widthCls = size === 'md' ? 'max-w-xl' : size === 'lg' ? 'max-w-3xl' : 'max-w-5xl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className={`w-full ${widthCls} bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="font-bold text-base">{title}</div>
          <button onClick={onClose} aria-label="닫기" className="text-gray-500 hover:text-gray-900 text-2xl leading-none">
            ×
          </button>
        </div>
        <div className="overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export function IconButton({
  children,
  className = '',
  title,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      title={title}
      className={`inline-flex items-center justify-center w-7 h-7 rounded text-gray-500 hover:bg-black/5 hover:text-gray-900 transition ${className}`}
    >
      {children}
    </button>
  );
}

export function Button({ children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 transition ${className}`}
    >
      {children}
    </button>
  );
}

export function DangerButton({ children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 transition ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 ${className}`}
    />
  );
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 ${className}`}
    />
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
    </label>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <p className="text-sm text-red-600 mt-1">{children}</p>;
}
