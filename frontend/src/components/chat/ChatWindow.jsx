import { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';

const ChatWindow = ({ selectedConversation }) => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedConversation) return;

    const getMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${selectedConversation._id}`,
          { withCredentials: true }
        );
        setMessages(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    getMessages();
  }, [selectedConversation]);

  useEffect(() => {
    if (!socket || !selectedConversation) return;

    socket.emit('joinConversation', selectedConversation._id);

    const handleReceiveMessage = (message) => {
      if (message.sender._id !== user._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket, selectedConversation, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
  if (!newMessage.trim()) return;

  try {
    const res = await axios.post(
      'http://localhost:5000/api/messages',
      {
        conversationId: selectedConversation._id,
        content: newMessage,
      },
      { withCredentials: true }
    );
    setMessages((prev) => [...prev, res.data]);
    setNewMessage('');
  
    socket.emit('sendMessage', res.data);
  } catch (error) {
    console.error(error);
  }
};

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const getOtherParticipant = () => {
    return selectedConversation?.participants.find((p) => p._id !== user._id);
  };

  if (!selectedConversation) {
    return (
      <div className="chat-window empty">
        <div className="empty-chat">
          <h3>Welcome to Chat App</h3>
          <p>Select a conversation or search for a user to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="avatar">{getOtherParticipant()?.username[0].toUpperCase()}</div>
        <span>{getOtherParticipant()?.username}</span>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message ${msg.sender._id === user._id ? 'sent' : 'received'}`}
          >
            <p>{msg.content}</p>
            <span className="message-time">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;