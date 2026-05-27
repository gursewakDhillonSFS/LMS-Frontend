import { useEffect, useState } from "react";

export const useFacebookSdk = () => {
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!fbAppId) {
      console.error("Missing Facebook App ID");
      return;
    }

    if (window.FB) {
      setReady(true);
      return;
    }

    window.fbAsyncInit = () => {
      window.FB.init({
        appId: fbAppId,
        cookie: true,
        xfbml: false,
        version: "v18.0",
      });
      setReady(true);
    };

    const scriptId = "facebook-jssdk";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  return isReady;
};
