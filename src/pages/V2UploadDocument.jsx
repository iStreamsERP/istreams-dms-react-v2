import React, { useState } from "react";
import axios from "axios";

const V2UploadDocument = () => {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [predefinedAnswers, setPredefinedAnswers] = useState([]);

  const predefinedQuestions = [
    "translate to english",
    "What type of document is this?,This document send by Whom?,Is there any validity for this document?",
    "This document addressed to whom",
    "is there any penalties involved on this",
    "is there any submission date is mentioned",
  ];

  const askQuestion = async (q, isPredefined = false) => {
    if (!file || !q) return;

    const formData = new FormData();
    formData.append("File", file);
    formData.append("Question", q);

    if (!isPredefined) {
      setChatHistory((prev) => [...prev, { type: "question", message: q }]);
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "https://apps.istreams-erp.com:4491/api/OpenAI/ask-from-file",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (isPredefined) {
        setPredefinedAnswers((prev) => [
          ...prev,
          { question: q, answer: res.data },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { type: "answer", message: res.data },
        ]);
      }
    } catch (err) {
      const errMsg = err.response?.data
        ? JSON.stringify(err.response.data, null, 2)
        : err.message;

      if (isPredefined) {
        setPredefinedAnswers((prev) => [
          ...prev,
          { question: q, answer: `${errMsg}` },
        ]);
      } else {
        setChatHistory((prev) => [...prev, { type: "error", message: errMsg }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a file first.");
      return;
    }

    setChatHistory([]);
    setPredefinedAnswers([]);
    setLoading(true);

    for (const q of predefinedQuestions) {
      await askQuestion(q, true);
    }

    setChatHistory([
      {
        type: "info",
        message: " Document analyzed. You can now ask more questions.",
      },
    ]);
    setLoading(false);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!question) return;
    await askQuestion(question, false);
    setQuestion("");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eef2f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "1200px",
          height: "90vh",
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Left Predefined Answer Summary */}
        <div
          style={{
            flex: 1.2,
            padding: "20px",
            overflowY: "auto",
            borderRight: "1px solid #ddd",
          }}
        >
          <h3> Document Summary</h3>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.xlsx,.json,.txt"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setPredefinedAnswers([]);
              setChatHistory([]);
            }}
            style={{ marginTop: "10px", marginBottom: "10px" }}
          />
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            style={{
              padding: "10px 20px",
              marginBottom: "20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          {predefinedAnswers.length > 0 && (
            <div>
              {predefinedAnswers.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: "15px",
                    padding: "10px",
                    background: "#f0f0f0",
                    borderRadius: "8px",
                  }}
                >
                  <strong> {item.question}</strong>
                  <div style={{ marginTop: "5px", whiteSpace: "pre-wrap" }}>
                    {item.answer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Chat Area */}
        <div
          style={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            padding: "20px",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            💬 Chat Assistant
          </h2>

          {/* Chat History */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "15px",
              backgroundColor: "#f9f9f9",
            }}
          >
            {chatHistory.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection:
                    item.type === "question" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  marginBottom: "15px",
                }}
              >
                <div style={{ fontSize: "20px", margin: "0 10px" }}>
                  {item.type === "question"}
                  {item.type === "answer"}
                  {item.type === "info"}
                  {item.type === "error"}
                </div>
                <div
                  style={{
                    backgroundColor:
                      item.type === "question"
                        ? "#007bff"
                        : item.type === "answer"
                        ? "#f1f0f0"
                        : item.type === "error"
                        ? "#ffe6e6"
                        : "#d9edf7",
                    color: item.type === "question" ? "#fff" : "#000",
                    padding: "10px 15px",
                    borderRadius: "15px",
                    maxWidth: "75%",
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                  }}
                >
                  {item.message}
                </div>
              </div>
            ))}
          </div>

          {/* Manual Question Input */}
          <form
            onSubmit={handleManualSubmit}
            style={{ display: "flex", gap: "10px" }}
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a follow-up question..."
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
            <button
              type="submit"
              disabled={loading || !file}
              style={{
                padding: "12px 20px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {loading ? "sending.." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default V2UploadDocument;
