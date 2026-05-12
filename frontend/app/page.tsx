"use client";

import { useState, useEffect } from "react";
import { demoName } from "./lib/demo-users";

// --- API types ---

interface ApiUser {
  user_id: string;
  opt_in: boolean | null;
  last_visit: string | null;
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
  subcategory?: string;
  categoryColor: string;
  title: string;
  tag: string;
  url?: string;
}

interface UserProfile {
  label: string;
  name: string;
  tags: Tag[];
  affinities: Affinity[];
  subjectLine: string;
  articles: Article[];
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

// Placeholder tags — send time and engagement level not yet available from DB
const PLACEHOLDER_TAGS: Tag[] = [
  { icon: "bolt", label: "Engaged user" },
  { icon: "send", label: "Send time: TBD" },
];

const tagStyles: Record<TagIcon, string> = {
  clock: "text-blue-300 bg-blue-950/70 border-blue-800/40",
  bolt: "text-green-300 bg-green-950/70 border-green-800/40",
  bookmark: "text-amber-300 bg-amber-950/70 border-amber-800/40",
  send: "text-zinc-400 bg-zinc-800/60 border-zinc-700/40",
};

// --- Helpers ---

function pillarColors(pillar: string) {
  const key = pillar.charAt(0).toUpperCase() + pillar.slice(1).toLowerCase();
  return PILLAR_COLORS[key] ?? DEFAULT_PILLAR_COLORS;
}

function mapDigestToProfile(digest: ApiDigest, label: string): UserProfile {
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
    tag: rec.why_relevant,
    url: rec.url,
  }));

  return {
    label,
    name: demoName(user.user_id),
    tags: PLACEHOLDER_TAGS,
    affinities,
    subjectLine: subject_line,
    articles,
  };
}

// --- Icons ---

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

function ArticleItem({ article }: { article: Article }) {
  return (
    <div className="py-3 border-b border-zinc-700/40 last:border-0">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className={`text-xs font-medium ${article.categoryColor}`}>
          {article.category}{article.subcategory ? ` · ${article.subcategory}` : ""}
        </span>
        {article.url ? (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-600 hover:text-zinc-300 shrink-0 transition-colors"
          >
            <ExternalLinkIcon />
          </a>
        ) : (
          <button className="text-zinc-600 hover:text-zinc-300 shrink-0 transition-colors">
            <ExternalLinkIcon />
          </button>
        )}
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
        <p className="text-xs text-zinc-500 mb-1.5">Subject line</p>
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

function UserCardSkeleton({ label }: { label: string }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 flex flex-col gap-4 border border-zinc-800/60 animate-pulse">
      <div>
        <p className="text-xs text-zinc-500 mb-2">{label}</p>
        <div className="h-9 bg-zinc-800 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-24 bg-zinc-800 rounded-full" />
        <div className="h-6 w-28 bg-zinc-800 rounded-full" />
      </div>
      <div className="flex flex-col gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 bg-zinc-800 rounded-full" />
        ))}
      </div>
      <div className="h-16 bg-zinc-800 rounded-lg" />
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-zinc-800 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// --- Page ---

export default function Home() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const usersRes = await fetch("/api/users");
        if (!usersRes.ok) throw new Error(`Users fetch failed: ${usersRes.status}`);
        const userList = (await usersRes.json()) as ApiUser[];

        const first2 = userList.slice(0, 2);
        const digests = await Promise.all(
          first2.map((u) =>
            fetch(`/api/digest/${encodeURIComponent(u.user_id)}?affinity_limit=4`).then((r) => {
              if (!r.ok) throw new Error(`Digest fetch failed: ${r.status}`);
              return r.json() as Promise<ApiDigest>;
            })
          )
        );

        setUsers(digests.map((d, i) => mapDigestToProfile(d, `User ${String.fromCharCode(65 + i)}`)));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

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
        <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-rose-700/80 text-white">
          Digest preview
        </span>
      </header>

      <main className="p-6 flex flex-col gap-5 max-w-5xl mx-auto">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-950 border border-red-800 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            <>
              <UserCardSkeleton label="User A" />
              <UserCardSkeleton label="User B" />
            </>
          ) : (
            users.map((user) => <UserCard key={user.label} user={user} />)
          )}
        </div>
      </main>
    </div>
  );
}
