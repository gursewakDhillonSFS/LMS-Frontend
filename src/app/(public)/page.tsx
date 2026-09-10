import HomeWrapper from "@/modules/homePage/HomeWrapper";
import React from "react";
import type { Metadata } from "next";
import JsonLd, { getFAQPageSchema } from "@/components/JsonLd";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://skillora.com";

export const metadata: Metadata = {
  title: "Skillora — Master In-Demand Tech, Design & Business Skills",
  description:
    "Explore 1,000+ interactive online courses in Software Development, Data Science, AI, Design, and Business. Learn from industry experts and earn verified certificates.",
  alternates: {
    canonical: `${baseUrl}`,
  },
  openGraph: {
    title: "Skillora — Master In-Demand Tech, Design & Business Skills",
    description:
      "Explore 1,000+ interactive online courses in Software Development, Data Science, AI, Design, and Business. Learn from industry experts and earn verified certificates.",
    url: `${baseUrl}`,
    type: "website",
    siteName: "Skillora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skillora — Master In-Demand Tech, Design & Business Skills",
    description:
      "Explore 1,000+ interactive online courses in Software Development, Data Science, AI, Design, and Business.",
  },
};

const faqs = [
  {
    question: "How do I enroll in a course?",
    answer:
      "To enroll in any course, click on the course card, review the syllabus, and select 'Enroll Now'. If you have a Skillora Pro membership, you can instantly start learning with one click.",
  },
  {
    question: "Are the certificates accredited?",
    answer:
      "Yes! All course completion certificates from Skillora are verifiable and recognized worldwide. You can add them directly to your LinkedIn profile or resume.",
  },
  {
    question: "Can I learn at my own schedule?",
    answer:
      "All courses are on-demand and 100% self-paced. You have lifetime access to video lectures, interactive coding environments, and project files.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit/debit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and localized bank transfer options.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Absolutely! We offer a 7-day full-access free trial so you can explore premium courses, projects, and learning paths before any commitment.",
  },
  {
    question: "Can I access courses on mobile?",
    answer:
      "Yes, Skillora is fully responsive on all devices, and you can download our native iOS or Android mobile apps for offline learning.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Our dedicated support team is available 24/7 via live chat, email at support@skillora.com, or through our community help forum.",
  },
  {
    question: "Are the courses self-paced?",
    answer:
      "Yes, all courses are 100% self-paced. You can start anytime, learn on your own schedule, and retain lifetime access to course materials.",
  },
];

const RootHomePage = () => {
  const faqSchema = getFAQPageSchema(faqs);

  return (
    <div>
      <JsonLd id="root-homepage-faq-schema" data={faqSchema} />
      <HomeWrapper />
    </div>
  );
};

export default RootHomePage;
