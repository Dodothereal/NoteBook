'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ChatbotUI from './ChatbotUI';

export default function ChatbotUIWithProtection() {
  return (
    <ProtectedRoute>
      <ChatbotUI />
    </ProtectedRoute>
  );
}