"use client";

import React, { useEffect, useState } from "react";
import CommonButton from "@/components/CommonButton";
import { getStudentPurchasesApi } from "@/services/collections";
import { CoursePurchase } from "@/utils/interface";
import { RoutePaths } from "@/utils/enums";
import { useRouter } from "next/navigation";
import {
  CheckCircleFilled,
  FileTextOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Tag, Table, Modal } from "antd";

const Membership = () => {
  const [purchases, setPurchases] = useState<CoursePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<CoursePurchase | null>(null);
  const router = useRouter();

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

  const totalSpent = purchases
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
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">
              <BookOutlined />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">
                {course?.course_name || "Course Purchase"}
              </p>
              <p className="text-xs text-slate-400">ID: {record._id.slice(-8)}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date: string) => (
        <span className="text-xs text-slate-600">
          {date ? new Date(date).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "grossAmountCents",
      key: "amount",
      render: (cents: number) => (
        <span className="font-bold text-slate-900 text-sm">
          ${((cents || 0) / 100).toFixed(2)} USD
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        if (status === "paid") {
          return <Tag color="success">Paid</Tag>;
        }
        if (status === "refunded") {
          return <Tag color="purple">Refunded</Tag>;
        }
        return <Tag color="default">{status}</Tag>;
      },
    },
    {
      title: "Receipt",
      key: "receipt",
      render: (_: any, record: CoursePurchase) => (
        <button
          onClick={() => setSelectedReceipt(record)}
          className="inline-flex items-center gap-1.5 text-xs text-[#4F46E5] hover:underline font-semibold cursor-pointer"
        >
          <FileTextOutlined />
          <span>View Receipt</span>
        </button>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Purchase History & Invoices
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View your individual course receipts, transaction history, and access status.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Courses Owned
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1">
            {totalCourses}
          </span>
          <span className="text-xs text-emerald-600 font-medium">Lifetime course access</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Investment
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1">
            ${totalSpent.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-medium">USD Currency</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Refund Guarantee
          </span>
          <div className="flex items-center gap-2 mt-1 text-slate-900 font-bold text-lg">
            <SafetyCertificateOutlined className="text-emerald-500" />
            <span>2-Day Full Refund</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Applies to all eligible purchases</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
        <h3 className="text-base font-bold text-slate-900">
          Transaction Records
        </h3>

        <Table
          columns={columns}
          dataSource={purchases}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          locale={{
            emptyText: (
              <div className="py-12 flex flex-col items-center gap-3">
                <BookOutlined className="text-4xl text-slate-300" />
                <p className="text-sm text-slate-500">No course purchases yet.</p>
                <CommonButton
                  text="Browse Courses"
                  onClick={() => router.push(RoutePaths.MyExplore)}
                  className="!h-10 !px-5 !rounded-xl !bg-[#4F46E5] text-white font-semibold !text-xs"
                />
              </div>
            ),
          }}
        />
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <Modal
          open={!!selectedReceipt}
          onCancel={() => setSelectedReceipt(null)}
          footer={null}
          centered
          width={480}
        >
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Official Receipt
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Payment Confirmation
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                #{selectedReceipt._id.slice(-8).toUpperCase()}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Date</span>
                <span className="font-semibold text-slate-800">
                  {selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleString() : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Course</span>
                <span className="font-semibold text-slate-800 text-right max-w-[240px] truncate">
                  {typeof selectedReceipt.courseId === "object"
                    ? selectedReceipt.courseId.course_name
                    : "Course"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Payment Status</span>
                <span className="font-semibold text-emerald-600 capitalize">
                  {selectedReceipt.status}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Currency</span>
                <span className="font-semibold text-slate-800 uppercase">
                  {selectedReceipt.currency || "USD"}
                </span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold text-slate-900">
                <span>Amount Paid</span>
                <span className="text-[#4F46E5]">
                  ${((selectedReceipt.grossAmountCents || 0) / 100).toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
              <CheckCircleFilled className="text-emerald-500 text-sm shrink-0" />
              <span>Paid via Stripe. Your student enrollment has been confirmed.</span>
            </div>

            <CommonButton
              text="Close"
              onClick={() => setSelectedReceipt(null)}
              className="!w-full !h-10 !rounded-xl !bg-slate-100 !text-slate-700 hover:!bg-slate-200 border-none font-semibold text-xs mt-2"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Membership;
