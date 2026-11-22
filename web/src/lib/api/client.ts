/*
Pseudocode:
Objective: expose typed HTTP methods for external JSON APIs.
Input: an absolute API base URL, optional headers, and request/response hooks.
Process: resolve the endpoint, run the request hook, call fetch, run the response
hook, and parse successful bodies; represent non-success responses as ApiError.
Output: get, post, put, patch, delete, and request methods; network and parse
errors remain rejected so callers cannot mistake failures for successful data.
*/
export interface ApiError extends Error {
  status: number;
  body: string;
}

interface ApiClientConfig {
  baseUrl: string;
  headers?: HeadersInit;
  onRequest?: (request: Request) => Request | Promise<Request>;
  onResponse?: (response: Response) => Response | Promise<Response>;
}

interface ApiClient {
  request: <TResponse>(
    path: string,
    init?: RequestInit,
  ) => Promise<TResponse>;
  get: <TResponse>(path: string, init?: RequestInit) => Promise<TResponse>;
  post: <TResponse, TBody>(
    path: string,
    body: TBody,
    init?: RequestInit,
  ) => Promise<TResponse>;
  put: <TResponse, TBody>(
    path: string,
    body: TBody,
    init?: RequestInit,
  ) => Promise<TResponse>;
  patch: <TResponse, TBody>(
    path: string,
    body: TBody,
    init?: RequestInit,
  ) => Promise<TResponse>;
  delete: <TResponse>(path: string, init?: RequestInit) => Promise<TResponse>;
}

const createApiError = (status: number, body: string): ApiError => {
  const error = Object.assign(
    new Error(body || `Request failed with status ${status}`),
    { name: "ApiError", status, body },
  );

  return error;
};

const createApiClient = (config: ApiClientConfig): ApiClient => {
  const request = async <TResponse>(
    path: string,
    init: RequestInit = {},
  ): Promise<TResponse> => {
    const headers = new Headers(config.headers);

    new Headers(init.headers).forEach((value, key) => {
      headers.set(key, value);
    });

    const endpoint = new URL(
      path.replace(/^\/+/, ""),
      `${config.baseUrl.replace(/\/+$/, "")}/`,
    );
    const initialRequest = new Request(endpoint, { ...init, headers });
    const outgoingRequest = config.onRequest
      ? await config.onRequest(initialRequest)
      : initialRequest;
    const initialResponse = await fetch(outgoingRequest);
    const response = config.onResponse
      ? await config.onResponse(initialResponse)
      : initialResponse;
    const body = await response.text();

    if (!response.ok) {
      throw createApiError(response.status, body);
    }

    if (!body) {
      return undefined as TResponse;
    }

    if (
      response.headers.get("content-type")?.includes("application/json") ||
      response.headers.get("content-type")?.includes("+json")
    ) {
      return JSON.parse(body) as TResponse;
    }

    return body as TResponse;
  };

  const sendJson = <TResponse, TBody>(
    method: "POST" | "PUT" | "PATCH",
    path: string,
    body: TBody,
    init: RequestInit = {},
  ): Promise<TResponse> => {
    const headers = new Headers(init.headers);

    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    return request<TResponse>(path, {
      ...init,
      method,
      headers,
      body: JSON.stringify(body),
    });
  };

  return {
    request,
    get: (path, init) => request(path, { ...init, method: "GET" }),
    post: (path, body, init) => sendJson("POST", path, body, init),
    put: (path, body, init) => sendJson("PUT", path, body, init),
    patch: (path, body, init) => sendJson("PATCH", path, body, init),
    delete: (path, init) => request(path, { ...init, method: "DELETE" }),
  };
};

export default createApiClient;
