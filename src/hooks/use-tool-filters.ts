import { create } from "zustand";
// import { useQueryState, queryTypes } from 'nuqs'; // Import Nuqs later

// Example using Zustand for client-side filter state management
// This could alternatively be managed entirely by Nuqs in the URL

interface ToolFilterState {
	searchTerm: string;
	tags: string[];
	sortBy: "score" | "stars" | "createdAt";
	order: "asc" | "desc";
	page: number;
	setSearchTerm: (term: string) => void;
	setTags: (tags: string[]) => void;
	setSortBy: (sort: "score" | "stars" | "createdAt") => void;
	setOrder: (order: "asc" | "desc") => void;
	setPage: (page: number) => void;
	resetFilters: () => void;
}

const useToolFilterStore = create<ToolFilterState>((set) => ({
	searchTerm: "",
	tags: [],
	sortBy: "score",
	order: "desc",
	page: 1,
	setSearchTerm: (term) => set({ searchTerm: term, page: 1 }), // Reset page on search change
	setTags: (tags) => set({ tags: tags, page: 1 }), // Reset page on tag change
	setSortBy: (sort) => set({ sortBy: sort }),
	setOrder: (order) => set({ order: order }),
	setPage: (page) => set({ page: page }),
	resetFilters: () =>
		set({ searchTerm: "", tags: [], sortBy: "score", order: "desc", page: 1 }),
}));

export default useToolFilterStore;

// --- Nuqs Integration Placeholder (To be implemented in Part 9) ---
/*
export function useToolFiltersNuqs() {
  const [searchTerm, setSearchTerm] = useQueryState('q', queryTypes.string.withDefault(''));
  const [tags, setTags] = useQueryState('tags', queryTypes.string.withDefault('').parse(v => v.split(',').filter(Boolean)).serialize(v => v.join(',')));
  const [sortBy, setSortBy] = useQueryState('sort', queryTypes.stringEnum(['score', 'stars', 'createdAt']).withDefault('score'));
  const [order, setOrder] = useQueryState('order', queryTypes.stringEnum(['asc', 'desc']).withDefault('desc'));
  const [page, setPage] = useQueryState('page', queryTypes.integer.withDefault(1));

  // ... return state and setters ...
}
*/
