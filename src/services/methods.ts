import Api from "./interceptor";

// GET API
export const getApi = async (url: string, params?: Record<string, string>) => {
  try {
    const result = await Api.get(url, { params });
    if (result.status >= 200 && result.status < 300) {
      return result.data;
    }
  } catch (error) {
    return (error as { response?: { data?: unknown } })?.response?.data;
  }
};

// PUT API (Update Data)
export const putApi = async (url: string, data?: object) => {
  try {
    const result = await Api.put(url, data);
    if (result.status >= 200 && result.status < 300) {
      return result.data;
    }
  } catch (error) {
    return (error as { response?: { data?: unknown } })?.response?.data;
  }
};

// PATCH API (Partial Update)
export const patchApi = async (url: string, data: object) => {
  try {
    const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    const result = await Api.patch(url, data, { headers });
    if (result.status >= 200 && result.status < 300) {
      return result.data;
    }
  } catch (error) {
    return (error as { response?: { data?: unknown } })?.response?.data;
  }
};

// POST API (Send Data)
export const postApi = async (url: string, data: object) => {
  try {
    const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    
    const result = await Api.post(url, data, { headers });

    if (result.status >= 200 && result.status < 300) {
      return result.data;
    }
  } catch (error) {
    return (error as { response?: { data?: unknown } })?.response?.data;
  }
};


// DELETE API
export const deleteApi = async (url: string, data?: object) => {
  try {
    const result = await Api.delete(url, { data });
    if (result.status >= 200 && result.status < 300) {
      return result.data;
    }
  } catch (error) {
    return (error as { response?: { data?: unknown } })?.response?.data;
  }
};

