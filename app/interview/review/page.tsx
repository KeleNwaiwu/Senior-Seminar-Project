
"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface SavedMessage {
  role: "user" | "system" | "assistant" | string;
  content: string;
  timestamp?: string;
}

interface PastInterview {
  id: string;
  userName?: string;
  timestamp?: string;
  messages?: SavedMessage[];
  feedback?: { score?: number; notes?: string };
}

const InterviewReview = () => {
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [interview, setInterview] = useState<PastInterview | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const search = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const id = search.get("id");
    if (id) {
      const storedPast = localStorage.getItem("pastInterviews");
      if (storedPast) {
        try {
          const arr = JSON.parse(storedPast);
          const found = arr.find((x: any) => x.id === id);
          if (found) {
            setInterview(found);
            setMessages(found.messages || []);
            setScore(found.feedback?.score ?? null);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    const stored = sessionStorage.getItem("interviewMessages");
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  }, [search]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f4f7fa] p-8">
      <div className="w-full max-w-7xl px-4 mb-6 flex justify-end">
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary-200 text-dark-100 rounded-full"
        >
          Go to Home
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Interview Review</h1>

        {interview && (
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Interview ID: {interview.id}</div>
              <div className="text-sm text-gray-500">{interview.userName ?? ''} • {interview.timestamp ? new Date(interview.timestamp).toLocaleString() : ''}</div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-500">Rate this session</label>
              <input type="range" min={0} max={100} value={score ?? 0} onChange={(e)=>setScore(Number(e.target.value))} />
              <div className="text-sm font-semibold">{score !== null ? score : '—'}</div>
              <button className="px-3 py-1 bg-primary-200 text-dark-100 rounded-md" onClick={() => {
                // save score into localStorage
                try {
                  const raw = localStorage.getItem('pastInterviews');
                  if (!raw) return;
                  const arr = JSON.parse(raw);
                  const idx = arr.findIndex((x:any)=>x.id === interview.id);
                  if (idx !== -1) {
                    arr[idx].feedback = arr[idx].feedback || {};
                    arr[idx].feedback.score = score;
                    localStorage.setItem('pastInterviews', JSON.stringify(arr));
                    // update local state
                    setInterview(arr[idx]);
                    alert('Saved rating');
                  }
                } catch (e) { console.error(e); alert('Failed to save rating'); }
              }}>Save</button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <p className="text-gray-700 text-lg text-center">No messages to display yet.</p>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-gray-50 flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">{msg.role}</span>
                <span className="text-gray-800 text-base">{msg.content}</span>
                {msg.timestamp && <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewReview;
