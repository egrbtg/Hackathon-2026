// React Query hooks. Components use these, never the client directly.
// Scores come from the backend; sortHits only re-orders, never recomputes.
// React Query hooks. Components use these, never the client directly.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories, getSituation, getSource, ingest, searchSituations } from "./client";
export function useSituationSearch(req) {
    return useQuery({
        queryKey: ["situations", req],
        queryFn: () => searchSituations(req),
        enabled: !!req && req.description.trim().length > 0,
    });
}
export function useSituation(id) {
    return useQuery({
        queryKey: ["situation", id],
        queryFn: () => getSituation(id),
        enabled: !!id,
    });
}
/** Only fetches when a pointer key is set, i.e. when the user clicks "view source". */
export function useSource(key) {
    return useQuery({
        queryKey: ["source", key],
        queryFn: () => getSource(key),
        enabled: !!key,
        staleTime: 5 * 60_000,
    });
}
export function useCategories() {
    return useQuery({ queryKey: ["categories"], queryFn: getCategories, staleTime: 60_000 });
}
export function useIngest() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (req) => ingest(req),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["situations"] });
            qc.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}
export function sortHits(hits, key) {
    return [...hits].sort((a, b) => b[key] - a[key]);
}
