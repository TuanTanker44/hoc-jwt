import "./ChatInput.css";
import { useState } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { FaceSmileIcon } from "@heroicons/react/24/outline";
import { Mic, StopCircle, Play } from "lucide-react";

const ChatInput = ({ onSendMessage }) => {
  const [input, setInput] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const addEmoji = (emoji) => {
    setInput(input + emoji.native);
    setShowPicker(false);
  };

  const handleChange = (e) => {
    let text = e.target.value;

    // Thay thế nhanh
    text = text.replace(/:D/g, "😀");
    text = text.replace(/:\(/g, "☹️");
    text = text.replace(/<3/g, "❤️");
    text = text.replace(/:\)/g, "🙂");
    text = text.replace(/:P/g, "😛");
    text = text.replace(/:o/g, "😮");
    text = text.replace(/:x/g, "😬");
    text = text.replace(/:v/g, "😏");
    text = text.replace(/:'\(/g, "😢");
    text = text.replace(/8\)/g, "😎");
    text = text.replace(/:s/g, "😓");
    text = text.replace(/:c/g, "😤");
    text = text.replace(/:z/g, "😩");
    text = text.replace(/:'\)/g, "🥲");
    text = text.replace(/:@/g, "😡");
    text = text.replace(/:3/g, "😗");
    text = text.replace(/xD/g, "😆");
    text = text.replace(/:putnam:/g, "🫡");
    text = text.replace(/:thinking:/g, "🤔");
    text = text.replace(/:shrug:/g, "🤷");
    text = text.replace(/:facepalm:/g, "🤦");
    text = text.replace(/:clap:/g, "👏");
    text = text.replace(/:pray:/g, "🙏");
    text = text.replace(/:muscle:/g, "💪");
    text = text.replace(/:ok_hand:/g, "👌");
    text = text.replace(/:thumbs_up:/g, "👍");
    text = text.replace(/\(Y\)/g, "👍");
    text = text.replace(/:thumbs_down:/g, "👎");
    text = text.replace(/\(N\)/g, "👎");
    text = text.replace(/:wave:/g, "👋");
    text = text.replace(/:poop:/g, "💩");
    text = text.replace(/:fire:/g, "🔥");
    text = text.replace(/:100:/g, "💯");
    text = text.replace(/:check:/g, "✔️");
    text = text.replace(/:cross:/g, "❌");
    text = text.replace(/:star:/g, "⭐");
    text = text.replace(/:zzz:/g, "💤");
    text = text.replace(/:money:/g, "💰");
    text = text.replace(/:gift:/g, "🎁");
    text = text.replace(/:tada:/g, "🎉");
    text = text.replace(/:balloon:/g, "🎈");
    text = text.replace(/:coffee:/g, "☕");
    text = text.replace(/:beer:/g, "🍺");
    text = text.replace(/:pizza:/g, "🍕");
    text = text.replace(/:cake:/g, "🍰");
    text = text.replace(/:dog:/g, "🐶");
    text = text.replace(/:cat:/g, "🐱");
    text = text.replace(/:heart:/g, "❤️");
    text = text.replace(/<\/3/g, "💔");

    setInput(text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    onSendMessage(input);
    setInput("");
  };
  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <div className="chat-input">
        <input
          className="chat-input-field"
          type="text"
          placeholder="Aa"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleChange(e);
          }}
        />
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="btn-emoji group"
        >
          <FaceSmileIcon className="text-[black] w-2/3 h-2/3 group-hover:text-[white]" />
        </button>
        {showPicker && (
          <div className="absolute top-[-450px] right-[0px] z-50">
            <Picker data={data} onEmojiSelect={addEmoji} />
          </div>
        )}
      </div>
      <button type="submit" className="btn-send" title="Nhấn Enter để gửi">
        Gửi
      </button>
    </form>
  );
};

export default ChatInput;
