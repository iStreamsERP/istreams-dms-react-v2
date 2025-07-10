// components/ChatInterface.jsx
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function ChatInterface({
  messages,
  isResponseLoading,
  askQuestion,
}) {
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    askQuestion(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }

    // Smooth scroll to new messages
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isResponseLoading]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages container with constrained height */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-800"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="mb-4 w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center">
              <div className="text-cyan-500 dark:text-cyan-400 w-8 h-8" />
            </div>
            <h4 className="text-xl font-medium mb-2">How can I help you?</h4>
            <p className="text-cyan-600 dark:text-cyan-100 max-w-md text-center">
              Ask about your document, I can analyze its content, structure, or
              suggestions for your questions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            {isResponseLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 flex items-center gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce [animation-delay:0.2s]">
                    .
                  </span>
                  <span className="animate-bounce [animation-delay:0.4s]">
                    .
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input area at the bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your document..."
            className="flex-1 min-h-[3.75rem] max-h-32 overflow-auto"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isResponseLoading}
            className="p-3 h-auto self-end"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const Message = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-br-none"
            : "bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-bl-none shadow-sm border border-gray-200 dark:border-slate-700"
        }`}
      >
        <p className="break-words whitespace-pre-wrap">{message.text}</p>
        <div
          className={`text-xs mt-1 ${
            isUser ? "text-cyan-200" : "text-gray-500 dark:text-slate-400"
          }`}
        >
          {message.timestamp}
        </div>
      </div>
    </motion.div>
  );
};
