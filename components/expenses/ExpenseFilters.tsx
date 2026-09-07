'use client';

import React, { useState } from 'react';
import { Search, Calendar, SlidersHorizontal, X } from 'lucide-react';
import { ExpenseFilters as FilterTypes, Tag } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface ExpenseFiltersProps {
  filters: FilterTypes;
  onFilterChange: <K extends keyof FilterTypes>(key: K, value: FilterTypes[K]) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  tags: Tag[];
}

export function ExpenseFilters({
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  tags,
}: ExpenseFiltersProps) {
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);

  // Local state for advanced modal to prevent immediate filter changes
  const [localMin, setLocalMin] = useState(filters.minAmount);
  const [localMax, setLocalMax] = useState(filters.maxAmount);
  const [localSort, setLocalSort] = useState(filters.sort);

  const applyAdvanced = () => {
    onFilterChange('minAmount', localMin);
    onFilterChange('maxAmount', localMax);
    onFilterChange('sort', localSort);
    setShowAdvancedModal(false);
  };

  const dateOptions: { label: string; value: FilterTypes['dateRange'] }[] = [
    { label: 'This Month', value: 'this-month' },
    { label: 'Last Month', value: 'last-month' },
    { label: 'This Year', value: 'this-year' },
    { label: 'Custom Range', value: 'custom' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Top Row: Search and actions on desktop, stacked on mobile */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-auto md:flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Date Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="h-11 px-4 inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Calendar size={16} className="text-gray-500" />
              {dateOptions.find((o) => o.value === filters.dateRange)?.label}
            </button>

            {showDateDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 overflow-hidden">
                <div className="p-2 flex flex-col gap-1">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onFilterChange('dateRange', opt.value);
                        if (opt.value !== 'custom') setShowDateDropdown(false);
                      }}
                      className={`text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                        filters.dateRange === opt.value
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {filters.dateRange === 'custom' && (
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
                    <Input
                      label="From"
                      type="date"
                      value={filters.customFrom}
                      onChange={(e) => onFilterChange('customFrom', e.target.value)}
                    />
                    <Input
                      label="To"
                      type="date"
                      value={filters.customTo}
                      onChange={(e) => onFilterChange('customTo', e.target.value)}
                    />
                    <Button size="sm" onClick={() => setShowDateDropdown(false)} className="mt-1">
                      Done
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Advanced Filters Button */}
          <button
            onClick={() => {
              setLocalMin(filters.minAmount);
              setLocalMax(filters.maxAmount);
              setLocalSort(filters.sort);
              setShowAdvancedModal(true);
            }}
            className="h-11 px-4 inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal size={16} className="text-gray-500" />
            Advanced
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="h-11 px-3 inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Type Chips */}
      <div className="flex items-center gap-2">
        {(['all', 'normal', 'recurring'] as const).map((type) => (
          <button
            key={type}
            onClick={() => onFilterChange('type', type)}
            className={`
              h-8 px-4 rounded-full text-xs font-medium capitalize transition-colors
              ${
                filters.type === type
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Tag Filter Chips */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mr-1">Tag:</span>
          <button
            onClick={() => onFilterChange('tag', '')}
            className={`
              h-7 px-3 rounded-full text-xs font-medium transition-colors
              ${!filters.tag ? 'bg-indigo-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
            `}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t.id}
              onClick={() => onFilterChange('tag', t.name)}
              className={`
                h-7 px-3 rounded-full text-xs font-medium transition-colors
                ${filters.tag === t.name ? 'bg-indigo-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Advanced Modal */}
      <Modal
        open={showAdvancedModal}
        onClose={() => setShowAdvancedModal(false)}
        title="Advanced Filters"
      >
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Amount"
              type="number"
              prefix="₹"
              placeholder="0"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
            />
            <Input
              label="Max Amount"
              type="number"
              prefix="₹"
              placeholder="10000"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Sort By</label>
            <select
              value={localSort}
              onChange={(e) => setLocalSort(e.target.value as FilterTypes['sort'])}
              className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          <div className="flex gap-3 mt-2">
            <Button variant="secondary" onClick={() => setShowAdvancedModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={applyAdvanced} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
