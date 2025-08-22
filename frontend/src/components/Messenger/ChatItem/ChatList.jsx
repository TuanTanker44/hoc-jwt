import PropTypes from "prop-types";
import "./ChatList.css";
import React, { useState, useCallback, useEffect } from "react";
import ChatItem from "./ChatItem.jsx";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth.js";

const ChatList = ({ chatList, onActiveChange }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { accessToken, currentUser } = useAuth();
  const [chatNames, setChatNames] = useState({});
  const [lastMessages, setLastMessages] = useState({});

  const handleActive = useCallback(
    (idx) => {
      setActiveIndex(idx);
      if (onActiveChange) onActiveChange(chatList[idx], idx);
    },
    [onActiveChange, chatList],
  );

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
        ? response.data.name
        : response.data.participants.find((p) => p._id !== currentUser._id)
            .name;
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
      return response.data.message;
    } catch (error) {
      console.error("Failed to fetch last message:", error);
      return "";
    }
  };

  // Gọi handleActive(0) khi component mount
  useEffect(() => {
    handleActive(0);
  }, [handleActive]);

  useEffect(() => {
    chatList.forEach(async (chat) => {
      const name = await getChatName(chat.chatId);
      setChatNames((prev) => ({ ...prev, [chat.chatId]: name }));

      const lastMsg = await getLastMessage(chat.lastMessage);
      setLastMessages((prev) => ({ ...prev, [chat.chatId]: lastMsg }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatList, accessToken]);
  return (
    <div className="chat-list">
      {chatList.map((chat, idx) => (
        <ChatItem
          key={idx}
          chatName={chatNames[chat.chatId] || "Đang tải..."}
          chatPreview={lastMessages[chat.chatId] || ""}
          isActive={activeIndex === idx}
          onClick={() => handleActive(idx)}
        />
      ))}
    </div>
  );
};

ChatList.propTypes = {
  chatList: PropTypes.array.isRequired,
};

export default ChatList;
