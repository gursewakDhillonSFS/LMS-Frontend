import { message as antdMessage } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

let messageInstance: MessageInstance = antdMessage;

export const setMessageInstance = (instance: MessageInstance) => {
  messageInstance = instance;
};

const getDuration = (options?: any): number | undefined => {
  if (typeof options === "number") return options;
  if (options && typeof options === "object" && typeof options.autoClose === "number") {
    return Math.round(options.autoClose / 1000);
  }
  return undefined;
};

export const toast = {
  success: (content: string | React.ReactNode, options?: any) => {
    const duration = getDuration(options);
    return messageInstance.success(content as any, duration);
  },
  error: (content: string | React.ReactNode, options?: any) => {
    const duration = getDuration(options);
    return messageInstance.error(content as any, duration);
  },
  warning: (content: string | React.ReactNode, options?: any) => {
    const duration = getDuration(options);
    return messageInstance.warning(content as any, duration);
  },
  warn: (content: string | React.ReactNode, options?: any) => {
    const duration = getDuration(options);
    return messageInstance.warning(content as any, duration);
  },
  info: (content: string | React.ReactNode, options?: any) => {
    const duration = getDuration(options);
    return messageInstance.info(content as any, duration);
  },
  loading: (content: string | React.ReactNode, options?: any) => {
    const duration = getDuration(options);
    return messageInstance.loading(content as any, duration);
  },
  dismiss: () => {
    messageInstance.destroy();
  },
};

export default toast;


