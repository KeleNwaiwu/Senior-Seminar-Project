
"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const InterviewReview = () => {
  const [messages, setMessages] = useState<SavedMessage[]>([]);
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
          if (found && found.messages) {
            setMessages(found.messages);
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
        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <p className="text-gray-700 text-lg text-center">No messages to display yet.</p>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-gray-50 flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">{msg.role}</span>
                <span className="text-gray-800 text-base">{msg.content}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewReview;
