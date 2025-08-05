import "./ChatMessages.css";
import { Message } from "./Massage.jsx";

const ChatMessages = ({ messages }) => {
  return (
    <div className="chat-messages">
      {messages.map((msg, index) => (
        <Message key={index} content={msg.text} fromMe={msg.fromMe} />
      ))}
    </div>
  );
};

export default ChatMessages;
