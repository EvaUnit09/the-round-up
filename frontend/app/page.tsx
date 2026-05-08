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
  tag: string;
}

interface UserProfile {
  label: string;
  name: string;
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
    name: "Russell — sport heavy",
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
      '"Bellingham, the Ashes, and a story you\'ll want to read about Arsenal"',
    articles: [
      {
        category: "Sport",
        subcategory: "Football",
        categoryColor: "text-orange-400",
        title: "Arsenal keep title hopes alive with dramatic late win",
        tag: "Based on your Premier League interest",
      },
      {
        category: "Sport",
        subcategory: "Cricket",
        categoryColor: "text-orange-400",
        title: "England win Ashes opener in Brisbane",
        tag: "You read 12 cricket articles last month",
      },
      {
        category: "News",
        subcategory: "UK Politics",
        categoryColor: "text-zinc-400",
        title: "PM faces fresh rebellion over housing bill",
        tag: "Trending among similar readers",
      },
    ],
  },
  {
    label: "User B",
    name: "Rachael — entertainment",
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
      '"A must-see film, a surprise album drop, and a travel story for your list"',
    articles: [
      {
        category: "Culture",
        subcategory: "Film",
        categoryColor: "text-pink-400",
        title: "Review: Harbour is a haunting meditation on grief",
        tag: "Based on your film & arts interest",
      },
      {
        category: "Culture",
        subcategory: "Music",
        categoryColor: "text-pink-400",
        title: "Dua Lipa announces surprise album and world tour",
        tag: "You read 8 music articles this week",
      },
      {
        category: "Travel",
        subcategory: "Europe",
        categoryColor: "text-purple-400",
        title: "Why Portugal should be your next city break",
        tag: "Matches your travel reading pattern",
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

const tagStyles: Record<TagIcon, string> = {
  clock: "text-blue-300 bg-blue-950/70 border-blue-800/40",
  bolt: "text-green-300 bg-green-950/70 border-green-800/40",
  bookmark: "text-amber-300 bg-amber-950/70 border-amber-800/40",
  send: "text-zinc-400 bg-zinc-800/60 border-zinc-700/40",
};

function ClockIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function TagIconComponent({ icon }: { icon: TagIcon }) {
  if (icon === "clock") return <ClockIcon />;
  if (icon === "bolt") return <BoltIcon />;
  if (icon === "bookmark") return <BookmarkIcon />;
  return <SendIcon />;
}

function AffinityBar({ section, percent, color }: Affinity) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-zinc-400">{section}</span>
      <div className="flex-1 h-1.5 bg-zinc-700/60 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="w-8 text-right text-sm text-zinc-400">{percent}%</span>
    </div>
  );
}

function ArticleItem({ article }: { article: Article }) {
  return (
    <div className="py-3 border-b border-zinc-700/40 last:border-0">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className={`text-xs font-medium ${article.categoryColor}`}>
          {article.category} · {article.subcategory}
        </span>
        <button className="text-zinc-600 hover:text-zinc-300 shrink-0 transition-colors">
          <ExternalLinkIcon />
        </button>
      </div>
      <p className="text-sm text-white font-medium leading-snug mb-2">{article.title}</p>
      <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-teal-950/60 text-teal-300 border border-teal-800/30">
        {article.tag}
      </span>
    </div>
  );
}

function UserCard({ user }: { user: UserProfile }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 flex flex-col gap-4 border border-zinc-800/60">
      <div>
        <p className="text-xs text-zinc-500 mb-2">{user.label}</p>
        <button className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800 border border-zinc-700/60 rounded-lg text-sm text-white font-medium hover:border-zinc-600 transition-colors">
          {user.name}
          <ChevronDownIcon />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {user.tags.map((tag) => (
          <span
            key={tag.label}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${tagStyles[tag.icon]}`}
          >
            <TagIconComponent icon={tag.icon} />
            {tag.label}
          </span>
        ))}
      </div>

      <div>
        <p className="text-xs text-zinc-500 mb-2.5">Section affinity</p>
        <div className="flex flex-col gap-2.5">
          {user.affinities.map((affinity) => (
            <AffinityBar key={affinity.section} {...affinity} />
          ))}
        </div>
      </div>

      <div className="bg-zinc-950/60 rounded-lg p-3 border border-zinc-700/30">
        <p className="text-xs text-zinc-500 mb-1.5">LLM subject line</p>
        <p className="text-sm text-zinc-200 leading-snug">{user.subjectLine}</p>
      </div>

      <div>
        {user.articles.map((article) => (
          <ArticleItem key={article.title} article={article} />
        ))}
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<"digest" | "impact">("digest");

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

      <main className="p-6 flex flex-col gap-5 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 gap-4">
          {users.map((user) => (
            <UserCard key={user.label} user={user} />
          ))}
        </div>

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
      </main>
    </div>
  );
}
