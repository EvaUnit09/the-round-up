"use client";

import { useState } from "react";

type TagIcon = "clock" | "bolt" | "bookmark" | "send";

interface Tag {
  icon: TagIcon;
  label: string;
}

interface Affinity {
  section: string;
  percent: number;
  color: string;
}

interface Article {
  category: string;
  subcategory: string;
  categoryColor: string;
  title: string;
  teaser: string;
  tag: string;
  signal: string;
  relevance: number;
}

interface UserProfile {
  label: string;
  firstName: string;
  name: string;
  sendTime: string;
  tags: Tag[];
  affinities: Affinity[];
  subjectLine: string;
  articles: Article[];
}

interface Metric {
  label: string;
  value: string;
  comparison: string;
}

const users: UserProfile[] = [
  {
    label: "User A",
    firstName: "Russell",
    name: "Russell — sport heavy",
    sendTime: "07:30",
    tags: [
      { icon: "clock", label: "Morning reader" },
      { icon: "bolt", label: "Power user" },
      { icon: "send", label: "Send at 07:30" },
    ],
    affinities: [
      { section: "Sport", percent: 55, color: "bg-blue-500" },
      { section: "News", percent: 18, color: "bg-zinc-400" },
      { section: "Culture", percent: 8, color: "bg-orange-500" },
      { section: "Technology", percent: 6, color: "bg-green-500" },
    ],
    subjectLine:
      "Bellingham, the Ashes, and a story you'll want to read about Arsenal",
    articles: [
      {
        category: "Sport",
        subcategory: "Football",
        categoryColor: "text-orange-400",
        title: "Arsenal keep title hopes alive with dramatic late win",
        teaser:
          "Mikel Arteta's side closed the gap at the top with a tense victory at the Emirates.",
        tag: "Based on your Premier League interest",
        signal: "You follow Premier League · 18 articles this month",
        relevance: 94,
      },
      {
        category: "Sport",
        subcategory: "Cricket",
        categoryColor: "text-orange-400",
        title: "England win Ashes opener in Brisbane",
        teaser:
          "England bowled Australia out for 147 on a dramatic first day at the Gabba.",
        tag: "You read 12 cricket articles last month",
        signal: "12 cricket articles read last month",
        relevance: 87,
      },
      {
        category: "News",
        subcategory: "UK Politics",
        categoryColor: "text-zinc-400",
        title: "PM faces fresh rebellion over housing bill",
        teaser:
          "Dozens of backbenchers are threatening to vote against the government's flagship planning reforms.",
        tag: "Trending among similar readers",
        signal: "Trending · high engagement among similar profiles",
        relevance: 71,
      },
    ],
  },
  {
    label: "User B",
    firstName: "Rachael",
    name: "Rachael — entertainment",
    sendTime: "19:15",
    tags: [
      { icon: "clock", label: "Evening reader" },
      { icon: "bookmark", label: "Casual user" },
      { icon: "send", label: "Send at 19:15" },
    ],
    affinities: [
      { section: "Culture", percent: 50, color: "bg-orange-500" },
      { section: "News", percent: 15, color: "bg-zinc-400" },
      { section: "Travel", percent: 12, color: "bg-purple-500" },
      { section: "Technology", percent: 10, color: "bg-green-500" },
    ],
    subjectLine:
      "A must-see film, a surprise album drop, and a travel story for your list",
    articles: [
      {
        category: "Culture",
        subcategory: "Film",
        categoryColor: "text-pink-400",
        title: "Review: Harbour is a haunting meditation on grief",
        teaser:
          "This quiet, devastating film is already a frontrunner for the awards season.",
        tag: "Based on your film & arts interest",
        signal: "Film & arts affinity · 8 reviews read this week",
        relevance: 92,
      },
      {
        category: "Culture",
        subcategory: "Music",
        categoryColor: "text-pink-400",
        title: "Dua Lipa announces surprise album and world tour",
        teaser:
          "The pop star dropped the news overnight alongside two new singles.",
        tag: "You read 8 music articles this week",
        signal: "8 music articles read this week",
        relevance: 85,
      },
      {
        category: "Travel",
        subcategory: "Europe",
        categoryColor: "text-purple-400",
        title: "Why Portugal should be your next city break",
        teaser:
          "From the Algarve to Porto, here's why Portugal keeps topping travellers' wishlists.",
        tag: "Matches your travel reading pattern",
        signal: "Travel reading pattern · Europe interest detected",
        relevance: 78,
      },
    ],
  },
];

const metrics: Metric[] = [
  { label: "Open rate", value: "62%", comparison: "↑ 24pp vs baseline" },
  { label: "Clickthrough rate", value: "41%", comparison: "↑ 18pp vs baseline" },
  { label: "Return visits / day", value: "2.3x", comparison: "↑ vs 0.8x baseline" },
  { label: "Est. ad revenue lift", value: "+34%", comparison: "per active user" },
];

const articleImageColors = ["bg-blue-900", "bg-emerald-900", "bg-violet-900"];

function AffinityBar({ section, percent, color }: Affinity) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-zinc-400">{section}</span>
      <div className="flex-1 h-1.5 bg-zinc-700/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-8 text-right text-sm text-zinc-400">{percent}%</span>
    </div>
  );
}

function RelevanceBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? "bg-green-900/60 text-green-300 border-green-700/40"
      : score >= 70
      ? "bg-amber-900/60 text-amber-300 border-amber-700/40"
      : "bg-zinc-800 text-zinc-400 border-zinc-700/40";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color}`}>
      {score}% match
    </span>
  );
}

function EmailPreview({ user }: { user: UserProfile }) {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden text-zinc-900">
        <div className="bg-red-700 px-5 py-3 flex items-center justify-between">
          <span className="font-black text-white text-sm tracking-tight">BBC</span>
          <span className="text-red-200 text-xs">The Round Up · {today}</span>
        </div>

        <div className="px-5 py-4 border-b border-zinc-100">
          <p className="text-xs text-zinc-400 mb-0.5">Sending at {user.sendTime}</p>
          <p className="text-base font-semibold text-zinc-900">Hi {user.firstName},</p>
          <p className="text-sm text-zinc-500 mt-1 italic">"{user.subjectLine}"</p>
        </div>

        <div className="divide-y divide-zinc-100">
          {user.articles.map((article, i) => (
            <div key={article.title} className="px-5 py-4">
              <div
                className={`w-full h-28 rounded-lg mb-3 ${
                  articleImageColors[i % articleImageColors.length]
                } flex items-center justify-center`}
              >
                <span className={`text-xs font-medium ${article.categoryColor} opacity-60`}>
                  {article.category} · {article.subcategory}
                </span>
              </div>
              <p className={`text-xs font-medium mb-1 ${article.categoryColor}`}>
                {article.category} · {article.subcategory}
              </p>
              <p className="text-sm font-bold text-zinc-900 leading-snug mb-1">
                {article.title}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed mb-3">{article.teaser}</p>
              <span className="text-xs font-semibold text-red-700">Read on BBC.com →</span>
            </div>
          ))}
        </div>

        <div className="bg-zinc-50 px-5 py-3 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-xs text-zinc-400">BBC · The Round Up</span>
          <span className="text-xs text-zinc-400">Unsubscribe</span>
        </div>
      </div>
    </div>
  );
}

function IntelligencePanel({ user }: { user: UserProfile }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800/60">
        <p className="text-xs text-zinc-500 mb-3">Section affinity</p>
        <div className="flex flex-col gap-2.5">
          {user.affinities.map((a) => (
            <AffinityBar key={a.section} {...a} />
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800/60">
        <p className="text-xs text-zinc-500 mb-4">Why these articles?</p>
        <div className="flex flex-col gap-5">
          {user.articles.map((article, i) => (
            <div key={article.title} className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-400 flex items-center justify-center font-medium mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium mb-0.5 ${article.categoryColor}`}>
                  {article.category} · {article.subcategory}
                </p>
                <p className="text-sm text-white font-medium leading-snug mb-1.5">
                  {article.title}
                </p>
                <p className="text-xs text-zinc-500 mb-2">{article.signal}</p>
                <RelevanceBadge score={article.relevance} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, comparison }: Metric) {
  const isPerUser = comparison === "per active user";
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
      <p className={`text-xs ${isPerUser ? "text-zinc-500" : "text-green-400"}`}>
        {comparison}
      </p>
    </div>
  );
}

export default function IntelligenceDemoPage() {
  const [activeTab, setActiveTab] = useState<"digest" | "impact">("digest");
  const [selectedUser, setSelectedUser] = useState(0);
  const user = users[selectedUser];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-black text-sm tracking-tight bg-red-700 px-1.5 py-0.5 rounded-sm">
            BBC
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-white text-sm font-medium">The Round Up</span>
        </div>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("digest")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === "digest"
                ? "bg-rose-700/80 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Digest preview
          </button>
          <button
            onClick={() => setActiveTab("impact")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === "impact"
                ? "bg-rose-700/80 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Impact dashboard
          </button>
        </nav>
      </header>

      <div className="border-b border-zinc-800 px-6 py-2.5 flex items-center gap-3">
        <span className="text-xs text-zinc-500">Preview for:</span>
        {users.map((u, i) => (
          <button
            key={u.label}
            onClick={() => setSelectedUser(i)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              selectedUser === i
                ? "bg-zinc-700 text-white border-zinc-600"
                : "text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
            }`}
          >
            {u.name}
          </button>
        ))}
        <span className="ml-auto text-xs text-zinc-500">
          Sends at{" "}
          <span className="text-zinc-300 font-medium">{user.sendTime}</span>
        </span>
      </div>

      <main className="p-6 max-w-6xl mx-auto">
        {activeTab === "digest" ? (
          <div className="grid grid-cols-[55fr_45fr] gap-6 items-start">
            <EmailPreview user={user} />
            <IntelligencePanel user={user} />
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800/60">
            <p className="text-xs text-zinc-500 mb-5">
              Simulated impact — personalised vs. non-personalised baseline
            </p>
            <div className="grid grid-cols-4 divide-x divide-zinc-800">
              {metrics.map((metric) => (
                <div key={metric.label} className="px-5 first:pl-0 last:pr-0">
                  <MetricCard {...metric} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
