/* eslint-disable no-unused-vars */
import {
  PencilSquareIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid"; //icons
import { useState, useEffect, useCallback, useRef } from "react";
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
  const messagesEndRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isNewChatPopupOpen, setIsNewChatPopupOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [newChatUser, setNewChatUser] = useState("");
  const [activeToggle, setActiveToggle] = useState("user");
  const [members, setMembers] = useState([
    currentUser?.name ? currentUser.name : [],
  ]); // members chứa tên user
  const [usernameMembers, setUsernameMembers] = useState([
    currentUser?.username ? currentUser.username : [],
  ]);

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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: isInitialLoad ? "auto" : "smooth",
      });
      setIsInitialLoad(false); // sau lần đầu thì về false để các lần sau cuộn mượt
    }
  }, [messages, isInitialLoad]);

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
        setIsInitialLoad(true);
      } catch (err) {
        console.error("Lỗi lấy messages:", err);
      }
    };
    fetchMessages();
  }, [activeChat, currentUser, accessToken]);

  const handleCreateNewChatItem = async () => {
    if (activeToggle === "user") {
      let usernames = [...usernameMembers];
      if (newChatUser.trim()) {
        const getUserByUsernameResponse = await axios.get(
          `http://localhost:5000/v1/user/${newChatUser.trim()}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        usernames.push(getUserByUsernameResponse.data.username);
        setUsernameMembers(usernames);
      }
      try {
        const userIds = await Promise.all(
          usernames.map(async (username) => {
            const res = await axios.get(
              `http://localhost:5000/v1/user/${username}`,
              { headers: { Authorization: `Bearer ${accessToken}` } },
            );
            if (res.status !== 200) {
              throw new Error("User not found");
            }
            return res.data._id;
          }),
        );

        // Tạo phòng
        const createChatResponse = await axios.post(
          "http://localhost:5000/v1/chat/create",
          {
            isGroup: false,
            name: newChatName,
            participants: userIds,
          },
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );

        // Tạo chat item
        await axios.patch(
          "http://localhost:5000/v1/user/createNewChatItem",
          { userIds: userIds, roomId: createChatResponse.data._id },
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
      } catch (error) {
        console.error("Failed to create new chat/conversation:", error);
      }
    } else {
      if (members.length === 1) {
        alert("Vui lòng thêm ít nhất một thành viên.");
        return;
      }
      // Đổi username sang userId
      try {
        const userIds = await Promise.all(
          usernameMembers.map(async (username) => {
            const res = await axios.get(
              `http://localhost:5000/v1/user/${username}`,
              { headers: { Authorization: `Bearer ${accessToken}` } },
            );
            if (res.status !== 200) {
              throw new Error("User not found");
            }
            return res.data._id;
          }),
        );

        // Tạo phòng
        const createChatResponse = await axios.post(
          "http://localhost:5000/v1/chat/create",
          {
            isGroup: (activeToggle === "group" && members.length > 2) || false,
            name: newChatName,
            participants: userIds,
          },
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );

        // Tạo chat item
        await axios.patch(
          "http://localhost:5000/v1/user/createNewChatItem",
          { userIds: userIds, roomId: createChatResponse.data._id },
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
      } catch (error) {
        console.error("Failed to create new chat/conversation:", error);
      }
    }
  };

  return (
    <div className="messenger-container">
      {/* slidebar trái */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">
            <span className="text-[30px]">Đoạn chat</span>
            <div style={{ width: "40px", height: "40px" }}></div>
            <button
              className="btn-new-chat"
              title="Đoạn chat mới"
              onClick={() => {
                setIsNewChatPopupOpen(true);
                setActiveToggle("user");
                setNewChatUser("");
                setNewChatName("");
                setMembers([currentUser?.name ? currentUser.name : []]);
                setUsernameMembers(
                  currentUser?.username ? [currentUser.username] : [],
                );
              }}
            >
              <PencilSquareIcon style={{ width: "24px", height: "24px" }} />
            </button>
            {isNewChatPopupOpen && (
              <div
                className="new-chat-popup-overlay"
                onClick={setIsNewChatPopupOpen(false)}
              >
                <div
                  className="toggle-container"
                  onClick={(e) => e.stopPropagation()} // ngăn đóng khi click bên trong
                >
                  <div className="new-chat-popup-content">
                    <div className="toggle-selection">
                      <button
                        className={`toggle-option${activeToggle === "user" ? " active" : ""}`}
                        onClick={() => {
                          setActiveToggle("user");
                          setNewChatUser("");
                          setNewChatName("");
                          setMembers([
                            currentUser?.name ? currentUser.name : [],
                          ]);
                          setUsernameMembers(
                            currentUser?.username ? [currentUser.username] : [],
                          );
                        }}
                      >
                        User
                      </button>
                      <button
                        className={`toggle-option${activeToggle === "group" ? " active" : ""}`}
                        onClick={() => {
                          setActiveToggle("group");
                          setNewChatUser("");
                          setNewChatName("");
                          setMembers([
                            currentUser?.name ? currentUser.name : [],
                          ]);
                          setUsernameMembers(
                            currentUser?.username ? [currentUser.username] : [],
                          );
                        }}
                      >
                        Group
                      </button>
                    </div>
                    <div
                      className={`toggle${activeToggle === "user" ? " active" : ""}`}
                    >
                      <form className="flex flex-col gap-y-[15px]">
                        <label htmlFor="new-chat-user">Tên người dùng</label>
                        <input
                          className="border-[2px] border-[#0866FF] pl-[10px] pt-[5px] pb-[5px] placeholder:italic placeholder:font-[400]"
                          type="text"
                          id="new-chat-user"
                          value={newChatUser}
                          onChange={(e) => setNewChatUser(e.target.value)}
                          placeholder="Nhập tên người dùng"
                        />
                      </form>
                    </div>
                    <div
                      className={`toggle${activeToggle === "group" ? " active" : ""}`}
                    >
                      <form className="flex flex-col gap-y-[15px]">
                        <label htmlFor="new-chat-name">Tên đoạn chat</label>
                        <input
                          className="border-[2px] border-[#0866FF] pl-[10px] pt-[5px] pb-[5px] placeholder:italic placeholder:font-[400]"
                          type="text"
                          id="new-chat-name"
                          value={newChatName}
                          onChange={(e) => setNewChatName(e.target.value)}
                          placeholder="Nhập tên đoạn chat (tùy chọn)"
                        />
                        <label htmlFor="new-chat-user">Thêm người dùng</label>
                        <input
                          className="border-[2px] border-[#0866FF] pl-[10px] pt-[5px] pb-[5px] placeholder:italic placeholder:font-[400]"
                          type="text"
                          id="new-chat-user"
                          value={newChatUser}
                          onChange={(e) => setNewChatUser(e.target.value)}
                          placeholder="Nhập tên người dùng"
                        />
                        <button
                          type="button"
                          className="bg-[#0866FF] hover:bg-[#0866FF] hover:text-[white] width-[100px] h-[30px] rounded-[20px]"
                          onClick={async () => {
                            if (newChatUser.trim()) {
                              //get user id by username
                              const getUserByUsernameResponse = await axios.get(
                                `http://localhost:5000/v1/user/${newChatUser.trim()}`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                  },
                                },
                              );
                              setMembers((prev) => [
                                ...prev,
                                getUserByUsernameResponse.data.name,
                              ]);
                              setUsernameMembers((prev) => [
                                ...prev,
                                getUserByUsernameResponse.data.username,
                              ]);
                              setNewChatUser("");
                            }
                          }}
                        >
                          Thêm
                        </button>
                        <p>Thành viên</p>
                        <div className="member-container border-[2px] border-[#0866FF] pl-[10px] pt-[5px] pb-[5px] min-h-[40px] max-h-[100px] overflow-y-auto">
                          {members.length === 1 ? (
                            <div className="font-[400] text-[#fd6b6b] ">
                              {members[0]}
                            </div>
                          ) : (
                            members.map((member, index) => (
                              <div
                                key={index}
                                className="font-[400] text-[#fd6b6b] "
                              >
                                {member}
                              </div>
                            ))
                          )}
                        </div>
                      </form>
                    </div>
                    <div className="button-container mt-[5px]">
                      <button
                        onClick={() => {
                          setIsNewChatPopupOpen(false)();
                        }}
                        className="btn-close-new-chat-popup hover:bg-[#ff0000]"
                      >
                        Đóng
                      </button>
                      <button
                        onClick={() => {
                          handleCreateNewChatItem();
                          setIsNewChatPopupOpen(false)();
                        }}
                        className="btn-create-new-chat hover:bg-[#00b442]"
                      >
                        Tạo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
        <div className="chat-messages-wrapper">
          <ChatMessages messages={messages} />
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export { Messenger };
