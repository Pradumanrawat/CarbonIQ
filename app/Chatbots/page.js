

"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ChatPage.css";
import Link from "next/link";

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "Hello! I'm CarbonIQ, your AI-powered sustainability assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log("🟢 Loaded user from localStorage:", parsedUser);
      setUser(parsedUser);
    } else {
      console.warn("⚠️ No user found in localStorage!");
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!user) {
      console.warn("⚠️ No user loaded. Cannot send message.");
      return;
    }

    const role = user.role || user.type || "general user"; // ✅ Safe fallback
    console.log("📤 Sending role to backend:", role);

    // Add user message
    const userMessage = {
      sender: "User",
      text: input,
      initializer: user.name ? user.name.charAt(0).toUpperCase() : "U",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // ✅ Send role properly to backend
      const { data } = await axios.post("/api/Chat", {
        message: input,
        role: role,
      });

      console.log("🟢 Backend response:", data);

      const aiText = data.output || data.message || "Sorry, something went wrong.";

      // Split multi-line outputs into separate messages
      const aiMessages = aiText
        .split("\n")
        .filter(Boolean)
        .map((line) => ({ sender: "AI", text: line }));

      setMessages((prev) => [...prev, ...aiMessages]);
    } catch (err) {
      console.error("❌ Chat API Error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="logo-section">
          <Link href="/" className="logo-text">
            CarbonIQ
          </Link>
        </div>
      </header>

      <main className="chat-main">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${
                msg.sender === "AI"
                  ? "ai-message"
                  : msg.sender === "MM"
                  ? "mm-message"
                  : "user-message"
              }`}
            >
              <div className="avatar">
                {msg.sender === "AI"
                  ? "AI"
                  : msg.sender === "MM"
                  ? "MM"
                  : msg.initializer || "U"}
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}

          {loading && (
            <div className="chat-message ai-message">
              <div className="avatar">AI</div>
              <div className="message-text">Typing...</div>
            </div>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <button onClick={handleSend} className="send-btn" disabled={loading}>
            ➤
          </button>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
