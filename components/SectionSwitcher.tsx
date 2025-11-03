"use client";

import { useState } from "react";
import PastInterviews from "./PastInterviews";
import Link from "next/link";

export default function SectionSwitcher() {
  const [tab, setTab] = useState<'home' | 'past' | 'analytics'>('home');

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start">
      <div className="w-full max-w-5xl px-4 pt-8 flex items-center justify-center gap-4">
        <button
          onClick={() => setTab('home')}
          className={`px-4 py-2 rounded-full font-semibold ${tab === 'home' ? 'bg-primary-200 text-dark-100' : 'bg-transparent text-white border border-[#2b2b33]'}`}
        >
          Start Interview
        </button>
        <button
          onClick={() => setTab('past')}
          className={`px-4 py-2 rounded-full font-semibold ${tab === 'past' ? 'bg-primary-200 text-dark-100' : 'bg-transparent text-white border border-[#2b2b33]'}`}
        >
          Past interviews
        </button>
        <button
          onClick={() => setTab('analytics')}
          className={`px-4 py-2 rounded-full font-semibold ${tab === 'analytics' ? 'bg-primary-200 text-dark-100' : 'bg-transparent text-white border border-[#2b2b33]'}`}
        >
          Analytics
        </button>
      </div>

      <div className="w-full flex-1 flex items-center justify-center">
        {tab === 'home' ? (
          <div className="w-full flex items-center justify-center">
            <div className="card-cta w-full max-w-3xl flex flex-col gap-6 items-center justify-center p-12">
              <h1 className="text-4xl font-extrabold text-center">Welcome to Mockify!</h1>
              <p className="text-center text-base md:text-lg max-w-2xl">
                Practice your interview skills with realistic, AI-powered mock interviews.<br />
                Get instant feedback and improve your confidence before the real thing.
              </p>
              <Link href="/interview" className="mt-4 px-6 py-3 bg-primary-200 text-dark-100 rounded-full font-semibold">Let's start an interview</Link>
            </div>
          </div>
        ) : tab === 'past' ? (
          <div className="w-full flex items-center justify-center">
            <div className="w-full max-w-4xl px-4 py-10">
              <PastInterviews />
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center">
            <div className="card-cta w-full max-w-3xl flex flex-col gap-6 items-center justify-center p-12">
              <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
              <p className="text-center text-sm text-gray-300">Open the full analytics dashboard to explore session metrics and trends.</p>
              <Link href="/analytics" className="mt-4 px-6 py-3 bg-primary-200 text-dark-100 rounded-full font-semibold">Open Analytics</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
