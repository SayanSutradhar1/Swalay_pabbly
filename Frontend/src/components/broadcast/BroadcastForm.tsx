"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import PhoneInput from './PhoneInput';
import TemplateSelectorModal from './TemplateSelectorModal';
import { ChevronDown, Info } from 'lucide-react';

// Schema Definition
const broadcastSchema = z.object({
    broadcastType: z.string().min(1, "Broadcast type is required"),
    broadcastName: z.string().min(1, "Broadcast name is required"),
    contactList: z.string().min(1, "Contact list is required"),
    messageType: z.enum(["template", "regular"]),
    templateId: z.string().optional(),
    templateName: z.string().optional(),
    testUsername: z.string().optional(),
    testPhoneCode: z.string().default('+91'),
    testPhoneNumber: z.string().optional(),
    schedule: z.enum(["now", "later"]).default("now"),
}).refine((data) => {
    if (data.messageType === 'template' && !data.templateId) {
        return false;
    }
    return true;
}, {
    message: "Template is required for template messages",
    path: ["templateName"],
});

type BroadcastFormValues = z.infer<typeof broadcastSchema>;

const CONTACT_LISTS = [
    { id: '1', name: 'All Customers', count: 1250 },
    { id: '2', name: 'New Signups', count: 45 },
    { id: '3', name: 'VIP Clients', count: 120 },
];

export default function BroadcastForm() {
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    const form = useForm<BroadcastFormValues>({
        resolver: zodResolver(broadcastSchema),
        defaultValues: {
            broadcastType: 'campaign',
            broadcastName: '',
            contactList: '',
            messageType: 'template',
            testPhoneCode: '+91',
            schedule: 'now',
        }
    });

    const { register, control, handleSubmit, setValue, watch, formState: { errors, isValid } } = form;
    const watchedMessageType = watch("messageType");
    const watchedTemplateName = watch("templateName");

    const onSubmit = (data: BroadcastFormValues) => {
        console.log("Form Submitted:", data);
        alert("Broadcast created successfully! (Check console for data)");
    };

    const handleTemplateSelect = (template: any) => {
        setValue("templateId", template.id);
        setValue("templateName", template.name, { shouldValidate: true });
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">WhatsApp Broadcast</h1>

            <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-8 space-y-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* 1. Broadcast Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Select Broadcast Type <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    {...register("broadcastType")}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                >
                                    <option value="campaign">Broadcast Campaign</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>
                            {errors.broadcastType && <p className="text-xs text-red-500">{errors.broadcastType.message}</p>}
                        </div>

                        {/* 2. Broadcast Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Broadcast Name <span className="text-red-500">*</span></label>
                            <Input
                                {...register("broadcastName")}
                                placeholder="Enter the name of the broadcast"
                                className={errors.broadcastName ? "border-red-500" : ""}
                            />
                            {errors.broadcastName && <p className="text-xs text-red-500">{errors.broadcastName.message}</p>}
                        </div>

                        {/* 3. Select Contacts List */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Select Contacts List <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    {...register("contactList")}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                >
                                    <option value="">Select a list...</option>
                                    {CONTACT_LISTS.map(list => (
                                        <option key={list.id} value={list.id}>{list.name} ({list.count})</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>
                            {errors.contactList && <p className="text-xs text-red-500">{errors.contactList.message}</p>}
                        </div>

                        {/* 4. Select Message Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Select Message Type <span className="text-red-500">*</span></label>
                            <div className="flex gap-6 pt-1">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="template"
                                        {...register("messageType")}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Pre-approved template message</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="regular"
                                        {...register("messageType")}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Regular message</span>
                                </label>
                            </div>
                        </div>

                        {/* 5. Select WhatsApp Template */}
                        {watchedMessageType === 'template' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Select WhatsApp Template <span className="text-red-500">*</span></label>
                                <div
                                    onClick={() => setIsTemplateModalOpen(true)}
                                    className={`flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${errors.templateName ? "border-red-500" : "border-input"}`}
                                >
                                    <span className={watchedTemplateName ? "text-gray-900" : "text-muted-foreground"}>
                                        {watchedTemplateName || "Select a template..."}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </div>
                                {errors.templateName && <p className="text-xs text-red-500">{errors.templateName.message}</p>}
                            </div>
                        )}

                        {/* 6. Test Message Section */}
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-sm font-semibold text-gray-900">Test Message</h3>
                                <Info className="h-4 w-4 text-gray-400" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-600">Username</label>
                                    <Input {...register("testUsername")} placeholder="Enter username" className="bg-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-600">Phone Number</label>
                                    <Controller
                                        name="testPhoneNumber"
                                        control={control}
                                        render={({ field }) => (
                                            <PhoneInput
                                                value={field.value}
                                                onChange={field.onChange}
                                                countryCode={watch("testPhoneCode")}
                                                onCountryCodeChange={(code) => setValue("testPhoneCode", code)}
                                                className="bg-white"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Send Test Message
                                </Button>
                            </div>
                        </div>

                        {/* 7. Schedule Broadcast */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Schedule Broadcast <span className="text-red-500">*</span></label>
                            <div className="flex gap-6 pt-1">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="later"
                                        {...register("schedule")}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Yes</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="now"
                                        {...register("schedule")}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">No</span>
                                </label>
                            </div>
                        </div>

                        {/* 8. Footer Buttons */}
                        <div className="flex items-center gap-4 pt-4 border-t">
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8">
                                Add Broadcast
                            </Button>
                            <Button type="button" variant="outline" className="text-gray-600">
                                Cancel
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>

            <TemplateSelectorModal
                open={isTemplateModalOpen}
                onOpenChange={setIsTemplateModalOpen}
                onSelect={handleTemplateSelect}
            />
        </div>
    );
}
