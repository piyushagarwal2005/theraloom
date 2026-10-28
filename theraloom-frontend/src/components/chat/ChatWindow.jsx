import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, CheckCheck, Clock, User, Sparkles, MessageCircle } from 'lucide-react';
import api from '../../api/axiosInstance';

export default function ChatWindow({
  conversationId,
  senderType = 'therapist', // 'therapist' or 'client'
  senderId,
  senderName,
  recipientName = 'Conversation Partner',
  recipientTitle = '',
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  // Fetch initial message history
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/messages/${conversationId}`);
        if (res.data?.success) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!conversationId) return;

    const isProductionHost =
      typeof window !== 'undefined' &&
      (window.location.hostname.endsWith('github.io') ||
        window.location.hostname.endsWith('vercel.app'));

    let socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (isProductionHost && (!socketUrl || socketUrl.includes('localhost'))) {
      socketUrl = 'https://theraloom-api.onrender.com';
    } else if (!socketUrl) {
      socketUrl = 'https://theraloom-api.onrender.com';
    }

    const socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: {
        token: localStorage.getItem('theraloom_token') || '',
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join_conversation', { conversationId });
      socket.emit('mark_read', { conversationId, userType: senderType });
    });

    socket.on('new_message', (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          // Avoid duplicate messages if already present
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        socket.emit('mark_read', { conversationId, userType: senderType });
      }
    });

    socket.on('user_typing', ({ senderName: typer }) => {
      setTypingUser(typer);
    });

    socket.on('user_stop_typing', () => {
      setTypingUser(null);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    return () => {
      socket.emit('leave_conversation', { conversationId });
      socket.disconnect();
    };
  }, [conversationId, senderType]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (socketRef.current) {
      socketRef.current.emit('typing', { conversationId, senderName });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit('stop_typing', { conversationId });
        }
      }, 1500);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_message', {
        conversationId,
        senderType,
        senderId,
        senderName,
        text: textToSend,
      });
      socketRef.current.emit('stop_typing', { conversationId });
    } else {
      // Fallback via HTTP API if socket temporarily disconnected
      try {
        const res = await api.post('/chat/messages', {
          conversationId,
          senderType,
          senderId,
          senderName,
          text: textToSend,
        });
        if (res.data?.success) {
          setMessages((prev) => [...prev, res.data.message]);
        }
      } catch (err) {
        console.error('Failed to send message via HTTP fallback:', err);
      }
    }
  };

  if (!conversationId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#FAF8F5] rounded-2xl border border-[#EAE5DE]">
        <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] text-[#19382C] flex items-center justify-center mb-3">
          <MessageCircle className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-[#19382C]">No Conversation Selected</h4>
        <p className="text-xs text-[#535C56] mt-1 max-w-xs">
          Select a client or conversation thread from the sidebar to start secure messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#EAE5DE] shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#EAE5DE] bg-[#FAF8F5] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#19382C] text-[#FAF8F5] flex items-center justify-center text-xs font-serif font-bold">
            {recipientName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#19382C]">{recipientName}</h4>
            <div className="flex items-center gap-2 text-[11px] text-[#7D9D8B]">
              {recipientTitle && <span>{recipientTitle} • </span>}
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {socketConnected ? 'Encrypted Channel Live' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-[#535C56] bg-white px-2.5 py-1 rounded-md border border-[#EAE5DE]">
          Private Practice Chat
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]/30">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#7D9D8B]">
            This is the start of your secure conversation with {recipientName}. All messages are stored encrypted.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderType === senderType;
            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-[#19382C] text-white rounded-br-xs'
                      : 'bg-white text-[#1F2421] border border-[#EAE5DE] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap wrap-break-words">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-[#7D9D8B]">
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMe && (
                    <span title={msg.isRead ? 'Read' : 'Delivered'}>
                      <CheckCheck
                        className={`w-3 h-3 ${msg.isRead ? 'text-[#7D9D8B]' : 'text-gray-400'}`}
                      />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {typingUser && (
          <div className="flex items-center gap-2 text-xs text-[#7D9D8B] italic px-2 py-1">
            <span className="w-1.5 h-1.5 bg-[#7D9D8B] rounded-full animate-bounce" />
            <span>{typingUser} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-white border-t border-[#EAE5DE] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={`Message ${recipientName}...`}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5] focus:outline-hidden focus:border-[#19382C]"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`p-2.5 rounded-xl text-white transition-all ${
            inputText.trim()
              ? 'bg-[#19382C] hover:bg-[#244E3E]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
