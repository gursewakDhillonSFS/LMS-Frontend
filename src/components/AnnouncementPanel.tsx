import { EarPhoneIcon } from "@/utils/icons";
import { CloseOutlined } from "@ant-design/icons";
import React from "react";

interface AnnouncementPanelProp {
  onClose: () => void;
}

const notificationData = [
  {
    time: "13 May, 2025",
    notifications: [
      {
        title: "Organization name",
        subtitle: "Finance & Quantitative Modeling for Analysts",
        message: "Hello Students Today Live class has been canceled",
        timestamp: "17:50",
      },
      {
        title: "Organization name",
        subtitle: "Finance & Quantitative Modeling for Analysts",
        message: "Hello Students Today Live class has been canceled",
        timestamp: "17:50",
      },
      {
        title: "Organization name",
        subtitle: "Finance & Quantitative Modeling for Analysts",
        message: "Hello Students Today Live class has been canceled",
        timestamp: "17:50",
      },
    ],
  },
  {
    time: "10 May, 2025",
    notifications: [
      {
        title: "Organization name",
        subtitle: "Finance & Quantitative Modeling for Analysts",
        message: "Hello Students Today Live class has been canceled",
        timestamp: "17:50",
      },
      {
        title: "Organization name",
        subtitle: "Finance & Quantitative Modeling for Analysts",
        message: "Hello Students Today Live class has been canceled",
        timestamp: "17:50",
      },
    ],
  },
];

const AnnouncementPanel: React.FC<AnnouncementPanelProp> = ({ onClose }) => {
  return (
    <div>
      <div className="flex justify-between items-center bg-[#F3F6FC] px-[24px] pt-[24px] pb-[10px]">
        <h2 className="text-lg text-[#0E0E0E] font-bold">Announcement</h2>
        <button
          onClick={onClose}
          className="cursor-pointer text-red-500 hover:text-red-700"
        >
          <CloseOutlined />
        </button>
      </div>
      <div className="flex flex-col gap-[12px] my-[12px] px-[24px] py-[10px]">
        {notificationData.map((group) => (
          <div key={group.time} className="flex flex-col gap-[12px] ">
            <p className=" text-[16px] font-[500] leading-[150%]">
              {group.time}
            </p>
            {group.notifications.map((note, index) => (
              <div
                key={index}
                className="flex gap-[10px] p-[6px] rounded-[6px] bg-[rgba(17,17,17,0.05)]"
              >
                <div className="bg-primary w-[44px] h-[44px] rounded-full flex items-center justify-center">
                  <EarPhoneIcon />
                </div>
                <div className="flex flex-col gap-[6px]">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <p className="font-[600] text-[16px] leading-[150%] ">
                        {note.title}
                      </p>
                      <p className="text-[12px] leading-[140%] text-[#255BFF]">
                        {note.subtitle}
                      </p>
                    </div>
                    <p className="text-[14px] text-[#A9A9A9] leading-[150%]">
                      {note.timestamp}
                    </p>
                  </div>
                  <div className="text-[14px] font-poppins leading-[150%] ">
                    {note.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementPanel;
