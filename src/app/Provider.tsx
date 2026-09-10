"use client";

import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import { store, persistor } from "@/redux/store";
import GlobalAnnouncementListener from "@/components/GlobalAnnouncementListener";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <ReduxProvider store={store}>
        <PersistGate
          loading={
            <p className="w-full h-screen flex items-center justify-center">
              Loading...
            </p>
          }
          persistor={persistor}
        >
          <GlobalAnnouncementListener />
          {children}
        </PersistGate>
      </ReduxProvider>
    </>
  );
}
