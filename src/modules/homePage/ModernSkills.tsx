import React from "react";
import Image from "next/image";
import { ModernSkillImage } from "@/utils/images";
import { SkillIcon } from "@/utils/icons";
import { stats } from "@/utils/constant";

const ModernSkills = () => {
  const learningData = [
    {
      title: "On-Demand Learning",
      para1:
        "On-Demand Learning gives you the flexibility to study on your own schedule, with access to a wide variety of learning materials anytime, anywhere.",
      para2:
        "This approach ensures that you are not bound by rigid class times or locations. Track your progress and revisit challenging topics at your own pace.",
      bg: "#EEF2FF",
      icon: <SkillIcon color="#315CFF" />,
    },
    {
      title: "Expert Instructors",
      para1:
        "Learn directly from vetted industry professionals who bring real-world experience, current industry standards, and practical frameworks to every module.",
      para2:
        "Stay up-to-date with emerging tools and trends. Our expert-led approach builds real confidence and bridges the gap between learning and workplace application.",
      bg: "#ECFDF5",
      icon: <SkillIcon color="#059669" />,
    },
    {
      title: "Career Advancement",
      para1:
        "Structured curriculum designed to build demonstrable skills, portfolio-ready projects, and recognized certificates valued by hiring managers.",
      para2:
        "Our comprehensive learning paths provide deep domain knowledge and interview readiness, empowering you to achieve meaningful milestones.",
      bg: "#EFF6FF",
      icon: <SkillIcon color="#2563EB" />,
    },
  ];

  return (
    <section className="bg-[var(--surface)] border-y border-[var(--border)] px-6 md:px-12 xl:px-24 py-16">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <h2 className="text-[28px] md:text-[40px] font-bold tracking-tight text-[var(--text-primary)] leading-[1.2]">
            Modern skills need a <br className="hidden sm:inline" /> modern learning approach
          </h2>
          <p className="text-[14px] md:text-[16px] text-[var(--text-secondary)] max-w-md leading-relaxed">
            Learning solutions shouldn&apos;t be one-size-fits-all. We combine flexible pacing with hands-on practice and mentorship.
          </p>
        </div>

        <div className="border border-[var(--border)] rounded-[12px] overflow-hidden bg-white shadow-xs">
          <Image
            src={ModernSkillImage}
            alt="Student Learning"
            unoptimized
            className="w-full h-[220px] lg:h-[280px] object-cover"
          />
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {learningData.map((item, index) => (
              <div key={item.title} className="flex lg:gap-8">
                <div className="flex flex-col gap-4">
                  <div
                    className="w-12 h-12 flex justify-center items-center rounded-xl"
                    style={{ backgroundColor: item.bg }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                    {item.para1}
                  </p>
                  <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                    {item.para2}
                  </p>
                </div>
                {index !== learningData.length - 1 && (
                  <div className="w-[1px] bg-[var(--border)] hidden lg:block self-stretch"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 border-t border-[var(--border)]">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`flex flex-col items-center text-center ${
                index !== stats.length - 1 ? "sm:border-r border-[var(--border)]" : ""
              }`}
            >
              <div className="text-[var(--primary)] text-3xl md:text-4xl font-extrabold tracking-tight">
                {stat.value}
              </div>
              <div className="text-[var(--text-secondary)] mt-2 text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModernSkills;
