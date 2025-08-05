import "./ChatInput.css";
import { useState } from "react";

const ChatInput = ({ onSendMessage }) => {
  const [input, setInput] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    onSendMessage(input);
    setInput("");
  };
  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Aa"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button type="submit">Gửi</button>
    </form>
  );
};

export default ChatInput;
