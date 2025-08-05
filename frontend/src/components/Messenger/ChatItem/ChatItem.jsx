import "./ChatList.css";

const ChatItem = ({ chatName, chatPreview, isActive, onClick }) => {
  return (
    <div className={`chat-item${isActive ? " active" : ""}`} onClick={onClick}>
      <div className="chat-name">{chatName}</div>
      <div className="chat-preview">{chatPreview}</div>
    </div>
  );
};

export default ChatItem;
