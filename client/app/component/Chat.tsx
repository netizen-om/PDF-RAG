'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as React from 'react';

interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
}

interface IMessage {
  role: 'assistant' | 'user';
  content?: string;
  documents?: Doc[];
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;

    // Add user message instantly
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/chat?message=${encodeURIComponent(message)}`);
      const data = await res.json();

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data?.message },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Scrollable messages */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((m, index) => (
          <div
            key={index}
            className={`max-w-[75%] p-3 rounded-lg whitespace-pre-wrap transition-all duration-200 ease-in-out 
              ${m.role === 'user' 
                ? 'bg-blue-500 text-white ml-auto animate-slideInRight' 
                : 'bg-gray-100 text-gray-800 mr-auto animate-slideInLeft'}`}
          >
            {m.content}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="bg-gray-200 text-gray-600 p-3 rounded-lg w-fit mr-auto animate-pulse">
            Assistant is typing<span className="animate-bounce">...</span>
          </div>
        )}
      </div>

      {/* Input bar at bottom */}
      <div className="mt-3 flex gap-3">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here"
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
        />
        <Button onClick={handleSendChatMessage} disabled={!message.trim() || isLoading}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatComponent;
