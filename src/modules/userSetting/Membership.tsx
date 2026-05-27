import CommonButton from "@/components/CommonButton";
import CommonLink from "@/components/CommonLink";
import { HeaderSmallLogo } from "@/utils/icons";
import React from "react";

export const purchasedCourses = [
  { title: "Data Analytics", price: 25.99, status: "Purchased" },
  { title: "Digital Marketing Specialist", price: 25.99, status: "Purchased" },
  {
    title: "Finance & Quantitative Modeling",
    price: 25.99,
    status: "Purchased",
  },
];

const Membership = () => {
  return (
    <div className="w-full h-fit flex flex-col gap-3">
      <h2 className="text-[20px] font-bold plus-jakarta-sans ">
        My Membership & Courses
      </h2>

      <div className="flex flex-col gap-5 w-full bg-white p-5 rounded-xl">
        <div className="flex justify-between items-center">
          <h1 className="text-[16px] font-[500]">Membership</h1>
          <h1 className="text-[16px] font-[500] text-[#111111]">$99/mo</h1>
        </div>

        <div className="bg-[#F7F7F7] rounded-[10px] p-4 flex items-center gap-3 ">
          <div className="w-[100px] h-[100px] rounded-[10px] bg-white flex items-center justify-center">
            <HeaderSmallLogo color={"var(--secondary)"} />
          </div>
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <h1 className="text-[24px] leading-[120%] font-bold text-secondary">
                  Learning+ Pro
                </h1>
                <h1 className="text-[20px] leading-[120%] font-semibold text-[#111111]">
                  $99/mo
                </h1>
              </div>
              <CommonButton
                text={"Current Plan"}
                className="border border-[#68B8FF] !text-[#68B8FF] !bg-[#E1F1FF] w-[20%] !rounded-[100px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <h1>Renews on 08/03/2025</h1>
              <CommonLink text={"Change Plan"} className="text-[#F53131]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[10px] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-[16px] font-bold">Courses Purchased</h1>
            <h1 className="text-[20px] leading-[120%] font-semibold text-[#111111]">
              $200/mo
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {purchasedCourses.map((item, index) => (
              <div
                key={index}
                className="bg-[#F7F7F7] rounded-[10px] w-full p-5 flex flex-col items-start"
              >
                <span className="text-[12px] bg-primary text-black px-4 py-2 rounded-full">
                  {item.status}
                </span>
                <h3 className="text-secondary font-[600] text-[18px] plus-jakarta-sans truncate w-[98%]">
                  {item.title}
                </h3>
                <p className="text-black font-[600] text-[16px]">
                  ${item.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
