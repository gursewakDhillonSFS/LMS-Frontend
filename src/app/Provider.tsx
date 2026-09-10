"use client";

import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ConfigProvider, App, Spin } from "antd";
import { store, persistor } from "@/redux/store";
import GlobalAnnouncementListener from "@/components/GlobalAnnouncementListener";

/* ============================================
   Ant Design Theme — Premium, Calm, Professional
   ============================================ */
const antdTheme = {
  token: {
    /* Colors */
    colorPrimary: "#315CFF",
    colorSuccess: "#2E8B68",
    colorWarning: "#B7791F",
    colorError: "#D64545",
    colorInfo: "#315CFF",

    /* Text */
    colorText: "#17191C",
    colorTextSecondary: "#667085",
    colorTextTertiary: "#98A2B3",
    colorTextQuaternary: "#D0D5DD",

    /* Backgrounds */
    colorBgContainer: "#FFFFFF",
    colorBgLayout: "#F8F9FB",
    colorBgElevated: "#FFFFFF",
    colorBgTextHover: "#F3F4F6",

    /* Borders */
    colorBorder: "#E4E7EC",
    colorBorderSecondary: "#F3F4F6",

    /* Radius */
    borderRadius: 8,
    borderRadiusLG: 10,
    borderRadiusSM: 6,

    /* Font */
    fontFamily:
      "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,

    /* Spacing */
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,

    /* Shadows */
    boxShadow:
      "0 1px 3px rgba(16, 24, 40, 0.1), 0 1px 2px rgba(16, 24, 40, 0.06)",
    boxShadowSecondary:
      "0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06)",

    /* Motion */
    motionDurationMid: "200ms",
    motionDurationSlow: "300ms",

    /* Line */
    lineHeight: 1.5,
    lineWidth: 1,
    lineType: "solid" as const,

    /* Control */
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      fontWeight: 500,
      primaryShadow: "none",
      defaultBorderColor: "#E4E7EC",
      paddingInline: 16,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      activeBorderColor: "#315CFF",
      hoverBorderColor: "#315CFF",
      activeShadow: "0 0 0 2px rgba(49, 92, 255, 0.1)",
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Table: {
      headerBg: "#FFFFFF",
      headerColor: "#667085",
      borderColor: "#E4E7EC",
      rowHoverBg: "#F9FAFB",
      headerSplitColor: "transparent",
      fontSize: 14,
    },
    Card: {
      borderRadiusLG: 10,
      paddingLG: 20,
      boxShadow: "none",
    },
    Modal: {
      borderRadiusLG: 12,
      paddingMD: 24,
    },
    Drawer: {
      paddingLG: 24,
    },
    Tabs: {
      inkBarColor: "#315CFF",
      itemActiveColor: "#315CFF",
      itemSelectedColor: "#315CFF",
      itemHoverColor: "#274BD1",
    },
    Menu: {
      itemBorderRadius: 8,
      itemHeight: 40,
      itemMarginInline: 8,
    },
    Badge: {
      colorBgContainer: "#D64545",
    },
    Tag: {
      borderRadiusSM: 999,
    },
    Tooltip: {
      borderRadius: 8,
    },
    Message: {
      borderRadiusLG: 8,
    },
    Collapse: {
      borderRadiusLG: 10,
      headerBg: "#FFFFFF",
    },
    Progress: {
      defaultColor: "#315CFF",
      remainingColor: "#E4E7EC",
    },
    Skeleton: {
      borderRadiusSM: 8,
    },
  },
};

import { setMessageInstance } from "@/utils/toast";

function AntdAppBridge() {
  const { message } = App.useApp();
  React.useEffect(() => {
    setMessageInstance(message);
  }, [message]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={antdTheme}>
      <App>
        <AntdAppBridge />
        <ReduxProvider store={store}>
          <PersistGate
            loading={
              <div className="w-full h-screen flex items-center justify-center" style={{ backgroundColor: "#F8F9FB" }}>
                <Spin size="large" />
              </div>
            }
            persistor={persistor}
          >
            <GlobalAnnouncementListener />
            {children}
          </PersistGate>
        </ReduxProvider>
      </App>
    </ConfigProvider>
  );
}
