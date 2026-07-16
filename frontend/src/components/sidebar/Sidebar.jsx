import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';

const Sidebar = ({ selectedConversation, setSelectedConversation }) => {
  const { user, logout } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
  const { onlineUsers } = useContext(SocketContext);
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/conversations', {
          withCredentials: true,
        });
        setConversations(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    getConversations();
  }, []);


  useEffect(() => {
  if (!socket) return;

  socket.on('receiveMessage', (message) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === message.conversationId
          ? { ...conv, lastMessage: message }
          : conv
      )
    );
  });

  return () => {
    socket.off('receiveMessage');
  };
}, [socket]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/search?username=${search}`,
        { withCredentials: true }
      );
      setSearchResults(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (userId) => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/conversations',
        { receiverId: userId },
        { withCredentials: true }
      );
      setSelectedConversation(res.data);
      setSearch('');
      setSearchResults([]);
      if (!conversations.find((c) => c._id === res.data._id)) {
        setConversations([res.data, ...conversations]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/users/logout',
        {},
        { withCredentials: true }
      );
      logout();
    } catch (error) {
      console.error(error);
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find((p) => p._id !== user._id);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-user">
          <div className="avatar">{user?.username[0].toUpperCase()}</div>
          <span>{user?.username}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Go</button>
      </form>

      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((u) => (
            <div
              key={u._id}
              className="search-result-item"
              onClick={() => handleSelectUser(u._id)}
            >
              <div className="avatar">{u.username[0].toUpperCase()}</div>
              <span>{u.username}</span>
            </div>
          ))}
        </div>
      )}

      <div className="conversations-list">
        {conversations.map((conv) => {
          const other = getOtherParticipant(conv);
          const isOnline = onlineUsers.includes(other?._id);
          return (
            <div
              key={conv._id}
              className={`conversation-item ${selectedConversation?._id === conv._id ? 'active' : ''}`}
              onClick={() => setSelectedConversation(conv)}
            >
              <div className="avatar-wrapper">
                <div className="avatar">{other?.username[0].toUpperCase()}</div>
                {isOnline && <span className="online-dot" />}
              </div>
              <div className="conv-info">
                <span className="conv-username">{other?.username}</span>
                <span className="conv-last-message">
                  {conv.lastMessage?.content || 'Start a conversation'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;