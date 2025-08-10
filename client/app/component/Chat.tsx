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

  const handleSendChatMessage = async () => {
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    const res = await fetch(`http://localhost:8000/chat?message=${message}`);
    const data = await res.json();
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: data?.message },
    ]);
    setMessage('');
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Scrollable messages */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages
          .filter((m) => m.role === 'assistant')
          .map((message, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-gray-100 text-gray-800 whitespace-pre-wrap"
            >
              {message.content}
            </div>
          ))}
      </div>

      {/* Input bar at bottom */}
      <div className="mt-3 flex gap-3">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here"
          className="flex-1"
        />
        <Button onClick={handleSendChatMessage} disabled={!message.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatComponent;
