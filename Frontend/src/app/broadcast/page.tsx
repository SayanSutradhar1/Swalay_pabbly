"use client";

import { PageWrapper } from "@/components/ui/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Radio, Send, Clock, CheckCircle } from "lucide-react";
import { useGetBroadcasts } from "@/hooks/useApi";

export default function BroadcastPage() {
    const { data: broadcasts } = useGetBroadcasts();

    return (
        <PageWrapper
            title="Broadcast"
            actions={
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Broadcast
                </Button>
            }
        >
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Campaigns</CardTitle>
                        <Radio className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Live</CardTitle>
                        <Send className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Sent</CardTitle>
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Scheduled</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Campaigns</CardTitle>
                    <div className="w-64 relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input placeholder="Search campaigns..." className="pl-9" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campaign Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Sent</TableHead>
                                <TableHead>Delivered</TableHead>
                                <TableHead>Read</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {broadcasts?.map((broadcast) => (
                                <TableRow key={broadcast.id}>
                                    <TableCell className="font-medium">{broadcast.name}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                broadcast.status === "Sent"
                                                    ? "success"
                                                    : broadcast.status === "Scheduled"
                                                        ? "warning"
                                                        : "default"
                                            }
                                        >
                                            {broadcast.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{broadcast.sent}</TableCell>
                                    <TableCell>{broadcast.delivered}</TableCell>
                                    <TableCell>{broadcast.read}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            View Report
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </PageWrapper>
    );
}
