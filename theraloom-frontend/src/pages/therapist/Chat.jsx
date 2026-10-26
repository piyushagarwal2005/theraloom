import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Sparkles, User, Clock, CheckCheck, AlertCircle } from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import ChatWindow from '../../components/chat/ChatWindow';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';

export default function Chat() {
  const { therapist } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/chat/conversations');
        if (res.data?.success) {
          const convs = res.data.conversations || [];
          setConversations(convs);
          if (convs.length > 0 && !selectedConv) {
            setSelectedConv(convs[0]);
          }
        }
      } catch (err) {
        console.warn('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const name = c.clientId?.name || c.clientName || '';
    return name.toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B]">
            Communication Layer
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#19382C]">
            Secure Client Messaging
          </h1>
          <p className="text-xs text-[#535C56]">
            Encrypted real-time communication rooms with your active practice clients.
          </p>
        </div>

        {/* Chat UI Split Container */}
        <div className="bg-white rounded-3xl border border-[#EAE5DE] shadow-xs overflow-hidden h-[620px] grid grid-cols-1 md:grid-cols-12">
          {/* Left Sidebar: Conversations List */}
          <div className="md:col-span-4 border-r border-[#EAE5DE] flex flex-col h-full bg-[#FAF8F5]/40">
            {/* Search */}
            <div className="p-3.5 border-b border-[#EAE5DE]">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#EAE5DE] text-xs bg-white focus:outline-hidden focus:border-[#19382C]"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#EAE5DE]">
              {loading ? (
                <div className="p-8 text-center text-xs text-[#7D9D8B] animate-pulse">
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7D9D8B] space-y-2">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
                  <p>No active message threads.</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const clientName = conv.clientId?.name || conv.clientName || 'Client';
                  const isSelected = selectedConv?._id === conv._id;

                  return (
                    <div
                      key={conv._id}
                      onClick={() => setSelectedConv(conv)}
                      className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#E8EFEA] border-r-4 border-[#19382C]'
                          : 'hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <Avatar name={clientName} size="md" className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#19382C] truncate">
                            {clientName}
                          </h4>
                          <span className="text-[10px] text-[#7D9D8B]">
                            {conv.lastMessageAt
                              ? new Date(conv.lastMessageAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#535C56] truncate mt-0.5">
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>

                      {conv.unreadCountTherapist > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#19382C] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {conv.unreadCountTherapist}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Main Area: Chat Window */}
          <div className="md:col-span-8 h-full">
            {selectedConv ? (
              <ChatWindow
                conversationId={selectedConv._id}
                senderType="therapist"
                senderId={therapist?._id}
                senderName={therapist?.name || 'Therapist'}
                recipientName={selectedConv.clientId?.name || selectedConv.clientName || 'Client'}
                recipientTitle="Client"
              />
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center text-xs text-[#7D9D8B]">
                Select a client conversation from the list to begin messaging.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
