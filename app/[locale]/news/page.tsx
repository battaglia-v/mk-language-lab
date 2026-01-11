import { headers } from "next/headers";
import NewsClient from "./NewsClient";

const SOURCE_IDS = ["all", "time-mk", "meta-mk", "makfax", "a1on"] as const;

type SourceId = (typeof SOURCE_IDS)[number];

type NewsItem = {
  id: string;
  title: string;
  link: string;
  description: string;
  publishedAt: string;
  sourceId: string;
  sourceName: string;
  categories: string[];
  videos: string[];
  image: string | null;
  imageProxy?: string | null;
};

type NewsMeta = {
  count: number;
  total: number;
  fetchedAt: string;
  errors?: string[];
};

type NewsResponse = {
  items: NewsItem[];
  meta: NewsMeta;
};

interface NewsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ source?: string; q?: string; videosOnly?: string }>;
}

function normalizeSource(value: string | undefined): SourceId {
  const candidate = (value ?? "all").toLowerCase();
  return SOURCE_IDS.includes(candidate as SourceId) ? (candidate as SourceId) : "all";
}

function buildNewsApiUrl(base: string, params: URLSearchParams): string {
  const joiner = base.includes("?") ? "&" : "?";
  return `${base}${joiner}${params.toString()}`;
}

async function resolveBaseUrl(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const forwardedProto = headerList.get("x-forwarded-proto");

  if (host) {
    const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    const protocol = forwardedProto ?? (isLocalhost ? "http" : "https");
    return `${protocol}://${host}`;
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL;
  if (envUrl) {
    return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  }

  return "https://mklanguage.com";
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { locale: _locale } = await params;
  const { source, q, videosOnly } = await searchParams;

  const initialSource = normalizeSource(source);
  const initialQuery = typeof q === "string" ? q : "";
  const initialVideosOnly = videosOnly === "true";

  let initialItems: NewsItem[] = [];
  let initialMeta: NewsMeta | null = null;

  try {
    const baseUrl = await resolveBaseUrl();
    const newsApiUrl = process.env.NEWS_API_URL ?? process.env.NEXT_PUBLIC_NEWS_API_URL;
    const resolvedBase = newsApiUrl
      ? newsApiUrl.startsWith("http")
        ? newsApiUrl
        : `${baseUrl}${newsApiUrl.startsWith("/") ? "" : "/"}${newsApiUrl}`
      : `${baseUrl}/api/news`;
    const queryParams = new URLSearchParams({ limit: "30", source: initialSource });
    if (initialQuery.trim()) {
      queryParams.set("q", initialQuery.trim());
    }
    if (initialVideosOnly) {
      queryParams.set("videosOnly", "true");
    }

    const response = await fetch(buildNewsApiUrl(resolvedBase, queryParams), {
      next: { revalidate: 180 },
    });

    if (response.ok) {
      const data = (await response.json()) as NewsResponse;
      initialItems = Array.isArray(data.items) ? data.items : [];
      initialMeta = data.meta ?? null;
    }
  } catch {
    initialItems = [];
    initialMeta = null;
  }

  return (
    <NewsClient
      initialItems={initialItems}
      initialMeta={initialMeta}
      initialSource={initialSource}
      initialQuery={initialQuery}
      initialVideosOnly={initialVideosOnly}
    />
  );
}
