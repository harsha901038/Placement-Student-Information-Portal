import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Newspaper, RefreshCw, Check, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = "http://localhost:5000";

export default function AdminNews() {
  const qc = useQueryClient();
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState("all");

  const { data: news = [], isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const r = await fetch(`${API}/api/admin/news`);
      return r.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`${API}/api/admin/news/${id}/approve`, { method: "PUT" });
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-news"] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`${API}/api/admin/news/${id}`, { method: "DELETE" });
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-news"] })
  });

  const fetchNews = async () => {
    setFetching(true);
    try {
      const r = await fetch(`${API}/api/admin/fetch-news`, { method: "POST" });
      const d = await r.json();
      alert(`${d.fetched} new articles fetched successfully`);
      qc.invalidateQueries({ queryKey: ["admin-news"] });
    } catch {
      alert("Failed to fetch news");
    }
    setFetching(false);
  };

  const categoryColor: Record<string, string> = {
    job: "bg-blue-100 text-blue-700",
    internship: "bg-purple-100 text-purple-700",
    vacancy: "bg-green-100 text-green-700",
    other: "bg-gray-100 text-gray-600"
  };

  const filtered = filter === "all" ? news : filter === "approved"
    ? news.filter((n: any) => n.approved)
    : news.filter((n: any) => !n.approved);

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-blue-600" />
              Job News Feed
            </h1>
            <p className="text-gray-500 text-sm mt-1">AI-filtered job & vacancy news for students</p>
          </div>
          <Button onClick={fetchNews} disabled={fetching} className="bg-blue-600 hover:bg-blue-700 text-white">
            {fetching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {fetching ? "Fetching..." : "Fetch Latest News"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Fetched", value: news.length, color: "blue" },
            { label: "Approved", value: news.filter((n: any) => n.approved).length, color: "green" },
            { label: "Pending Review", value: news.filter((n: any) => !n.approved).length, color: "orange" }
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border shadow-sm text-center">
              <div className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {["all", "pending", "approved"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${
                filter === f ? "bg-blue-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* News Cards */}
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No news yet. Click "Fetch Latest News" to start.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item: any) => (
              <div key={item._id} className={`bg-white rounded-xl border p-5 shadow-sm ${item.approved ? "border-green-200" : "border-gray-200"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColor[item.category] || categoryColor.other}`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-400">{item.source}</span>
                      {item.approved && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"> Approved</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2 mb-2">
                      {item.aiSummary}
                    </p>
                    {item.applyLink && (
                      <a href={item.applyLink} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline font-medium">
                        <ExternalLink className="w-3 h-3" /> Apply Link
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {!item.approved && (
                      <Button size="sm" onClick={() => approveMutation.mutate(item._id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs">
                        <Check className="w-3 h-3 mr-1" /> Approve
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(item._id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 text-xs">
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="text-xs w-full">
                        <ExternalLink className="w-3 h-3 mr-1" /> View
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}