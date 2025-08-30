/* eslint-disable no-unused-vars */
import socketIO from "socket.io-client";
import { useState, useEffect, useRef, useCallback } from "react";
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
  const accessToken = localStorage.getItem("accessToken");
  const { currentUser, getChatItems } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatName, setActiveChatName] = useState("");
  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);
  const socket = useRef(null);

  const handleActiveChange = (selectedChat, chatName, index) => {
    setActiveChat(selectedChat);
    setActiveChatName(chatName);
  };

  const handleSendMessage = async (text) => {
    setMessages([...messages, { message: text, fromMe: true }]);
    try {
      await axios.post(
        `http://localhost:5000/v1/message/chat/${activeChat.chatId}`,
        { message: text, senderId: currentUser._id },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
    // if (socket.current) {
    //   socket.current.emit("send_message", { text: text, fromMe: true });
    // }
  };

  const getChatName = useCallback(
    async (chatId) => {
      if (!currentUser) return "Đang tải...";
      try {
        const response = await axios.get(
          `http://localhost:5000/v1/chat/${chatId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        const isGroup = response.data.isGroup;
        return isGroup
          ? response.data.name
          : response.data.participants.find((p) => p._id !== currentUser._id)
              ?.name || "Ẩn danh";
      } catch (error) {
        console.error("Failed to fetch chat name:", error);
        return "Người dùng không khả dụng";
      }
    },
    [accessToken, currentUser],
  );

  // Fetch chatList khi currentUser thay đổi
  useEffect(() => {
    if (!currentUser) return;
    const fetchChatItems = async () => {
      try {
        const chatItems = await getChatItems();
        setChatList(chatItems);
        if (chatItems.length > 0) {
          const firstChat = chatItems[0];
          setActiveChat(firstChat);
          let name = firstChat.name || "";
          if (!name) {
            name = await getChatName(firstChat.chatId);
          }
          setActiveChatName(name);
        } else {
          setActiveChat(null);
          setActiveChatName("");
        }
      } catch (err) {
        console.error("Lỗi khi fetch chat items:", err);
      }
    };
    fetchChatItems();
  }, [currentUser, getChatItems, getChatName]);

  // Fetch messages khi activeChat thay đổi
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat || !activeChat.chatId) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/v1/message/chat/${activeChat.chatId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        // res.data is an array of Message objects
        setMessages(
          res.data.map((msg) => ({
            message: msg.message,
            fromMe: currentUser && msg.senderId === currentUser._id,
          })),
        );
      } catch (err) {
        console.error("Lỗi lấy messages:", err);
      }
    };
    fetchMessages();
  }, [activeChat, currentUser, accessToken]);

  return (
    <div className="messenger-container">
      {/* slidebar trái */}
      <div className="sidebar">
        <div className="sidebar-header">Đoạn chat</div>
        <div className="chat-list">
          <ChatList chatList={chatList} onActiveChange={handleActiveChange} />
        </div>
      </div>

      {/* khung chat */}
      <div className="chat-section">
        <ChatHeader chatHeader={activeChatName || "Đang tải..."} />
        <ChatMessages messages={messages} />
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export { Messenger };
