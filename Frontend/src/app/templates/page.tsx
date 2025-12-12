"use client";

import { PageWrapper } from "@/components/ui/PageWrapper";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/DataTable";
import { Plus, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchTemplates, syncTemplates, Template } from "@/api/templates";
import TemplateRow from "@/components/templates/TemplateRow";
import TemplateFilters from "@/components/templates/TemplateFilters";
import { useRouter } from "next/navigation";

const tabs = ["All", "Approved", "Pending", "Draft", "Rejected"];

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const data = await fetchTemplates();
            setTemplates(data);
        } catch (error) {
            console.error("Failed to load templates", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await syncTemplates();
            await loadTemplates();
        } catch (error) {
            console.error("Failed to sync templates", error);
        } finally {
            setSyncing(false);
        }
    };

    const handleAddTemplate = () => {
        router.push("/templates/new");
    };

    const filteredTemplates = templates.filter((template) => {
        const matchesTab = activeTab === "All" || template.status.toUpperCase() === activeTab.toUpperCase();
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <PageWrapper
            title="Templates"
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSync} disabled={syncing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                        {syncing ? "Syncing..." : "Sync Templates"}
                    </Button>
                    <Button onClick={handleAddTemplate}>
                        <Plus className="mr-2 h-4 w-4" /> Add Template
                    </Button>
                </div>
            }
        >
            <Card className="border-none shadow-sm">
                <CardHeader className="pb-4">
                    <TemplateFilters
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        tabs={tabs}
                    />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Template Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Language</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        Loading templates...
                                    </TableCell>
                                </TableRow>
                            ) : filteredTemplates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        No templates found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTemplates.map((template) => (
                                    <TemplateRow key={template.id} template={template} />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </PageWrapper>
    );
}
