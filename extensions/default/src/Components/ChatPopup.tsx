import React, { useEffect, useState, useRef } from 'react';
import { Send, MessageCircle, Users, Clock } from 'lucide-react';

const API_BASE_URL = 'https://dycovue-be.inheritxdev.in/api/v1/study';

interface Message {
  user: string;
  message: string;
  time: string | Date;
  id?: string;
}

export default function ChatPanel({ roomId, user }: { roomId: string; user: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get URL parameters
  const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      displaySetInstanceUID: urlParams.get('sopInstanceUID') || '',
      username: urlParams.get('username') || user,
      userId: urlParams.get('userId') || '',
      StudyInstanceUIDs: urlParams.get('StudyInstanceUIDs') || '',
      sopInstanceUID: urlParams.get('sopInstanceUID') || '',
    };
  };

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { displaySetInstanceUID } = getUrlParams();

      const response = await fetch(
        `${API_BASE_URL}/ohif-messages?displaySetInstanceUID=${displaySetInstanceUID}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const formattedMessages: Message[] = data.data.map((msg: any) => ({
            id: msg._id,
            user: msg.username,
            message: msg.message,
            time: msg.createdAt,
          }));
          setMessages(formattedMessages);
        } else {
          console.error('Unexpected API response structure:', data);
        }
      } else {
        console.error('Failed to fetch messages:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send message to API
  const sendMessage = async () => {
    if (!input.trim() || sending) {
      return;
    }

    try {
      setSending(true);
      const { displaySetInstanceUID, username, userId } = getUrlParams();

      const payload = {
        userId: userId || 'default-user-id',
        username: username || user,
        displaySetInstanceUID: displaySetInstanceUID,
        message: input.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/ohif-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setInput('');
        await fetchMessages();
      } else {
        console.error('Failed to send message:', response.statusText);
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please check your connection.');
    } finally {
      setSending(false);
    }
  };

  // Fetch messages on component mount and set up polling
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [roomId, user]);

  const currentUsername = getUrlParams().username || user;

  return (
    <div className="flex h-full w-80 flex-col border-l border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-white/20 p-2">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">Study Chat</h3>
            <div className="flex items-center space-x-2 text-xs opacity-90">
              <Users className="h-3 w-3" />
              <span>{currentUsername}</span>
              {loading && (
                <div className="flex items-center space-x-1">
                  <div className="h-1 w-1 animate-bounce rounded-full bg-white"></div>
                  <div
                    className="h-1 w-1 animate-bounce rounded-full bg-white"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="h-1 w-1 animate-bounce rounded-full bg-white"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#1E293B] p-4">
        {messages.length === 0 && !loading && (
          <div className="py-8 text-center">
            <div className="rounded-xl border border-slate-200 bg-white/60 p-6 shadow-sm backdrop-blur-sm">
              <MessageCircle className="mx-auto mb-3 h-12 w-12 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">No messages yet</p>
              <p className="mt-1 text-xs text-slate-500">Start the conversation!</p>
            </div>
          </div>
        )}

        {messages.map((m, index) => {
          const isCurrentUser = m.user === currentUsername;
          return (
            <div
              key={m.id || index}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`max-w-xs rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md lg:max-w-md ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'border border-slate-200 bg-white text-slate-800'
                }`}
              >
                <div className="mb-1 flex items-center space-x-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isCurrentUser
                        ? 'bg-white/20 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    }`}
                  >
                    {m.user.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`text-xs font-medium ${isCurrentUser ? 'text-white/90' : 'text-slate-600'}`}
                  >
                    {m.user}
                  </span>
                  {m.time && (
                    <div className="flex items-center space-x-1">
                      <Clock
                        className={`h-3 w-3 ${isCurrentUser ? 'text-white/70' : 'text-slate-400'}`}
                      />
                      <span
                        className={`text-xs ${isCurrentUser ? 'text-white/70' : 'text-slate-400'}`}
                      >
                        {new Date(m.time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>
                <p className="break-words text-sm leading-relaxed">{m.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={sending ? 'Sending...' : 'Type your message...'}
              disabled={sending}
              className="w-full rounded-xl border-2 border-blue-200 bg-slate-50 px-4 py-3 text-sm placeholder-slate-400 shadow-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            {input && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              </div>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="transform rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-3 text-white shadow-md transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-purple-600 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-400 disabled:hover:shadow-md"
          >
            {sending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Typing indicator */}
        {sending && (
          <div className="mt-2 flex items-center space-x-2 text-xs text-slate-500">
            <div className="flex space-x-1">
              <div className="h-1 w-1 animate-bounce rounded-full bg-slate-400"></div>
              <div
                className="h-1 w-1 animate-bounce rounded-full bg-slate-400"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="h-1 w-1 animate-bounce rounded-full bg-slate-400"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
