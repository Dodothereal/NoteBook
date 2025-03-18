import dynamic from 'next/dynamic';

// Use dynamic import to avoid hydration issues with protected routes
const ChatbotUIWithProtection = dynamic(
  () => import('@/components/chatbot/ChatbotUIWithProtection'),
  { ssr: false }
);

export default function ChatbotPage() {
  return <ChatbotUIWithProtection />;
}