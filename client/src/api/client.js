// One function per backend endpoint. Relative paths: works locally (Vite proxy) and in the Databricks App.
/** @typedef {import("./types").SearchRequest} SearchRequest */
import * as mocks from "./mocks/handlers";
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";
async function http(path, init) {
    const res = await fetch(path, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText}${body ? `: ${body}` : ""}`);
    }
    return res.json();
}
// The backend scores on 0..1000; the UI works in 0..1. Mocks are already 0..1.
const SCORE_SCALE = 1000;
function normalizeScores(hit) {
    return {
        ...hit,
        relevancy: hit.relevancy / SCORE_SCALE,
        recency: hit.recency / SCORE_SCALE,
        score: hit.score / SCORE_SCALE,
    };
}
export async function searchSituations(req) {
    if (USE_MOCKS)
        return mocks.mockSearch(req);
    const res = await http("/api/situations/search", { method: "POST", body: JSON.stringify(req) });
    return { ...res, results: res.results.map(normalizeScores) };
}
export async function getSituation(id) {
    if (USE_MOCKS)
        return mocks.mockGetSituation(id);
    return normalizeScores(await http(`/api/situations/${encodeURIComponent(id)}`));
}
export function getSource(key) {
    if (USE_MOCKS)
        return mocks.mockGetSource(key);
    return http(`/api/sources/${encodeURIComponent(key)}`);
}
export function getCategories() {
    if (USE_MOCKS)
        return mocks.mockGetCategories();
    return http("/api/categories");
}
export async function ingest(req) {
    if (USE_MOCKS)
        return mocks.mockIngest(req);
    const res = await http("/api/ingest", { method: "POST", body: JSON.stringify(req) });
    return { ...res, situations: res.situations.map(normalizeScores) };
}
