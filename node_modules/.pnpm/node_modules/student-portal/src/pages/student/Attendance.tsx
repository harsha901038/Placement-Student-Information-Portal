import { useAttendance } from "@/hooks/use-student";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentAttendance() {
  const { data, isLoading } = useAttendance();

  if (isLoading)
    return (
      <AppLayout>
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );

  const getColor = (p: number) => {
    if (p >= 85) return { bar: "#16a34a", bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" };
    if (p >= 75) return { bar: "#d97706", bg: "#fffbeb", text: "#b45309", border: "#fde68a" };
    return { bar: "#dc2626", bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" };
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 760, margin: "0 auto" }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: 0 }}>
              Attendance Record
            </h1>
            <p style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>
              Semester-wise attendance overview
            </p>
          </div>
          <div style={{
            background: "#eff6ff", border: "1px solid #bfdbfe",
            borderRadius: 14, padding: "14px 24px", textAlign: "center"
          }}>
            <p style={{ fontSize: 11, color: "#6b7280", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Overall</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#2563eb", margin: 0 }}>
              {data?.overallPercentage?.toFixed(1) || 0}%
            </p>
            {data?.overallPercentage < 75 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#dc2626", fontSize: 12, marginTop: 4 }}>
                <AlertCircle size={12} /> Action Required
              </div>
            )}
          </div>
        </div>

        {/* Semester Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {data?.records?.map((rec: any, i: number) => {
            const c = getColor(rec.percentage);
            const pct = Math.min(100, rec.percentage);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: "#fff", borderRadius: 14,
                  border: `1px solid ${c.border}`,
                  padding: "18px 20px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                }}
              >
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      background: c.bg, borderRadius: 8,
                      padding: "6px 8px", display: "flex", alignItems: "center"
                    }}>
                      <BookOpen size={14} color={c.text} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
                      Semester {rec.semester}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 18, fontWeight: 800, color: c.text
                  }}>
                    {rec.percentage.toFixed(1)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{
                  background: "#f3f4f6", borderRadius: 99,
                  height: 7, marginBottom: 10, overflow: "hidden"
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.05 }}
                    style={{ height: "100%", borderRadius: 99, background: c.bar }}
                  />
                </div>

                {/* Stats */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                    Attended: <b style={{ color: "#374151" }}>{rec.attendedClasses}</b>
                  </span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                    Total: <b style={{ color: "#374151" }}>{rec.totalClasses}</b>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </motion.div>
    </AppLayout>
  );
}