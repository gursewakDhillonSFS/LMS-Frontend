"use client";
import { getApi } from "@/services/methods";
import React, { useEffect, useState } from "react";
import { useTranslation } from "@/context/I18nContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Link from "next/link";

const AdminPanel = () => {
  const { t } = useTranslation();
  const [overview, setOverview] = useState<Record<string, number> | null>(null);
  const [users, setUsers] = useState<unknown[]>([]);
  const [courses, setCourses] = useState<unknown[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [o, u, c] = await Promise.all([
          getApi("/admin/v1/overview"),
          getApi("/admin/v1/users?limit=20"),
          getApi("/admin/v1/courses?limit=20"),
        ]);
        if (o?.status) setOverview(o.data);
        if (u?.status) setUsers(u.data?.users || []);
        if (c?.status) setCourses(c.data?.courses || []);
      } catch {
        setOverview(null);
      }
    })();
  }, []);

  const getMetricLabel = (key: string) => {
    if (key === "total_users" || key === "users") return t("dashboard.admin.totalUsers", { defaultValue: "Total Users" });
    if (key === "total_courses" || key === "courses") return t("dashboard.admin.totalCourses", { defaultValue: "Total Courses" });
    if (key === "total_batches" || key === "batches") return t("dashboard.admin.totalBatches", { defaultValue: "Total Batches" });
    if (key === "total_enrollments" || key === "enrollments") return t("dashboard.admin.totalEnrollments", { defaultValue: "Total Enrollments" });
    return key.replace(/_/g, " ");
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          {t("dashboard.admin.title", { defaultValue: "Admin Administration Panel" })}
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/finance"
            className="text-xs bg-indigo-600 text-white hover:bg-indigo-700 px-3.5 py-1.5 rounded-full font-semibold transition-all shadow-xs"
          >
            Finance & Earnings →
          </Link>
          <LanguageSwitcher variant="header" />
          <span className="text-xs bg-slate-100 text-[var(--text-secondary)] px-3 py-1 rounded-full font-medium border border-[var(--border)]">
            {t("dashboard.admin.overview", { defaultValue: "System Overview" })}
          </span>
        </div>
      </div>

      {overview ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(overview).map(([k, v]) => (
            <div key={k} className="bg-white border border-[var(--border)] rounded-[10px] p-5 shadow-xs">
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                {getMetricLabel(k)}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mt-2">
                {v as number}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-[10px] text-sm">
          {t("dashboard.admin.unauthorized", {
            defaultValue: "Overview data unavailable. Ensure your account has administrative privileges.",
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[var(--border)] rounded-[10px] p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
              {t("dashboard.admin.recentUsers", { defaultValue: "Recent Users" })}
            </h2>
            <span className="text-xs text-[var(--text-muted)]">Showing up to 20</span>
          </div>

          <div className="overflow-y-auto max-h-96 divide-y divide-[var(--border)]">
            {(users as { email?: string; role?: string; firstName?: string }[]).map(
              (u, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--text-primary)] truncate">
                      {u.firstName || "User"}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {u.email}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-50 text-[var(--primary)] px-2.5 py-0.5 rounded-full font-medium capitalize shrink-0">
                    {u.role || "student"}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-[10px] p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
              {t("dashboard.admin.recentCourses", { defaultValue: "Platform Courses" })}
            </h2>
            <span className="text-xs text-[var(--text-muted)]">Showing up to 20</span>
          </div>

          <div className="overflow-y-auto max-h-96 divide-y divide-[var(--border)]">
            {(
              courses as {
                course_name?: string;
                course_status?: string;
                enrolled_user_count?: number;
              }[]
            ).map((c, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--text-primary)] truncate">
                    {c.course_name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {c.enrolled_user_count || 0} students enrolled
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize shrink-0 ${
                  c.course_status === "published" || c.course_status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-700"
                }`}>
                  {c.course_status || "draft"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
