import { unzlib, strFromU8 } from 'fflate';

/**
 * Converts a GitHub tree URL to a raw content base URL.
 * Example: https://github.com/user/repo/tree/main/path -> https://raw.githubusercontent.com/user/repo/main/path
 */
export function getGitHubRawBaseUrl(githubUrl: string): string {
    try {
        const url = new URL(githubUrl);
        if (url.hostname !== "github.com") return githubUrl;

        const parts = url.pathname.split("/").filter(Boolean);
        // Expected parts: [owner, repo, "tree", branch, ...path]
        if (parts.length >= 4 && parts[2] === "tree") {
            const owner = parts[0];
            const repo = parts[1];
            const branch = parts[3];
            const path = parts.slice(4).join("/");
            return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
        }
        return githubUrl;
    } catch (e) {
        return githubUrl;
    }
}

/**
 * Helper to convert Base64 back to Uint8Array
 */
function base64ToUint8(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/**
 * Fetches JSON from a URL with basic error handling.
 * Supports decompression if the content starts with 'c:'.
 */
export async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const text = await response.text();

    // Check for compression prefix 'c:'
    if (text.startsWith('c:')) {
        try {
            const compressed = base64ToUint8(text.slice(2));
            const decompressed = await new Promise<Uint8Array>((resolve, reject) => {
                unzlib(compressed, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });
            return JSON.parse(strFromU8(decompressed)) as T;
        } catch (e) {
            console.error('Failed to decompress fetched JSON:', e);
            throw new Error('Failed to decompress fetched JSON');
        }
    }

    try {
        return JSON.parse(text) as T;
    } catch (e) {
        console.error('Failed to parse fetched JSON:', e);
        throw new Error('Failed to parse fetched JSON');
    }
}
