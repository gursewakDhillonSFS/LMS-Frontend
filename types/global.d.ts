
declare global {
  interface Window {
    FB: Facebook.FB;
    fbAsyncInit: () => void;
  }

  namespace Facebook {
    interface InitParams {
      appId: string;
      cookie?: boolean;
      xfbml?: boolean;
      version: string;
    }

    interface AuthResponse {
      accessToken: string;
      expiresIn: string;
      signedRequest: string;
      userID: string;
    }

    interface LoginStatusResponse {
      status: "connected" | "not_authorized" | "unknown";
      authResponse?: AuthResponse;
    }

    interface FB {
      init: (params: InitParams) => void;
      login: (
        callback: (response: LoginStatusResponse) => void,
        options?: { scope: string }
      ) => void;
      getLoginStatus: (
        callback: (response: LoginStatusResponse) => void
      ) => void;
    }
  }
}

export {};
