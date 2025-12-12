import { Search } from "lucide-react";
import { Input } from "./Input";

interface SearchBarProps {
    placeholder?: string;
    className?: string;
}

export function SearchBar({ placeholder = "Search...", className }: SearchBarProps) {
    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
                type="search"
                placeholder={placeholder}
                className="pl-9 bg-white"
            />
        </div>
    );
}
