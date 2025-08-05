import "./ChatHeader.css";

const ChatHeader = ({ chatHeader }) => {
  return (
    <div className="chat-header">
      <span className="chat-title">{chatHeader}</span>
    </div>
  );
};

export default ChatHeader;
