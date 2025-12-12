import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Filter } from "lucide-react";

interface TemplateFiltersProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    tabs: string[];
}

export default function TemplateFilters({
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    tabs
}: TemplateFiltersProps) {
    return (
        <div className="pb-4">
            <div className="flex items-center justify-between">
                <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab
                                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                            placeholder="Search templates..."
                            className="pl-9 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
