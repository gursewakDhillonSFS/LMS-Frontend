"use client";
import { getApi } from "@/services/methods";
import React, { useEffect, useState } from "react";

const AdminPanel = () => {
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

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      {overview ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(overview).map(([k, v]) => (
            <div key={k} className="bg-white rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase">{k}</p>
              <p className="text-2xl font-bold">{v as number}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500">
          Unable to load overview. Ensure you are logged in as admin.
        </p>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4">
          <h2 className="font-bold mb-2">Recent Users</h2>
          <ul className="text-sm space-y-1 max-h-80 overflow-auto">
            {(users as { email?: string; role?: string; firstName?: string }[]).map(
              (u, i) => (
                <li key={i} className="border-b py-1">
                  {u.firstName || "User"} — {u.email} ({u.role})
                </li>
              ),
            )}
          </ul>
        </div>
        <div className="bg-white rounded-xl p-4">
          <h2 className="font-bold mb-2">Courses</h2>
          <ul className="text-sm space-y-1 max-h-80 overflow-auto">
            {(
              courses as {
                course_name?: string;
                course_status?: string;
                enrolled_user_count?: number;
              }[]
            ).map((c, i) => (
              <li key={i} className="border-b py-1">
                {c.course_name} — {c.course_status} (
                {c.enrolled_user_count || 0} enrolled)
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
