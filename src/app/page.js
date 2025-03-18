import Link from 'next/link';
import ProjectCard from '@/components/ProjectCard';

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">NoteBook Projects</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectCard 
          title="AI Chatbot" 
          description="Chat with multiple AI models including Deepseek R1, Gemini 2.0 Flash, and Claude models"
          href="/chatbot"
        />
        {/* More projects can be added here in the future */}
      </div>
    </main>
  );
}