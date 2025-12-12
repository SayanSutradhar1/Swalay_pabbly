"use client";

import { PageWrapper } from "@/components/ui/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, UserCheck, UserX, Users } from "lucide-react";
import { useGetContacts } from "@/hooks/useApi";

export default function ContactsPage() {
    const { data: contacts } = useGetContacts();

    return (
        <PageWrapper
            title="Contacts"
            actions={
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Contact
                </Button>
            }
        >
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Contacts</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Opted-in</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,100</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Opted-out</CardTitle>
                        <UserX className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">134</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                <Card className="h-fit border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Contact Lists</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {["All Contacts", "VIP Customers", "New Leads", "Inactive"].map((list) => (
                            <Button key={list} variant="ghost" className="w-full justify-start font-normal">
                                {list}
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">All Contacts</CardTitle>
                        <div className="w-64 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input placeholder="Search contacts..." className="pl-9" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contacts?.map((contact) => (
                                    <TableRow key={contact.id}>
                                        <TableCell className="font-medium">{contact.name}</TableCell>
                                        <TableCell>{contact.phone}</TableCell>
                                        <TableCell>
                                            <Badge variant={contact.status === "opted-in" ? "success" : "destructive"}>
                                                {contact.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{contact.created_at}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    );
}
