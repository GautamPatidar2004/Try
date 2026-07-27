import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Users } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import UserMenuDropdown from "./UserMenuDropdown";
import LanguageSelector from "./LanguageSelector";
import { useHostApplication } from "@/hooks/useHostApplication";
interface AirbnbHeaderProps {
  onSearch: (query: string, location?: string, dates?: string, guests?: number) => void;
}
const AirbnbHeader = ({
  onSearch
}: AirbnbHeaderProps) => {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const {
    submitHostApplication,
    isSubmitting
  } = useHostApplication();
  const handleSearch = () => {
    const dateRange = checkIn && checkOut ? `${format(checkIn, "MMM dd")} - ${format(checkOut, "MMM dd")}` : undefined;
    onSearch(location, location, dateRange, guests);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const adjustGuests = (increment: boolean) => {
    setGuests(prev => increment ? prev + 1 : Math.max(1, prev - 1));
  };
  const handleBecomeHost = () => {
    submitHostApplication();
  };
  return <header className="bg-background border-b border-border sticky top-0 z-20 my-[6px] py-[5px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
      </div>
    </header>;
};
export default AirbnbHeader;