import "./ChatMessages.css";

const Message = ({ content, fromMe }) => {
  return (
    <div className={`message ${fromMe ? "sent" : "received"}`}>{content}</div>
  );
};

export { Message };
