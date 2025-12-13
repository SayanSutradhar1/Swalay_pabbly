import { TableCell, TableRow } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Template } from "@/api/templates";
import { useRouter } from "next/navigation";

interface TemplateRowProps {
    template: Template;
}

export default function TemplateRow({ template }: TemplateRowProps) {
    const router = useRouter();

    const handleRowClick = () => {
        router.push(`/templates/${template.id}`);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/templates/${template.id}/edit`);
    };

    return (
        <TableRow
            key={template.id}
            onClick={handleRowClick}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
            <TableCell className="font-medium">{template.name}</TableCell>
            <TableCell>{template.category}</TableCell>
            <TableCell>{template.language}</TableCell>
            <TableCell>
                <Badge
                    variant={
                        template.status === "APPROVED"
                            ? "success"
                            : template.status === "PENDING"
                                ? "warning"
                                : template.status === "REJECTED"
                                    ? "destructive"
                                    : "secondary" // Draft
                    }
                >
                    {template.status}
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                {/* Edit removed as per requirement */}
            </TableCell>
        </TableRow>
    );
}
