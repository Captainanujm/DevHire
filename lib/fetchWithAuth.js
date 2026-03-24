// Client-side fetch wrapper with automatic token refresh
export async function fetchWithAuth(url, options = {}) {
    let res = await fetch(url, { ...options, credentials: "include" });

    // If 401, attempt to refresh the token and retry once
    if (res.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
        });

        if (refreshRes.ok) {
            // Retry original request with new token
            res = await fetch(url, { ...options, credentials: "include" });
        } else {
            // Refresh failed — redirect to login
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
    }

    return res;
}
