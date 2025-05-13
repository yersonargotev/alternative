"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

// Simple debounce hook (create this file or add to lib/utils)
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

export default function FiltersAndSearch() {
    // Nuqs state hooks
    const [query, setQuery] = useQueryState(
        "q",
        parseAsString.withDefault("")
    );
    // const [tags, setTags] = useQueryState('tags', queryTypes.string.withDefault('').parse(v => v.split(',').filter(Boolean)).serialize(v => v.join(','))); // TODO: Implement tag selection UI
    const [sortBy, setSortBy] = useQueryState(
        "sort",
        parseAsString.withDefault("score")
    );
    const [order, setOrder] = useQueryState(
        "order",
        parseAsString.withDefault("desc")
    );

    // Debounce search input
    const [localQuery, setLocalQuery] = useState(query);
    const debouncedQuery = useDebounce(localQuery, 300); // 300ms debounce

    // Update URL query state when debounced value changes
    useEffect(() => {
        setQuery(debouncedQuery);
    }, [debouncedQuery, setQuery]);

    // Update local state if URL changes externally
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (query !== localQuery) {
            setLocalQuery(query);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const handleClearSearch = () => {
        setLocalQuery("");
        setQuery(""); // Update URL immediately
    };

    return (
        <div className="mb-6 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
                {/* Search Input */}
                <div className="md:col-span-2">
                    <Label
                        htmlFor="search-tools"
                        className="mb-1 block font-medium text-sm"
                    >
                        Search Tools
                    </Label>
                    <div className="relative">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search-tools"
                            type="search"
                            placeholder="Search by name or description (e.g., Figma, CLI)..."
                            value={localQuery}
                            onChange={(e) => setLocalQuery(e.target.value)}
                            className="w-full pl-8" // Padding left for icon
                        />
                        {localQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-7 w-7"
                                onClick={handleClearSearch}
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Sorting Controls */}
                <div>
                    <Label htmlFor="sort-by" className="mb-1 block font-medium text-sm">
                        Sort By
                    </Label>
                    <div className="flex gap-2">
                        <Select
                            value={sortBy}
                            onValueChange={(value) => setSortBy(value)}
                        >
                            <SelectTrigger id="sort-by" className="flex-grow">
                                <SelectValue placeholder="Sort by..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="score">Score</SelectItem>
                                <SelectItem value="stars">GitHub Stars</SelectItem>
                                <SelectItem value="createdAt">Date Added</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={order}
                            onValueChange={(value) => setOrder(value)}
                        >
                            <SelectTrigger id="sort-order" className="w-[80px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">Desc</SelectItem>
                                <SelectItem value="asc">Asc</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* TODO: Add Tag Filters */}
                {/* <div className="md:col-span-3">
                     <Label className="mb-1 block text-sm font-medium">Filter by Tags</Label>
                     <p className="text-sm text-muted-foreground">Tag filtering coming soon!</p>
                 </div> */}
            </div>
        </div>
    );
}
