// File: src/app/chatbot/page.js
import dynamic from 'next/dynamic';

// Use dynamic import to avoid hydration issues with protected routes
const ChatbotUIWithProtection = dynamic(
  () => import('./ChatbotUIWithProtection'),
  { ssr: false }
);

export default function ChatbotPage() {
  return <ChatbotUIWithProtection />;
}