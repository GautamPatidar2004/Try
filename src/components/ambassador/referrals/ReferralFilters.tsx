import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Search, Download, X } from "lucide-react";
import { ReferralFilters as FilterType, ConversionStage } from "@/hooks/useAmbassadorReferrals";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";

interface ReferralFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onExport?: () => void;
}

export const ReferralFilters = ({ 
  filters, 
  onFiltersChange,
  onExport 
}: ReferralFiltersProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.dateRange ? { from: filters.dateRange.from, to: filters.dateRange.to } : undefined
  );

  const handleStageChange = (value: string) => {
    onFiltersChange({
      ...filters,
      conversionStage: value as ConversionStage | 'all',
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value,
    });
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onFiltersChange({
        ...filters,
        dateRange: { from: range.from, to: range.to },
      });
    } else if (!range) {
      onFiltersChange({
        ...filters,
        dateRange: undefined,
      });
    }
  };

  const clearFilters = () => {
    setDateRange(undefined);
    onFiltersChange({});
  };

  const hasFilters = filters.search || filters.conversionStage || filters.dateRange;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search referrals..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Conversion Stage Filter */}
      <Select
        value={filters.conversionStage || 'all'}
        onValueChange={handleStageChange}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          <SelectItem value="clicked">Clicked</SelectItem>
          <SelectItem value="signup">Signed Up</SelectItem>
          <SelectItem value="listing">Listed</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="subscription">Subscribed</SelectItem>
        </SelectContent>
      </Select>

      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
            <Calendar className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                </>
              ) : (
                format(dateRange.from, "MMM d, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}

      {/* Export Button */}
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport} className="ml-auto">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      )}
    </div>
  );
};
