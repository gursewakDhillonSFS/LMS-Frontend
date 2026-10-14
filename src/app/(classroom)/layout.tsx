"use client";

import React, { ReactNode } from "react";

const ClassroomLayout = ({ children }: { children: ReactNode }) => {
  return <div className="min-h-screen bg-[#F8FAFC]">{children}</div>;
};

export default ClassroomLayout;
