/* eslint-disable no-unused-vars */
import { User, Send, Search } from "lucide-react";
import socketIO from "socket.io-client";
import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth.js";
import useAxios from "../../hooks/useAxios.js";
import "./Messenger.css";
import ChatList from "../../components/Messenger/ChatItem/ChatList.jsx";
import ChatHeader from "../../components/Messenger/ChatHeader/ChatHeader.jsx";
import ChatMessages from "../../components/Messenger/ChatMessages/ChatMessages.jsx";
import ChatInput from "../../components/Messenger/ChatInput/ChatInput.jsx";

const Messenger = () => {
  const axiosInstance = useAxios();

  const { currentUser, getChatItems } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);
  const socket = useRef(null);

  // Lấy chatItems khi currentUser thay đổi
  useEffect(() => {
    if (currentUser == null) return console.warn("No current user found");
    const fetchChatItems = async () => {
      const chatItems = await getChatItems();
      setChatList(chatItems);
      if (chatItems.length > 0) {
        setActiveChat(chatItems[0]);
      } else {
        setActiveChat(null);
      }
    };
    fetchChatItems();
  }, [currentUser, getChatItems]);

  // Fetch messages khi activeChat thay đổi
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat || !activeChat.chatId) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/v1/message/${activeChat.chatId}`,
        );
        // res.data is an array of Message objects
        const reversed = res.data.reverse();
        setMessages(
          reversed.map((msg, index) => ({
            key: index,
            message: msg.message,
            fromMe: currentUser && msg.senderId === currentUser._id,
          })),
        );
      } catch (err) {
        console.error("Lỗi lấy messages:", err);
      }
    };
    fetchMessages();
  }, [activeChat, currentUser]);

  const handleSendMessage = (text) => {
    setMessages([...messages, { text: text, fromMe: true }]);
    // if (socket.current) {
    //   socket.current.emit("send_message", { text: text, fromMe: true });
    // }
  };

  return (
    <div className="messenger-container">
      {/* slidebar trái */}
      <div className="sidebar">
        <div className="sidebar-header">Messenger</div>
        <div className="chat-list">
          <ChatList
            chatList={chatList}
            onActiveChange={(chat) => setActiveChat(chat)}
          />
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
