"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PastInterview {
  id: string;
  userName: string;
  timestamp: string;
  messages: Array<{ role: string; content: string }>;
}

export default function PastInterviews() {
  const [items, setItems] = useState<PastInterview[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pastInterviews");
      if (stored) setItems(JSON.parse(stored));
    }
  }, []);

  if (items.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 text-center px-4">
        <h2 className="text-3xl font-semibold mb-2 text-white">Past interviews</h2>
        <p className="text-sm text-gray-400">You don't have any past interviews yet — they'll appear here after you finish one.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 px-4">
      <h2 className="text-3xl font-semibold mb-6 text-white">Past interviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {items.map((it) => (
          <div key={it.id} className="relative bg-gradient-to-b from-[#171532] to-[#08090D] rounded-3xl p-8 border border-[#2f2f3a] min-h-[200px]">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="font-semibold text-xl text-white">{it.userName}</div>
                <div className="text-sm text-gray-400 mt-2">{new Date(it.timestamp).toLocaleString()}</div>
                <div className="text-base text-gray-300 mt-4 max-h-36 overflow-hidden leading-6">
                  {it.messages && it.messages.length > 0 ? (
                    it.messages.slice(0, 6).map((m, i) => (
                      <div key={i} className="truncate">{m.content}</div>
                    ))
                  ) : (
                    <div className="text-gray-500">No transcript</div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                <Link href={`/interview/review?id=${it.id}`} className="px-5 py-3 bg-primary-200 text-dark-100 rounded-full font-semibold text-sm">View</Link>
                <button
                  className="px-5 py-3 bg-dark-200 text-primary-200 rounded-full text-sm"
                  onClick={() => {
                    // remove item
                    const updated = items.filter((x) => x.id !== it.id);
                    setItems(updated);
                    localStorage.setItem("pastInterviews", JSON.stringify(updated));
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
