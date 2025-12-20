// src/pages/dashboard/Chat.jsx
import { useEffect, useRef, useState } from "react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { api } from "../../../services/api";
import { useAuth } from "../../../hooks/useAuth";
import { listMyChats } from "../../../services/firestore";

export default function Chat() {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
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
    <div>
      <div className="text-2xl font-bold text-slate-900">Chat</div>
      <div className="mt-1 text-sm text-slate-500">Answers use semantic search over stored chunks.</div>

      <Card className="mt-6 p-0 overflow-hidden">
        <div className="h-[60vh] overflow-y-auto p-5 space-y-3 bg-white">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`${m.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-900"} max-w-[80%] rounded-2xl px-4 py-3 text-sm`}>
                <div>{m.content}</div>
                {m.sources?.length ? (
                  <div className={`mt-2 text-xs ${m.role === "user" ? "text-indigo-100" : "text-slate-500"}`}>
                    Sources: {m.sources.join(", ")}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {busy && <div className="text-sm text-slate-500">Thinking...</div>}
          <div ref={endRef} />
        </div>

        <div className="border-t border-slate-200 p-4 flex gap-3">
          <Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Ask something..." onKeyDown={(e) => e.key === "Enter" && send()} />
          <Button onClick={send} disabled={busy}>Send</Button>
        </div>
      </Card>
    </div>
  );
}
