'use client';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { parseAsInteger, parseAsString } from 'nuqs';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Validation schema
const searchFormSchema = z.object({
    searchQuery: z.string().optional(),
});

// Define valid sort options
type SortOption = 'score' | 'stars' | 'createdAt';
type OrderOption = 'asc' | 'desc';

// Valid options arrays for runtime checks
const VALID_SORT_OPTIONS: SortOption[] = ['score', 'stars', 'createdAt'];
const VALID_ORDER_OPTIONS: OrderOption[] = ['asc', 'desc'];

export default function FiltersAndSearch() {
    // Get state from URL
    const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''));
    const [sortBy, setSortBy] = useQueryState('sort', parseAsString.withDefault('score'));
    const [order, setOrder] = useQueryState('order', parseAsString.withDefault('desc'));
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

    // Create form
    const form = useForm<z.infer<typeof searchFormSchema>>({
        resolver: zodResolver(searchFormSchema),
        defaultValues: {
            searchQuery: query || '',
        },
    });

    // Handle search form submission
    const onSubmit = (data: z.infer<typeof searchFormSchema>) => {
        setQuery(data.searchQuery || '');
        setPage(1); // Reset to first page on new search
    };

    // Handle sort change
    const handleSortChange = (value: string) => {
        if (VALID_SORT_OPTIONS.includes(value as SortOption)) {
            setSortBy(value as SortOption);
            setPage(1); // Reset to first page on sort change
        }
    };

    // Handle order change
    const handleOrderChange = (value: string) => {
        if (VALID_ORDER_OPTIONS.includes(value as OrderOption)) {
            setOrder(value as OrderOption);
            setPage(1); // Reset to first page on order change
        }
    };

    return (
        <div className="bg-card border rounded-lg p-4 mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
                {/* Search Form */}
                <div className="flex-grow">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full space-x-2">
                            <FormField
                                control={form.control}
                                name="searchQuery"
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <FormControl>
                                            <div className="relative w-full">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="search"
                                                    placeholder="Search tools..."
                                                    className="w-full pl-8"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" variant="default">
                                Search
                            </Button>
                        </form>
                    </Form>
                </div>

                {/* Sort Controls */}
                <div className="flex flex-wrap gap-2">
                    <Select value={sortBy || 'score'} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="score">Score</SelectItem>
                            <SelectItem value="stars">GitHub Stars</SelectItem>
                            <SelectItem value="createdAt">Newest</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={order || 'desc'} onValueChange={handleOrderChange}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="desc">Descending</SelectItem>
                            <SelectItem value="asc">Ascending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
} 