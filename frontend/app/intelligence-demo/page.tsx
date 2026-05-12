"use client";

import { useState, useEffect } from "react";
import { demoName } from "../lib/demo-users";

// --- API types ---

interface ApiUser {
  user_id: string;
  email: string | null;
  opt_in: boolean | null;
  last_visit: string | null;
  engaged_user: boolean | null;
}

interface ApiDigestUser {
  user_id: string;
  display_name: string;
  tag_weights: Record<string, number>;
}

interface ApiArticle {
  title: string;
  blurb: string;
  url: string;
  content_pillar: string;
  affinity_score: number;
  why_relevant: string;
}

interface ApiDigest {
  user: ApiDigestUser;
  subject_line: string;
  recommendations: ApiArticle[];
  digest_date: string;
}

// --- UI types ---

interface Affinity {
  section: string;
  percent: number;
  color: string;
}

interface Article {
  category: string;
  categoryColor: string;
  title: string;
  teaser: string;
  signal: string;
  relevance: number;
  url: string;
}

interface UserProfile {
  userId: string;
  firstName: string;
  name: string;
  affinities: Affinity[];
  subjectLine: string;
  articles: Article[];
}

interface Metric {
  label: string;
  value: string;
  comparison: string;
}

// --- Constants ---

const PILLAR_COLORS: Record<string, { bar: string; text: string }> = {
  Sport: { bar: "bg-blue-500", text: "text-blue-400" },
  News: { bar: "bg-zinc-400", text: "text-zinc-400" },
  Culture: { bar: "bg-orange-500", text: "text-orange-400" },
  Technology: { bar: "bg-green-500", text: "text-green-400" },
  Travel: { bar: "bg-purple-500", text: "text-purple-400" },
  Business: { bar: "bg-yellow-500", text: "text-yellow-400" },
  Science: { bar: "bg-cyan-500", text: "text-cyan-400" },
  Health: { bar: "bg-rose-500", text: "text-rose-400" },
};

const DEFAULT_PILLAR_COLORS = { bar: "bg-zinc-500", text: "text-zinc-400" };

const metrics: Metric[] = [
  { label: "Open rate", value: "62%", comparison: "↑ 24pp vs baseline" },
  { label: "Clickthrough rate", value: "41%", comparison: "↑ 18pp vs baseline" },
  { label: "Return visits / day", value: "2.3x", comparison: "↑ vs 0.8x baseline" },
  { label: "Est. ad revenue lift", value: "+34%", comparison: "per active user" },
];

const PILLAR_IMAGES: Record<string, string> = {
  Sport:      "https://images.unsplash.com/photo-1431324155702-e46f5b1f78a6?auto=format&fit=crop&w=600&h=200&q=80",
  News:       "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&h=200&q=80",
  Culture:    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&h=200&q=80",
  Technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&h=200&q=80",
  Travel:     "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&h=200&q=80",
  Business:   "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=200&q=80",
  Science:    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&h=200&q=80",
  Health:     "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&h=200&q=80",
};

const PILLAR_IMAGE_FALLBACK = ["bg-blue-900", "bg-emerald-900", "bg-violet-900"];

const ALL_TOPICS = ["Sport", "News", "Culture", "Technology", "Travel", "Business", "Science", "Health"];

// --- Helpers ---

function pillarColors(pillar: string) {
  const key = pillar.charAt(0).toUpperCase() + pillar.slice(1).toLowerCase();
  return PILLAR_COLORS[key] ?? DEFAULT_PILLAR_COLORS;
}

function mapDigestToProfile(digest: ApiDigest): UserProfile {
  const { user, subject_line, recommendations } = digest;

  const affinities: Affinity[] = Object.entries(user.tag_weights)
    .sort(([, a], [, b]) => b - a)
    .map(([pillar, weight]) => ({
      section: pillar.charAt(0).toUpperCase() + pillar.slice(1).toLowerCase(),
      percent: Math.round(weight * 100),
      color: pillarColors(pillar).bar,
    }));

  const articles: Article[] = recommendations.map((rec) => ({
    category: rec.content_pillar.charAt(0).toUpperCase() + rec.content_pillar.slice(1).toLowerCase(),
    categoryColor: pillarColors(rec.content_pillar).text,
    title: rec.title,
    teaser: rec.blurb,
    signal: rec.why_relevant,
    relevance: Math.round((user.tag_weights[rec.content_pillar] ?? rec.affinity_score) * 100),
    url: rec.url,
  }));

  return {
    userId: user.user_id,
    firstName: demoName(user.user_id),
    name: demoName(user.user_id),
    affinities,
    subjectLine: subject_line,
    articles,
  };
}

function userLabel(u: ApiUser): string {
  if (!u.email) return u.user_id;
  const local = u.email.split("@")[0];
  return local.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// --- Sub-components ---

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
  const [vote, setVote] = useState<"yes" | "no" | null>(null);
  const [moreTopics, setMoreTopics] = useState<string[]>([]);

  function toggleTopic(topic: string) {
    setMoreTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full bg-white rounded-xl shadow-2xl overflow-hidden text-zinc-900">
        <div className="bg-red-700 px-5 py-3 flex items-center justify-between">
          <span className="font-black text-white text-sm tracking-tight">BBC</span>
          <span className="text-red-200 text-xs">The Round Up · {today}</span>
        </div>

        <div className="px-5 py-4 border-b border-zinc-100">
          <p className="text-base font-semibold text-zinc-900">Hi {user.firstName},</p>
          <p className="text-sm text-zinc-500 mt-1 italic">"{user.subjectLine}"</p>
        </div>

        <div className="divide-y divide-zinc-100">
          {user.articles.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-zinc-400">
              No recommendations available for this user.
            </div>
          ) : (
            user.articles.map((article, i) => (
              <div key={article.title} className="px-5 py-4">
                <div
                  className={`w-full h-28 rounded-lg mb-3 overflow-hidden ${
                    PILLAR_IMAGE_FALLBACK[i % PILLAR_IMAGE_FALLBACK.length]
                  }`}
                >
                  <img
                    src={PILLAR_IMAGES[article.category]}
                    alt={article.category}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <p className={`text-xs font-medium mb-1 ${article.categoryColor}`}>
                  {article.category}
                </p>
                <p className="text-sm font-bold text-zinc-900 leading-snug mb-1">
                  {article.title}
                </p>
                {article.teaser && (
                  <p className="text-xs text-zinc-500 leading-relaxed mb-3">{article.teaser}</p>
                )}
                <a
                  href={article.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-red-700"
                >
                  Read on BBC.com →
                </a>
              </div>
            ))
          )}
        </div>

        <div className="bg-zinc-50 border-t border-zinc-200 px-5 py-5">
          <p className="text-sm font-semibold text-zinc-800 mb-1">
            Were these articles relevant to your interests?
          </p>
          <div className="flex gap-2 mt-2 mb-5">
            <button
              onClick={() => setVote("yes")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                vote === "yes"
                  ? "bg-green-600 text-white border-green-600"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              ✓ Yes
            </button>
            <button
              onClick={() => setVote("no")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                vote === "no"
                  ? "bg-red-600 text-white border-red-600"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              ✗ No
            </button>
          </div>
          <p className="text-sm font-semibold text-zinc-800 mb-2">
            What would you like to see more of?
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  moreTopics.includes(topic)
                    ? "bg-red-700 text-white border-red-700"
                    : "border-zinc-300 text-zinc-500 hover:border-zinc-400"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-zinc-50 px-5 py-3 border-t border-zinc-200 flex items-center justify-between">
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
        {user.articles.length === 0 ? (
          <p className="text-sm text-zinc-500">No recommendations available.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {user.articles.map((article, i) => (
              <div key={article.title} className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-400 flex items-center justify-center font-medium mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium mb-0.5 ${article.categoryColor}`}>
                    {article.category}
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
        )}
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
      <p className={`text-xs ${isPerUser ? "text-zinc-500" : "text-green-400"}`}>{comparison}</p>
    </div>
  );
}

// --- Page ---

export default function IntelligenceDemoPage() {
  const [activeTab, setActiveTab] = useState<"digest" | "impact">("digest");
  const [userList, setUserList] = useState<ApiUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDigest, setLoadingDigest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<ApiUser[]>;
      })
      .then((data) => {
        setUserList(data);
        if (data.length > 0) setSelectedUserId(data[0].user_id);
      })
      .catch((e: unknown) => {
        setError(`Failed to load users: ${e instanceof Error ? e.message : "unknown error"}`);
      })
      .finally(() => setLoadingUsers(false));
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    setLoadingDigest(true);
    setError(null);
    fetch(`/api/digest/${encodeURIComponent(selectedUserId)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<ApiDigest>;
      })
      .then((data) => setProfile(mapDigestToProfile(data)))
      .catch((e: unknown) => {
        setError(`Failed to load digest: ${e instanceof Error ? e.message : "unknown error"}`);
      })
      .finally(() => setLoadingDigest(false));
  }, [selectedUserId]);

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
              activeTab === "digest" ? "bg-rose-700/80 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Digest preview
          </button>
          <button
            onClick={() => setActiveTab("impact")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === "impact" ? "bg-rose-700/80 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Impact dashboard
          </button>
        </nav>
      </header>

      <div className="border-b border-zinc-800 px-6 py-2.5 flex items-center gap-3 overflow-x-auto">
        <span className="text-xs text-zinc-500 shrink-0">Preview for:</span>
        {loadingUsers ? (
          <span className="text-xs text-zinc-500">Loading users…</span>
        ) : (
          userList.map((u) => (
            <button
              key={u.user_id}
              onClick={() => setSelectedUserId(u.user_id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border shrink-0 ${
                selectedUserId === u.user_id
                  ? "bg-zinc-700 text-white border-zinc-600"
                  : "text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
              }`}
            >
              {demoName(u.user_id)}
            </button>
          ))
        )}
        {profile && (
          <span className="ml-auto text-xs text-zinc-500 shrink-0">
            Viewing: <span className="text-zinc-300 font-medium">{profile.firstName}</span>
          </span>
        )}
      </div>

      <main className="p-6 max-w-6xl mx-auto">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-950 border border-red-800 text-red-300 text-sm">
            {error}
          </div>
        )}

        {activeTab === "digest" ? (
          loadingDigest || !profile ? (
            <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
              {loadingDigest ? "Loading digest…" : "Select a user to preview their digest."}
            </div>
          ) : (
            <div className="grid grid-cols-[55fr_45fr] gap-6 items-start">
              <EmailPreview user={profile} />
              <IntelligencePanel user={profile} />
            </div>
          )
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
