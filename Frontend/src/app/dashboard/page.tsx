import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageWrapper } from "@/components/ui/PageWrapper";
import { MessageSquare, CreditCard, Phone, Folder } from "lucide-react";

const stats = [
    {
        title: "Credits Allotted",
        value: "1,000",
        icon: CreditCard,
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        title: "Credits Consumed",
        value: "450",
        icon: ActivityIcon,
        color: "text-orange-600",
        bg: "bg-orange-50",
    },
    {
        title: "Credits Remaining",
        value: "550",
        icon: CreditCard,
        color: "text-green-600",
        bg: "bg-green-50",
    },
    {
        title: "WhatsApp Number Added",
        value: "1",
        icon: Phone,
        color: "text-purple-600",
        bg: "bg-purple-50",
    },
];

function ActivityIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}

export default function DashboardPage() {
    return (
        <PageWrapper title="Dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Folders</h3>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {["Marketing", "Support", "Sales", "Internal"].map((folder) => (
                        <Card key={folder} className="cursor-pointer hover:shadow-md transition-shadow border-none shadow-sm">
                            <CardContent className="flex items-center p-6">
                                <Folder className="h-8 w-8 text-blue-400 mr-4" />
                                <span className="font-medium text-gray-700">{folder}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold mb-2 text-blue-800">Points to Remember</h3>
                <ul className="list-disc list-inside space-y-2 text-blue-700 text-sm">
                    <li>Ensure your WhatsApp number is connected to send messages.</li>
                    <li>Templates must be approved by Meta before sending broadcasts.</li>
                    <li>Check your credit balance regularly to avoid service interruption.</li>
                </ul>
            </div>
        </PageWrapper>
    );
}
