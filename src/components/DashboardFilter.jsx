import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";

const DashboardFilter = ({ onFilterChange }) => {
  const [selectedFilter, setSelectedFilter] = useState("365");

  const filterOptions = [
    { label: "All", value: "365" },
    { label: "Past 7 Days", value: "7" },
    { label: "Past 30 Days", value: "30" },
    { label: "Past 90 Days", value: "90" },
  ];

  const handleChange = (value) => {
    setSelectedFilter(value);
    onFilterChange(value);
  };

  return (
    <ToggleGroup
      type="single"
      value={selectedFilter}
      onValueChange={handleChange}
      className="gap-1"
    >
      {filterOptions.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.label}
          variant="outline"
          size="sm"
          className="min-w-[80px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default DashboardFilter;