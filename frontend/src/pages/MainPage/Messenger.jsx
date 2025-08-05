import { User, Send, Search } from "lucide-react";
import { useState, useEffect } from "react";
import "./Messenger.css";
import ChatList from "../../components/Messenger/ChatItem/ChatList.jsx";
import ChatHeader from "../../components/Messenger/ChatHeader/ChatHeader.jsx";
import ChatMessages from "../../components/Messenger/ChatMessages/ChatMessages.jsx";
import ChatInput from "../../components/Messenger/ChatInput/ChatInput.jsx";

const Messenger = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([
    { text: "Hello! Bạn đang làm gì thế?", fromMe: false },
    { text: "Mình đang học HTML CSS 😄", fromMe: true },
    { text: "Wow, cố lên nhé!", fromMe: false },
  ]);

  useEffect(() => {
    fetch("http:localhost:8000/api/messages")
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, []);

  const handleSendMessage = (text) => {
    setMessages([...messages, { text: text, fromMe: true }]);
  };

  return (
    <div className="messenger-container">
      {/* slidebar trái */}
      <div className="sidebar">
        <div className="sidebar-header">Messenger</div>
        <div className="chat-list">
          <ChatList onActiveChange={(chat) => setActiveChat(chat)} />
        </div>
      </div>

      {/* khung chat */}
      <div className="chat-section">
        <ChatHeader chatHeader={activeChat?.chatName} />
        <ChatMessages messages={messages} />
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export { Messenger };
