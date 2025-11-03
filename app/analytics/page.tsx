"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

interface PastInterview {
  id: string;
  userName: string;
  timestamp: string;
  messages: Array<Record<string, any>>;
  company?: string | null;
  role?: string | null;
  category?: string | null;
  questionCount?: number | null;
  random?: boolean;
  feedback?: {
    score?: number; // 0-100
    missedTopics?: string[];
    notes?: string;
  };
}

const STOPWORDS = new Set([
  'the','and','to','a','of','in','is','that','it','for','on','you','with','this','i','my','we','they','be','are','as','an','have','has','but','or','not','at','from'
]);

function parseTimestamp(m: any): number | null {
  if (!m) return null;
  const candidates = ['timestamp','createdAt','time','ts','date'];
  for (const k of candidates) {
    if (m[k]) {
      const v = m[k];
      const n = typeof v === 'number' ? v : Date.parse(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

export default function AnalyticsPage() {
  const [items, setItems] = useState<PastInterview[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('pastInterviews');
    if (!raw) return;
    try {
      const parsed: PastInterview[] = JSON.parse(raw);
      // normalize timestamps
      setItems(parsed.map(it => ({ ...it, timestamp: it.timestamp ?? new Date().toISOString() })));
    } catch (e) {
      console.error('Failed to parse pastInterviews', e);
    }
  }, []);

  const companies = useMemo(() => {
    const s = new Set<string>();
    items.forEach(it => { if (it.company) s.add(it.company); });
    return Array.from(s);
  }, [items]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    items.forEach(it => { s.add(it.category ?? 'Mixed'); });
    return Array.from(s);
  }, [items]);

  const filtered = useMemo(() => {
    let list = items.slice();
    if (companyFilter !== 'all') list = list.filter(i => (i.company ?? '') === companyFilter);
    if (categoryFilter !== 'all') list = list.filter(i => (i.category ?? 'Mixed') === categoryFilter);
    if (startDate) {
      const sd = Date.parse(startDate);
      list = list.filter(i => Date.parse(i.timestamp) >= sd);
    }
    if (endDate) {
      const ed = Date.parse(endDate) + 24*60*60*1000 - 1;
      list = list.filter(i => Date.parse(i.timestamp) <= ed);
    }
    return list;
  }, [items, companyFilter, categoryFilter, startDate, endDate]);

  // metrics
  const totalSessions = filtered.length;
  const scored = filtered.map(it => it.feedback?.score).filter(s => typeof s === 'number') as number[];
  const avgScore = scored.length ? (scored.reduce((a,b)=>a+b,0)/scored.length) : null;

  const categoryCounts: Record<string, number> = {};
  filtered.forEach(it => {
    const cat = it.category ?? 'Mixed';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // score trend
  const trendLabels = filtered
    .filter(it => typeof it.feedback?.score === 'number')
    .sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp))
    .map(it => new Date(it.timestamp).toLocaleDateString());
  const trendData = filtered
    .filter(it => typeof it.feedback?.score === 'number')
    .sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp))
    .map(it => it.feedback!.score!);

  // response time and longest pauses
  let avgResponseMs: number | null = null;
  let longestPauseMs: number | null = null;
  {
    const respTimes: number[] = [];
    let longest = 0;
    filtered.forEach(it => {
      const msgs = it.messages || [];
      const times: number[] = msgs.map(m => parseTimestamp(m)).filter(Boolean) as number[];
      if (times.length > 1) {
        // compute consecutive gaps
        for (let i=1;i<times.length;i++) {
          const gap = times[i]-times[i-1];
          if (gap > longest) longest = gap;
        }
        // crude response time: average gap between user->assistant pairs when role fields exist
        for (let i=0;i<msgs.length;i++) {
          const m = msgs[i];
          if (m.role === 'user') {
            // find next assistant message
            for (let j=i+1;j<msgs.length;j++) {
              if (msgs[j].role === 'assistant') {
                const t1 = parseTimestamp(msgs[i]);
                const t2 = parseTimestamp(msgs[j]);
                if (t1 && t2) respTimes.push(t2-t1);
                break;
              }
            }
          }
        }
      }
    });
    if (respTimes.length) avgResponseMs = respTimes.reduce((a,b)=>a+b,0)/respTimes.length;
    if (longest) longestPauseMs = longest;
  }

  // simple topic extraction from user messages
  const topicCounts: Record<string, number> = {};
  filtered.forEach(it => {
    (it.messages || []).forEach((m:any) => {
      if ((m.role ?? '') === 'user' || (m.role ?? '') === 'feedback') {
        const text = (m.content || '') as string;
        text.split(/[^a-zA-Z0-9]+/).map(w=>w.toLowerCase()).forEach(w=>{
          if (w.length<3) return;
          if (STOPWORDS.has(w)) return;
          topicCounts[w] = (topicCounts[w]||0)+1;
        });
      }
    });
  });
  const topKeywords = Object.entries(topicCounts).sort((a,b)=>b[1]-a[1]).slice(0,12);

  const categoryLabels = Object.keys(categoryCounts);
  const categoryValues = categoryLabels.map(l => categoryCounts[l]);

  const lineData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Score',
        data: trendData,
        borderColor: '#9f7aea',
        backgroundColor: 'rgba(159,122,234,0.2)'
      }
    ]
  };

  const barData = {
    labels: categoryLabels,
    datasets: [{ label: 'Sessions', data: categoryValues, backgroundColor: ['#7c3aed','#4f46e5','#06b6d4','#f97316'] }]
  };

  const donutData = {
    labels: categoryLabels,
    datasets: [{ data: categoryValues, backgroundColor: ['#7c3aed','#4f46e5','#06b6d4','#f97316'] }]
  };

  function human(ms: number | null) {
    if (ms === null) return '—';
    const s = Math.round(ms/1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s/60);
    if (m < 60) return `${m}m ${s%60}s`;
    const h = Math.floor(m/60);
    return `${h}h ${m%60}m`;
  }

  return (
    <div className="w-full min-h-screen p-6 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Analytics</h1>

        <div className="flex gap-4 items-center mb-6">
          <div className="bg-[#0f1720] p-3 rounded-md">
            <label className="text-xs text-gray-400">Start</label>
            <input value={startDate} onChange={(e)=>setStartDate(e.target.value)} type="date" className="mt-1 bg-transparent text-white text-sm" />
          </div>
          <div className="bg-[#0f1720] p-3 rounded-md">
            <label className="text-xs text-gray-400">End</label>
            <input value={endDate} onChange={(e)=>setEndDate(e.target.value)} type="date" className="mt-1 bg-transparent text-white text-sm" />
          </div>

          <div className="bg-[#0f1720] p-3 rounded-md">
            <label className="text-xs text-gray-400">Company</label>
            <select value={companyFilter} onChange={(e)=>setCompanyFilter(e.target.value)} className="mt-1 bg-transparent text-white text-sm">
              <option value="all">All</option>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-[#0f1720] p-3 rounded-md">
            <label className="text-xs text-gray-400">Category</label>
            <select value={categoryFilter} onChange={(e)=>setCategoryFilter(e.target.value)} className="mt-1 bg-transparent text-white text-sm">
              <option value="all">All</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-b from-[#171532] to-[#08090D] rounded-2xl text-white">
            <div className="text-sm text-gray-300">Total sessions</div>
            <div className="text-2xl font-bold mt-1">{totalSessions}</div>
          </div>
          <div className="p-4 bg-gradient-to-b from-[#171532] to-[#08090D] rounded-2xl text-white">
            <div className="text-sm text-gray-300">Average score</div>
            <div className="text-2xl font-bold mt-1">{avgScore !== null ? Math.round(avgScore) : '—'}</div>
            <div className="text-xs text-gray-400 mt-1">based on {scored.length} session(s) with feedback</div>
          </div>
          <div className="p-4 bg-gradient-to-b from-[#171532] to-[#08090D] rounded-2xl text-white">
            <div className="text-sm text-gray-300">Avg response</div>
            <div className="text-2xl font-bold mt-1">{human(avgResponseMs)}</div>
            <div className="text-xs text-gray-400 mt-1">Longest pause: {human(longestPauseMs)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-gradient-to-b from-[#171532] to-[#08090D] rounded-2xl text-white">
            <h3 className="font-semibold mb-3">Score trend</h3>
            {trendData.length ? <Line data={lineData} /> : <div className="text-gray-400">No score data yet</div>}
          </div>

          <div className="p-4 bg-gradient-to-b from-[#171532] to-[#08090D] rounded-2xl text-white">
            <h3 className="font-semibold mb-3">Category distribution</h3>
            {categoryLabels.length ? (
              <div className="flex gap-4">
                <div className="w-1/2"><Bar data={barData} /></div>
                <div className="w-1/2"><Doughnut data={donutData} /></div>
              </div>
            ) : <div className="text-gray-400">No sessions</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gradient-to-b from-[#171532] to-[#08090D] rounded-2xl text-white">
            <h3 className="font-semibold mb-3">Top keywords</h3>
            {topKeywords.length ? (
              <ul className="list-disc list-inside text-gray-300">
                {topKeywords.map(([k,c]) => <li key={k}>{k} — {c}</li>)}
              </ul>
            ) : <div className="text-gray-400">No keywords found</div>}
          </div>

          <div className="p-4 bg-gradient-to-b from-[#171532] to-[#08090D] rounded-2xl text-white">
            <h3 className="font-semibold mb-3">Recent sessions</h3>
            <div className="flex flex-col gap-3">
              {filtered.slice(0,8).map(it => (
                <div key={it.id} className="p-3 bg-[#0f1720] rounded-md">
                  <div className="text-sm text-gray-300 font-semibold">{it.userName ?? 'You'} — {it.role ?? '—'}</div>
                  <div className="text-xs text-gray-500">{new Date(it.timestamp).toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-2 truncate">{(it.messages?.slice(-1)[0]?.content) ?? '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
