import { useState } from 'react';
import { X, Send, Image, Smile, Paperclip, Search } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread?: number;
  isOfficial?: boolean;
}

interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  type: 'text' | 'image';
}

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderTitle: string;
  customerName: string;
}

export function MessageModal({ isOpen, onClose, orderId, orderTitle, customerName }: MessageModalProps) {
  const [selectedContact, setSelectedContact] = useState<number>(1);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 模拟联系人列表
  const [contacts] = useState<Contact[]>([
    {
      id: 1,
      name: customerName,
      lastMessage: `关于订单「${orderTitle}」`,
      lastMessageTime: '刚刚',
      unread: 0
    },
    {
      id: 2,
      name: 'CSDN官方',
      avatar: '',
      lastMessage: '欢迎加入CSDN订单平台！',
      lastMessageTime: '02-15',
      isOfficial: true
    },
    {
      id: 3,
      name: '某某科技有限公司',
      lastMessage: '项目进展如何？',
      lastMessageTime: '2026-01-27',
      unread: 0
    }
  ]);

  // 模拟消息列表（当前选中联系人的消息）
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderId: 1, // 对方发送
      content: `您好，关于订单「${orderTitle}」，我想和您沟通一下具体需求。`,
      timestamp: '10:30',
      type: 'text'
    },
    {
      id: 2,
      senderId: 0, // 我发送
      content: '您好，我已经看过订单详情了，请问有什么具体问题吗？',
      timestamp: '10:32',
      type: 'text'
    },
    {
      id: 3,
      senderId: 1,
      content: '项目的技术栈方面，您这边有什么建议吗？',
      timestamp: '10:35',
      type: 'text'
    }
  ]);

  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      senderId: 0, // 我发送
      content: messageInput,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedContactData = contacts.find(c => c.id === selectedContact);

  // 过滤联系人
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] w-full max-w-6xl h-[85vh] flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">消息中心</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--surface-hover)] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧联系人列表 */}
          <div className="w-80 border-r border-[var(--border-subtle)] flex flex-col bg-[var(--surface-hover)]">
            {/* 搜索框 */}
            <div className="p-4 border-b border-[var(--border-subtle)] bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索联系人"
                  className="w-full pl-10 pr-4 py-2 border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
            </div>

            {/* 联系人列表 */}
            <div className="flex-1 overflow-auto">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.id)}
                  className={`p-4 border-b border-[var(--border-subtle)] cursor-pointer transition-colors ${
                    selectedContact === contact.id
                      ? 'bg-white border-l-3 border-l-[var(--brand)]'
                      : 'hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* 头像 */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand)] to-[#FF9D7E] flex items-center justify-center text-white font-medium flex-shrink-0">
                      {contact.name.charAt(0)}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {contact.name}
                          </span>
                          {contact.isOfficial && (
                            <span className="px-2 py-0.5 bg-[var(--brand-subtle)] text-[var(--brand)] text-xs rounded">
                              官方
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">
                          {contact.lastMessageTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[var(--text-tertiary)] truncate flex-1">
                          {contact.lastMessage}
                        </p>
                        {contact.unread && contact.unread > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-[var(--brand)] text-white text-xs rounded-full flex-shrink-0">
                            {contact.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧聊天区域 */}
          <div className="flex-1 flex flex-col bg-white">
            {/* 聊天对象头部 */}
            <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    {selectedContactData?.name}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    订单：{orderTitle} (#{orderId})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-sm text-[var(--brand)] hover:underline">
                    查看订单详情
                  </button>
                </div>
              </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-auto p-6 bg-[var(--surface-hover)]">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[60%] ${
                        message.senderId === 0
                          ? 'bg-[var(--brand)] text-white'
                          : 'bg-white text-[var(--text-primary)] border border-[var(--border-subtle)]'
                      } rounded-lg px-4 py-2.5`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          message.senderId === 0 ? 'text-white/70' : 'text-[var(--text-tertiary)]'
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 输入区域 */}
            <div className="border-t border-[var(--border-subtle)] bg-white">
              {/* 工具栏 */}
              <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center gap-3">
                <button className="p-2 hover:bg-[var(--surface-hover)] rounded transition-colors" title="表情">
                  <Smile className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
                <button className="p-2 hover:bg-[var(--surface-hover)] rounded transition-colors" title="图片">
                  <Image className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
                <button className="p-2 hover:bg-[var(--surface-hover)] rounded transition-colors" title="附件">
                  <Paperclip className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
              </div>

              {/* 输入框 */}
              <div className="px-6 py-4">
                <div className="flex items-end gap-3">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="按下Enter发送内容"
                    rows={3}
                    className="flex-1 px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="px-6 py-3 bg-[var(--brand)] text-white rounded-lg text-sm hover:bg-[var(--brand-hover)] transition-colors disabled:bg-[var(--text-disabled)] disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>发送</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-2">
                  按下Enter发送内容 / 0/500
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}