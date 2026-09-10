"use client";

import React from "react";
import { Collapse } from "antd";
import { PlusOutlined } from "@ant-design/icons";

type FAQItem = {
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    question: "How do I renew my subscription?",
    answer:
      "To renew your subscription, go to your account settings and click on “Subscription”, then choose your desired plan and complete the payment process.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can cancel your subscription by navigating to your account settings, selecting “Subscription” and clicking on “Cancel Subscription”.",
  },
  {
    question: "Can I get a refund for my shop subscription?",
    answer:
      "Refunds are available within 14 days of purchase if you haven’t used any premium features. Contact support for assistance.",
  },
  {
    question: "How do I setup Shop ?",
    answer:
      "To set up your shop, go to the “Shop” tab in your dashboard, follow the setup wizard, and provide necessary business details.",
  },
  {
    question: "How do I check the status of my order?",
    answer:
      "Log in to your account, go to “My Orders”, and view the status next to each order listed.",
  },
  {
    question: "If I have an issue with my order, who do I contact?",
    answer:
      "Please contact our support team through the “Help Center” or email support@example.com.",
  },
  {
    question: "How do I return a product?",
    answer:
      "Go to “My Orders”, click on the order you want to return, and select “Request Return”. Follow the provided instructions.",
  },
  {
    question: "As a seller, how do I manage all of my orders?",
    answer:
      "Navigate to the “Seller Dashboard” and click on “Orders” to view, update, and manage all customer orders.",
  },
];

const renderExpandIcon = (panelProps: { isActive?: boolean }) => (
  <PlusOutlined
    rotate={panelProps.isActive ? 45 : 0}
    className="text-[var(--text-secondary)] text-[14px] transition-transform duration-200"
  />
);

export default function FAQSection() {
  return (
    <section className="bg-[var(--surface-subtle)] border-t border-[var(--border)] py-16 px-6 md:px-16 xl:px-48 flex flex-col gap-10">
      <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
        <h2 className="text-[28px] md:text-[40px] font-bold text-[var(--text-primary)] tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-[14px] md:text-[16px] text-[var(--text-secondary)] leading-relaxed">
          Everything you need to know about our courses, subscriptions, certification, and platform features.
        </p>
      </div>

      <div className="max-w-4xl mx-auto w-full bg-white border border-[var(--border)] rounded-[12px] p-2 shadow-xs">
        <Collapse
          prefixCls="custom-collapse"
          accordion
          expandIconPosition="end"
          expandIcon={renderExpandIcon}
          ghost
          items={faqData.map((item, index) => ({
            key: index.toString(),
            label: (
              <span className="text-[15px] md:text-[17px] font-medium text-[var(--text-primary)]">
                {item.question}
              </span>
            ),
            children: (
              <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-relaxed pb-2">
                {item.answer}
              </p>
            ),
          }))}
        />
      </div>
    </section>
  );
}
