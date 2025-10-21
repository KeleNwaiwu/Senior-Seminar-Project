"use client";

import { useRouter } from "next/navigation";

export default function ClientHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary-200 text-dark-100 rounded-full"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
