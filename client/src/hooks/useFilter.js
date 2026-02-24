import { useState, useMemo } from 'react';

export function useFilter(items, filterKey = 'category') {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesFilter = filter === 'all' || item[filterKey] === filter;
      const matchesSearch =
        !search ||
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(search.toLowerCase()),
        );
      return matchesFilter && matchesSearch;
    });
  }, [items, filter, filterKey, search]);

  return {
    filter,
    setFilter,
    search,
    setSearch,
    filteredItems,
  };
}
