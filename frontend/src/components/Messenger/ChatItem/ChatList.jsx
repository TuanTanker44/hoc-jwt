import PropTypes from "prop-types";
import "./ChatList.css";
import React, { useState, useEffect } from "react";
import ChatItem from "./ChatItem.jsx";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth.js";

const ChatList = ({ chatList, onActiveChange }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const accessToken = localStorage.getItem("accessToken");
  const { currentUser } = useAuth();
  const [chatNames, setChatNames] = useState({});
  const [lastMessages, setLastMessages] = useState({});

  const handleActiveChat = (index) => {
    setActiveIndex(index);
    const clickedChat = chatList[index];
    if (!clickedChat) return;
    const chatName = chatNames[clickedChat.chatId]?.trim() || "Đang tải...";
    onActiveChange?.(clickedChat, chatName, index);
  };

  const getChatName = async (chatId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/v1/chat/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const isGroup = response.data.isGroup;
      const chatName = isGroup
        ? response.data.name ||
          response.data.participants.map((element) => element.name).join(", ")
        : response.data.participants.find(
            (p) => String(p._id) !== String(currentUser._id),
          )?.name;
      return chatName;
    } catch (error) {
      console.error("Failed to fetch chat name:", error);
      return "Người dùng không khả dụng";
    }
  };

  const getLastMessage = async (messageId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/v1/message/${messageId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch last message:", error);
      return "Chưa có tin nhắn nào";
    }
  };

  // Gọi handleActive(0) khi component mount
  useEffect(() => {
    handleActiveChat(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!chatList || chatList.length === 0) return;

    const fetchData = async () => {
      const names = {};
      const messages = {};

      await Promise.all(
        chatList.map(async (chat) => {
          const name =
            (await getChatName(chat.chatId)) || "Người dùng không khả dụng";
          const lastMsg = await getLastMessage(chat.lastMessage);
          names[chat.chatId] = name;
          if (lastMsg && lastMsg.senderId === currentUser._id) {
            messages[chat.chatId] = `Bạn: ${lastMsg.message}`;
          } else if (lastMsg && lastMsg.message) {
            messages[chat.chatId] = lastMsg.message;
          } else {
            messages[chat.chatId] = "Chưa có tin nhắn nào";
          }
        }),
      );

      setChatNames(names);
      setLastMessages(messages);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatList, accessToken]);
  return (
    <div className="chat-list">
      {chatList.map((chat, idx) => (
        <ChatItem
          key={idx}
          chatName={chatNames[chat.chatId] || "Đang tải..."}
          chatPreview={lastMessages[chat.chatId] || "Đang tải..."}
          isActive={activeIndex === idx}
          onClick={() => handleActiveChat(idx)}
        />
      ))}
    </div>
  );
};

ChatList.propTypes = {
  chatList: PropTypes.array.isRequired,
};

export default ChatList;
