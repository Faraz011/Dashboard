// src/pages/dashboard/Chat.jsx
import { useEffect, useRef, useState } from "react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { api } from "../../../services/api";
import { useAuth } from "../../../hooks/useAuth";
import { listMyChats } from "../../../services/firestore";
import { MessageCircle, Send, Bot, User, Search, Sparkles, Clock, FileText } from "lucide-react";

export default function Chat() {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [suggestions] = useState([
    "What resources do I have available?",
    "Summarize my uploaded documents",
    "Help me find information about...",
    "What are the key insights in my data?"
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    (async () => {
      const history = await listMyChats(user.uid);
      const flat = history.flatMap((c) => [
        { role: "user", content: c.message },
        { role: "assistant", content: c.response, sources: c.sourceResources || [] },
      ]);
      setMessages(flat.reverse());
    })();
  }, [user.uid]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function send() {
    const text = msg.trim();
    if (!text || busy) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setMsg("");
    setBusy(true);
    try {
      const res = await api.post("/api/chat", { message: text, userId: user.uid });
      setMessages((m) => [...m, { role: "assistant", content: res.data.response, sources: res.data.sourceResources }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-teal-600" />
          <div>
            <div className="text-3xl font-bold text-slate-900">AI Chat</div>
            <div className="text-sm text-slate-600 mt-1">Get answers using semantic search over your knowledge base</div>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span className="font-medium">Semantic search enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">AI-powered responses</span>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Suggestions Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <div className="text-sm font-semibold text-slate-900">Quick Questions</div>
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setMsg(suggestion)}
                  className="w-full text-left p-3 text-sm text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200 border border-slate-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            {messages.length === 0 && (
              <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-teal-600" />
                  <div className="text-xs font-medium text-teal-800">Getting Started</div>
                </div>
                <div className="text-xs text-teal-700">
                  Ask me anything about your uploaded documents. I'll search through your knowledge base to provide relevant answers with source citations.
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <Card className="p-0 overflow-hidden">
            <div className="h-[70vh] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-slate-50">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                    <MessageCircle className="w-8 h-8 text-teal-600" />
                  </div>
                  <div className="text-lg font-semibold text-slate-900 mb-2">Start a conversation</div>
                  <div className="text-sm text-slate-500 mb-6">Ask a question about your uploaded documents</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.slice(0, 2).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setMsg(suggestion)}
                        className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-start gap-3 max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      m.role === "user" ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`${
                      m.role === "user" 
                        ? "bg-teal-600 text-white rounded-2xl rounded-br-sm" 
                        : "bg-white border border-slate-200 text-slate-900 rounded-2xl rounded-bl-sm shadow-sm"
                    } px-4 py-3 text-sm`}>
                      <div className="whitespace-pre-wrap">{m.content}</div>
                      {m.sources?.length ? (
                        <div className={`mt-3 pt-3 border-t ${
                          m.role === "user" ? "border-teal-500" : "border-slate-200"
                        }`}>
                          <div className={`text-xs font-medium mb-2 ${
                            m.role === "user" ? "text-teal-100" : "text-slate-600"
                          }`}>
                            <FileText className="w-3 h-3 inline mr-1" />
                            Sources:
                          </div>
                          <div className={`text-xs ${
                            m.role === "user" ? "text-teal-100" : "text-slate-500"
                          }`}>
                            {m.sources.join(", ")}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              
              {busy && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="border-t border-slate-200 p-4 bg-white">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input 
                    value={msg} 
                    onChange={(e) => setMsg(e.target.value)} 
                    placeholder="Ask about your documents..." 
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                    className="w-full"
                  />
                </div>
                <Button 
                  onClick={send} 
                  disabled={busy || !msg.trim()}
                  className="px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>Press Enter to send, Shift+Enter for new line</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
