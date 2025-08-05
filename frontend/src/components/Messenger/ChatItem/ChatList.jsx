import "./ChatList.css";
import React, { useState } from "react";
import ChatItem from "./ChatItem.jsx";

const ChatList = ({ onActiveChange }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const chatList = [
    {
      chatName: "Nguyễn Văn A",
      chatPreview: "Hello! Bạn đang làm gì thế?",
    },
    {
      chatName: "Trần Thị B",
      chatPreview: "Mình đang học HTML CSS 😄",
    },
    {
      chatName: "Lê Văn C",
      chatPreview: "Wow, cố lên nhé!",
    },
  ];

  // Khi đổi active, gọi callback để báo cho cha
  const handleActive = (idx) => {
    setActiveIndex(idx);
    if (onActiveChange) onActiveChange(chatList[idx], idx);
  };

  // Gọi handleActive(0) khi component mount
  React.useEffect(() => {
    handleActive(0);
    // eslint-disable-next-line
  }, []);
  return (
    <div className="chat-list">
      {chatList.map((chat, idx) => (
        <ChatItem
          key={chat.chatName}
          chatName={chat.chatName}
          chatPreview={chat.chatPreview}
          isActive={activeIndex === idx}
          onClick={() => handleActive(idx)}
        />
      ))}
    </div>
  );
};

export default ChatList;
