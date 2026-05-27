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
  <PlusOutlined rotate={panelProps.isActive ? 45 : 0} className="text-white" />
);

export default function FAQSection() {
  return (
    <div className="bg-black flex flex-col gap-[40px] px-[50px] xl:px-[250px] text-white pt-[40px] xl:pt-[80px]">
      <h2 className="text-[36px] lg:text-[56px] font-bold text-center">
        Frequently Asked Questions
      </h2>
      <Collapse
        prefixCls="custom-collapse"
        accordion
        expandIconPosition="end"
        expandIcon={renderExpandIcon}
        ghost
        items={faqData.map((item, index) => ({
          key: index.toString(),
          label: <span className="text-[20px]">{item.question}</span>,
          children: <p className="text-[16px] text-white">{item.answer}</p>,
        }))}
      />
    </div>
  );
}
