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
        "This approach ensures that you are not bound by rigid class times or locations. With our intuitive learning platform, you can track your progress, revisit challenging topics.",
      bg: "#E3FFF1",
      icon: <SkillIcon />,
    },
    {
      title: "Expert Trainers",
      para1:
        "On-Demand Learning gives you the flexibility to study on your own schedule, with access to a wide variety of learning materials anytime, anywhere.",
      para2:
        "They stay up-to-date with the latest trends and tools, ensuring that what you learn is always relevant. This expert-led approach builds confidence and bridges the gap between learning and application.",
      bg: "#DBD7FF",
      icon: <SkillIcon color="var(--secondary)" />,
    },
    {
      title: "Professional Services",
      para1:
        "On-Demand Learning gives you the flexibility to study on your own schedule, with access to a wide variety of learning materials anytime, anywhere.",
      para2:
        "Our experienced consultants ensure smooth execution, high engagement, and strong knowledge retention. With our support, your team stays ahead in a fast-changing digital landscape.",
      bg: "#FFF4D9",
      icon: <SkillIcon color="#FFC023" />,
    },
  ];

  return (
    <div className="bg-black text-white px-[40px] py-[25px] xl:py-[50px] xl:px-[120px]">
      <div className="flex flex-col gap-[32px]">
        <div className="flex flex-col md:flex-row justify-between items-end gap-[16px]">
          <div
            className={`fjalla-one-regular  text-[36px] xl:text-[56px] leading-[120%] text-white whitespace-nowrap`}
          >
            Modern skills need a <br /> modern learning approach
          </div>
          <p className="text-[11px] lg:text-[14px] xl:text-[16px]">
            Learning solutions shouldn&apos;t be one-size-fits-all. For
            effective <br />
            training, you need the right skills and the right modalities.
            <br /> That’s where we come in.
          </p>
        </div>

        <div>
          <Image
            src={ModernSkillImage}
            alt="Student Learning"
            unoptimized
            className="w-full rounded-t-[12px] h-[220px] lg:h-[276px] object-cover"
          />
          <div className="bg-white text-black rounded-b-[12px] p-[24px] grid grid-col-1 lg:grid-cols-3 gap-[24px] lg:gap-[32px]">
            {learningData.map((item, index) => (
              <div key={item?.bg} className="flex lg:gap-[32px]">
                <div className="flex flex-col lg:py-[24px] !border-none gap-[16px]">
                  <div
                    className="w-[69px] h-[69px] flex justify-center items-center rounded-full"
                    style={{ backgroundColor: item?.bg }}
                  >
                    {item?.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{item?.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {item?.para1}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {item?.para2}
                  </p>
                </div>
                {index !== learningData?.length - 1 && (
                  <div className="w-[1px] bg-[#D9D9D9] hidden lg:block"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[12px] xl:gap-0 py-[40px] xl:px-[8px]">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index !== stats?.length - 1 && "border-r-1"
              } border-[#6B6B6B]`}
            >
              <div className="text-green-400 text-4xl font-bold">
                {stat.value}
              </div>
              <div className="text-gray-300 mt-2 text-center text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModernSkills;
