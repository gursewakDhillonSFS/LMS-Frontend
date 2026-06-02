import CommonButton from "@/components/CommonButton";
import { RoutePaths } from "@/utils/enums";
import { ClockWheelIcon, CloseIcon } from "@/utils/icons";
import { Modal } from "antd";
import { useRouter } from "next/navigation";
import React from "react";

export interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  centered?: boolean;
}

const QuizModal: React.FC<QuizModalProps> = ({
  open,
  onClose,
  centered = false,
}) => {
  const router = useRouter();
  const handleRedirect = () => {
    router.push(`${RoutePaths?.MyCourses}/course-details/course-quiz`);
  };
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered={centered}
      closable={false}
      prefixCls="common-modal"
      className={`relative ${!centered && "!top-10"}`}
    >
      <button
        onClick={onClose}
        className="cursor-pointer absolute w-[27px] h-[27px] bg-primary rounded-full text-white flex items-center justify-center -top-[10px] -right-[10px] text-sm"
      >
        <CloseIcon />
      </button>
      <div className="flex flex-col items-center gap-[12px] justify-center text-center my-16">
        <h2 className="text-[32px] font-[700] leading-[120%]">
          Start the quizzes now!
        </h2>
        <p className="text-[16px] font-[400] leading-[150%] text-[#9A9A9A]">
          Lorem ipsum dolor sit amet consectetur. Elementum consectetur facilisi
        </p>
        <CommonButton
          text={"Lets Go! 🚀"}
          className="!w-[40%] !bg-secondary !text-white"
          onClick={handleRedirect}
        />

        <div className="flex items-center justify-center gap-1">
          <ClockWheelIcon color="black" />{" "}
          <span className=" text-[16px] leading-[150%]">Takes 1 Hrs</span>
        </div>
      </div>
    </Modal>
  );
};

export default QuizModal;
