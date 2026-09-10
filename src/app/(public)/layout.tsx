"use client";
import AuthModal from "@/components/AuthModal";
import Footer from "@/components/Footer";
import ChangePassword from "@/components/form/ChangePassword";
import ForgetPassword from "@/components/form/ForgetPassword";
import OtpVerification from "@/components/form/OtpVerification";
import SignInForm from "@/components/form/SignInForm";
import SignUpForm from "@/components/form/SignUpForm";
import Header from "@/components/Header";
import useCategories from "@/hooks/useCategories";
import {
  setChangePass,
  setForgotPass,
  setOtpVerify,
  setSignin,
  setSignup,
} from "@/redux/slices/AuthModalSlice";
import {
  setActiveCategory,
  setCategories,
} from "@/redux/slices/CategoriesSlice";
import { RootState } from "@/redux/store";
import { RoutePaths } from "@/utils/enums";
import { usePathname } from "next/navigation";
import React, { ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "@/context/I18nContext";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const login = useSelector((state: RootState) => state.authmodal.signin);
  const signUp = useSelector((state: RootState) => state.authmodal.signup);
  const otp = useSelector((state: RootState) => state.authmodal.otpVerify);
  const changePass = useSelector(
    (state: RootState) => state.authmodal.changePass
  );
  const forgetPassword = useSelector(
    (state: RootState) => state.authmodal.forgotPass
  );
  const pathname = usePathname();
  const { data, loading: categoryLoading } = useCategories();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      dispatch(setCategories(data));
    }
  }, [categoryLoading, data, dispatch]);

  useEffect(() => {
    if (data && !pathname.includes(RoutePaths?.Browse))
      dispatch(setActiveCategory(data?.[0]?.category_id));
    dispatch(setSignin(false));
    dispatch(setSignup(false));
    dispatch(setForgotPass(false));
    dispatch(setOtpVerify(false));
    dispatch(setChangePass(false));
  }, [pathname, categoryLoading, data, dispatch]);

  return (
    <div>
      {login && (
        <AuthModal
          open={login}
          onClose={() => dispatch(setSignin(false))}
          title={t("auth.login.title")}
          subtitle={t("auth.login.subtitle")}
        >
          <SignInForm
            onSignUp={() => {
              dispatch(setSignin(false));
              dispatch(setSignup(true));
            }}
            onForgotPassword={() => {
              dispatch(setSignin(false));
              dispatch(setForgotPass(true));
            }}
          />
        </AuthModal>
      )}
      {signUp && (
        <AuthModal
          open={signUp}
          onClose={() => dispatch(setSignup(false))}
          title={t("auth.signup.title")}
          subtitle={t("auth.signup.subtitle")}
        >
          <SignUpForm
            onSignin={() => {
              dispatch(setSignup(false));
              dispatch(setSignin(true));
            }}
          />
        </AuthModal>
      )}
      {forgetPassword && (
        <AuthModal
          open={forgetPassword}
          onClose={() => dispatch(setForgotPass(false))}
          title={t("auth.forgot.title")}
          centered={true}
          subtitle={t("auth.forgot.subtitle")}
        >
          <ForgetPassword
            onOtp={() => {
              dispatch(setForgotPass(false));
              dispatch(setOtpVerify(true));
            }}
            onSignin={() => {
              dispatch(setForgotPass(false));
              dispatch(setSignin(true));
            }}
          />
        </AuthModal>
      )}
      {otp && (
        <AuthModal
          open={otp}
          onClose={() => dispatch(setOtpVerify(false))}
          title={t("auth.otp.title")}
          centered={true}
          subtitle={t("auth.otp.subtitle")}
        >
          <OtpVerification
            onSignin={() => {
              dispatch(setOtpVerify(false));
              dispatch(setSignin(true));
            }}
          />
        </AuthModal>
      )}
      {changePass && (
        <AuthModal
          open={changePass}
          onClose={() => dispatch(setChangePass(false))}
          title={t("auth.changePassword.title")}
          centered={true}
          subtitle={t("auth.changePassword.subtitle")}
        >
          <ChangePassword
            onSignin={() => {
              dispatch(setChangePass(false));
              dispatch(setSignin(true));
            }}
          />
        </AuthModal>
      )}
      {!(
        pathname.includes(RoutePaths?.Onboarding) ||
        pathname.includes(RoutePaths?.BecomeInstructor)
      ) && <Header />}
      {children}
      {!(
        pathname.includes(RoutePaths?.Onboarding) ||
        pathname.includes(RoutePaths?.BecomeInstructor)
      ) && <Footer />}
    </div>
  );
};

export default PublicLayout;
