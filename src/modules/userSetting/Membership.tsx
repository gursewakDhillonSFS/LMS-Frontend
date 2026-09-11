"use client";

import React, { useEffect, useState } from "react";
import { getStudentPurchasesApi } from "@/services/collections";
import { CoursePurchase } from "@/utils/interface";
import {
  BookOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  EyeOutlined,
  CloseOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { Table, Tag } from "antd";

const Membership = () => {
  const [purchases, setPurchases] = useState<CoursePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<CoursePurchase | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getStudentPurchasesApi();
        if (res?.status && res.data) {
          setPurchases(res.data);
        }
      } catch (err) {
        console.error("Failed to load purchases", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalSpent =
    purchases
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + (p.grossAmountCents || 0), 0) / 100;

  const totalCourses = purchases.filter((p) => p.status === "paid").length;

  const columns = [
    {
      title: "Course",
      key: "course",
      render: (_: any, record: CoursePurchase) => {
        const course = typeof record.courseId === "object" ? record.courseId : null;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#315CFF]/10 text-[#315CFF] flex items-center justify-center text-base shrink-0 border border-[#315CFF]/20">
              <BookOutlined />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 text-sm block truncate">
                {course?.course_name || "Course Purchase"}
              </span>
              <span className="text-xs text-slate-400">
                Order ID: {record._id.slice(-8)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Purchase Date",
      dataIndex: "createdAt",
      key: "date",
      render: (d: string) => (
        <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
          <CalendarOutlined className="text-slate-400" />
          {d
            ? new Date(d).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      title: "Amount Paid",
      dataIndex: "grossAmountCents",
      key: "amount",
      render: (cents: number, record: CoursePurchase) => {
        const amt = cents
          ? (cents / 100).toFixed(2)
          : Number((record as any).coursePrice || 0).toFixed(2);
        return <span className="font-bold text-slate-900 text-sm">${amt} USD</span>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        if (status === "paid")
          return (
            <Tag color="success" className="!rounded-full !px-2.5">
              Active Access
            </Tag>
          );
        if (status === "pending")
          return (
            <Tag color="warning" className="!rounded-full !px-2.5">
              Pending
            </Tag>
          );
        return <Tag className="!rounded-full !px-2.5">{status}</Tag>;
      },
    },
    {
      title: "Receipt",
      key: "action",
      render: (_: any, record: CoursePurchase) => (
        <button
          type="button"
          onClick={() => setSelectedReceipt(record)}
          className="text-xs font-semibold text-[#315CFF] hover:text-[#2547D0] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <EyeOutlined className="text-xs" />
          <span>View Invoice</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[#F2F4F7]">
        <h3 className="text-lg font-bold text-[#101828]">Membership & Courses</h3>
        <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
          Review your enrolled courses, lifetime learning investment, and order receipts.
        </p>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E4E7EC] shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
              Enrolled Courses
            </span>
            <h4 className="text-2xl font-bold text-[#101828]">{totalCourses}</h4>
            <span className="text-xs text-emerald-600 font-medium">Lifetime access</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#315CFF]/10 text-[#315CFF] flex items-center justify-center text-xl shrink-0">
            <BookOutlined />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E4E7EC] shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
              Total Learning Investment
            </span>
            <h4 className="text-2xl font-bold text-[#101828]">${totalSpent.toFixed(2)}</h4>
            <span className="text-xs text-[#667085] font-medium">USD across all orders</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
            <DollarCircleOutlined />
          </div>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="rounded-2xl border border-[#E4E7EC] overflow-hidden">
        <div className="p-4 border-b border-[#F2F4F7] bg-[#F8FAFC]">
          <h4 className="text-sm font-bold text-[#101828]">Purchase & Order History</h4>
        </div>

        <Table
          columns={columns}
          dataSource={purchases}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 6 }}
          locale={{
            emptyText: (
              <div className="py-12 text-center text-slate-400 text-sm">
                No course enrollments found yet. Browse the catalog to start learning!
              </div>
            ),
          }}
        />
      </div>

      {/* RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-[#E4E7EC] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2F4F7]">
              <div className="flex items-center gap-2">
                <CheckCircleFilled className="text-emerald-600 text-lg" />
                <h3 className="text-base font-bold text-[#101828]">Payment Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <CloseOutlined className="text-xs" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-[#F2F4F7]">
                <span className="text-[#667085]">Order Reference</span>
                <span className="font-mono text-xs font-bold text-[#101828]">
                  #{selectedReceipt._id.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2F4F7]">
                <span className="text-[#667085]">Course Name</span>
                <span className="font-semibold text-[#101828] text-right truncate max-w-[200px]">
                  {typeof selectedReceipt.courseId === "object"
                    ? (selectedReceipt.courseId as any)?.course_name
                    : "Course Enrollment"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2F4F7]">
                <span className="text-[#667085]">Date</span>
                <span className="text-[#101828]">
                  {selectedReceipt.createdAt
                    ? new Date(selectedReceipt.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2F4F7]">
                <span className="text-[#667085]">Payment Method</span>
                <span className="text-[#101828] font-medium">Stripe Direct Checkout</span>
              </div>
              <div className="flex justify-between py-2 pt-3 text-base">
                <span className="font-bold text-[#101828]">Total Paid</span>
                <span className="font-extrabold text-emerald-600">
                  $
                  {(
                    (selectedReceipt.grossAmountCents ||
                      Number((selectedReceipt as any).coursePrice || 0) * 100) / 100
                  ).toFixed(2)}{" "}
                  USD
                </span>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;
