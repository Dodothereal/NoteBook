// app/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Project data - add new projects here
const projects = [
  {
    id: 'chatbot',
    title: 'AI Chatbot Interface',
    description: 'Advanced chatbot with multiple AI models including Deepseek R1 and Gemini 2.0 Flash.',
    image: '/projects/chatbot-preview.jpg',
    tags: ['Next.js', 'AI', 'Tailwind CSS'],
    path: '/projects/chatbot'
  },
  // Add more projects here as you create them
];

export default function Home() {
  const [hoveredProject, setHoveredProject] = useState(null);
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="container mx-auto pt-16 pb-8 px-4">
        <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          NoteBook
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl">
          A collection of innovative projects and experiments
        </p>
      </header>
      
      {/* Project Grid */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-8 text-gray-100">Select a Project</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              href={project.path} 
              key={project.id}
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
              className="group"
            >
              <div className="bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-700 transition-all duration-300 hover:shadow-2xl hover:border-blue-500 hover:scale-[1.02] h-full flex flex-col">
                <div className="relative h-48 w-full overflow-hidden">
                  <div className="absolute inset-0 bg-blue-900 bg-opacity-30 z-10"></div>
                  {project.image ? (
                    <Image 
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  )}
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold mb-2 text-blue-300 group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-300 mb-4 flex-grow">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="px-6 py-3 bg-gray-900 bg-opacity-60 border-t border-gray-700 group-hover:border-blue-900 transition-colors">
                  <span className="flex items-center text-blue-400 text-sm font-medium">
                    <span>Explore Project</span>
                    <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-8 border-t border-gray-800 text-center text-gray-400">
        <p>NoteBook © {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
