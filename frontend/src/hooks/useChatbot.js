// Grok API chat hook
import { useState } from 'react';

export function useChatbot() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message) => {
    setLoading(true);
    try {
      // Grok API call logic
      setMessages([...messages, { role: 'user', content: message }]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}
