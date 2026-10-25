import axios from "axios";

export class NoteHubApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "NoteHubApiError";
  }
}

export const noteHubApi = axios.create({
  baseURL: "https://notehub-public.goit.study/api",
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_NOTEHUB_TOKEN}`,
  },
});

// Keep request headers and credentials out of error boundaries.
noteHubApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;
    const message = status
      ? `NoteHub request failed (${status}).`
      : "Could not connect to NoteHub.";
    return Promise.reject(new NoteHubApiError(message, status));
  },
);
