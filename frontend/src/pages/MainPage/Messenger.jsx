/* eslint-disable no-unused-vars */
import {
  PencilSquareIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth.js";
import useAxios from "../../hooks/useAxios.js";
import "./Messenger.css";
import ChatList from "../../components/Messenger/ChatItem/ChatList.jsx";
import ChatHeader from "../../components/Messenger/ChatHeader/ChatHeader.jsx";
import ChatMessages from "../../components/Messenger/ChatMessages/ChatMessages.jsx";
import ChatInput from "../../components/Messenger/ChatInput/ChatInput.jsx";
import socket from "../../socket/socket.js";

const Messenger = () => {
  const axiosInstance = useAxios();
  const accessToken = localStorage.getItem("accessToken");
  const { currentUser, getChatItems } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatName, setActiveChatName] = useState("");
  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);

  const handleActiveChange = (selectedChat, chatName) => {
    setActiveChat(selectedChat);
    setActiveChatName(chatName);
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });
  }, []);

  useEffect(() => {
    if (activeChat?.chatId) {
      socket.emit("join-room", activeChat.chatId);
      console.log("Emit join-room:", activeChat.chatId);
    }

    const handleMessage = (msg) => {
      if (msg.chatId === activeChat?.chatId) {
        setMessages((prev) => [
          ...prev,
          {
            message: msg.message,
            fromMe: msg.senderId === currentUser._id,
          },
        ]);
      }
    };

    socket.on("chat-message", handleMessage);

    return () => {
      socket.off("chat-message", handleMessage); // 👈 cleanup
    };
  }, [activeChat, currentUser]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    socket.emit("chat-message", {
      chatId: activeChat.chatId,
      senderId: currentUser._id,
      message: text,
    });

    try {
      const res = await axios.post(
        `http://localhost:5000/v1/message/chat/${activeChat.chatId}`,
        { message: text, senderId: currentUser._id },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const newMessage = res.data;
      // Cập nhật lastMessage cho chatItem tương ứng
      setChatList((prevChatList) =>
        prevChatList.map((item) =>
          item._id === activeChat._id
            ? { ...item, lastMessage: newMessage._id }
            : item,
        ),
      );
      // Gọi API PATCH để cập nhật lastMessage trong DB
      await axios.patch(
        `http://localhost:5000/v1/user/alterLastMessageWithChatId/${activeChat.chatId}`,
        { chatId: activeChat.chatId, lastMessage: newMessage._id },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
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
        <div className="sidebar-header">
          <div className="sidebar-title">
            <span className="text-[30px]">Đoạn chat</span>
            <div style={{ width: "40px", height: "40px" }}></div>
            <button className="btn-new-chat" title="Đoạn chat mới">
              <PencilSquareIcon style={{ width: "24px", height: "24px" }} />
            </button>
          </div>
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-[5px] top-[60%] -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none w-[30px] h-[30px]" />
            <input
              type="text"
              className="pl-10 mt-[10px] bg-[#E5E7EB] rounded-[20px] placeholder:text-[#B0B3B8] placeholder:italic placeholder:font-[500] h-[35px] font-[500] text-[20px] w-full pl-[40px]"
              placeholder="Tìm kiếm đoạn chat..."
            />
          </div>
        </div>
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
