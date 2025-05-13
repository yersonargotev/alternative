'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { approveTool, rejectTool } from "./actions";

interface ToolActionButtonsProps {
    toolId: number;
}

export function ToolActionButtons({ toolId }: ToolActionButtonsProps) {
    const [isPendingApprove, setIsPendingApprove] = useState(false);
    const [isPendingReject, setIsPendingReject] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const handleApprove = async () => {
        try {
            setIsPendingApprove(true);
            await approveTool(toolId);
            setIsCompleted(true);
        } catch (error) {
            console.error("Error approving tool:", error);
        } finally {
            setIsPendingApprove(false);
        }
    };

    const handleReject = async () => {
        try {
            setIsPendingReject(true);
            await rejectTool(toolId);
            setIsCompleted(true);
        } catch (error) {
            console.error("Error rejecting tool:", error);
        } finally {
            setIsPendingReject(false);
        }
    };

    if (isCompleted) {
        return (
            <div className="text-muted-foreground text-sm">
                Acción completada
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            <Button
                onClick={handleApprove}
                variant="default"
                size="sm"
                disabled={isPendingApprove || isPendingReject}
            >
                {isPendingApprove ? "Aprobando..." : "Aprobar"}
            </Button>

            <Button
                onClick={handleReject}
                variant="destructive"
                size="sm"
                disabled={isPendingReject || isPendingApprove}
            >
                {isPendingReject ? "Rechazando..." : "Rechazar"}
            </Button>
        </div>
    );
} 