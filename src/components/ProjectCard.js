'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProjectCard({ title, description, href }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    if (!user && !loading) {
      router.push('/login');
    } else {
      router.push(href);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}