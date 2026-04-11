import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Newspaper, ExternalLink, Loader2 } from "lucide-react";

const API = "https://placement-student-information-portal.onrender.com";

export default function StudentNewsFeed() {
  const { data: news = [], isLoading } = useQuery({
    queryKey: ["student-news"],
    queryFn: async () => {
      const r = await fetch(`${API}/api/student/news`);
      return r.json();
    }
  });

  const categoryColor: Record<string, string> = {
    job: "bg-blue-100 text-blue-700",
    internship: "bg-purple-100 text-purple-700",
    vacancy: "bg-green-100 text-green-700",
    other: "bg-gray-100 text-gray-600"
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-blue-600" />
            Job & Vacancy News
          </h1>
          <p className="text-gray-500 text-sm mt-1">Latest job openings & vacancy news — curated by admin</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : news.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No news yet. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item: any) => (
              <div key={item._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColor[item.category] || categoryColor.other}`}>
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-400">{item.source}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.fetchedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2 mb-3">
                  🤖 AI Summary: {item.aiSummary}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {item.applyLink && (
                    <a href={item.applyLink} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 font-medium">
                      <ExternalLink className="w-4 h-4" /> Apply Now
                    </a>
                  )}
                  <a href={item.url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50">
                    <ExternalLink className="w-4 h-4" /> Read More
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}