import "./ChatMessages.css";
import { Message } from "./Message.jsx";

const ChatMessages = ({ messages }) => {
  return (
    <div className="chat-messages">
      {messages.map((msg, index) => (
        <Message key={index} content={msg.message} fromMe={msg.fromMe} />
      ))}
    </div>
  );
};

export default ChatMessages;
