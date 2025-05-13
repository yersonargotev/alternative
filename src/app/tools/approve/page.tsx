import { db } from "@/db";
import { tools } from "@/db/schema";
import { isAdmin } from "@/lib/check-admin";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ToolActionButtons } from "./tool-action-buttons";

// Page component for Tool Approval
export default async function ApproveToolsPage() {
    // Verificar si el usuario es administrador de la organización "alternatives"
    const isUserAdmin = await isAdmin();

    // Si no es admin, redirigir a la página principal
    if (!isUserAdmin) {
        redirect("/");
    }

    // Obtener herramientas pendientes de aprobación
    const pendingTools = await db.query.tools.findMany({
        where: eq(tools.status, "pending"),
        orderBy: (tools, { desc }) => [desc(tools.createdAt)],
    });

    return (
        <div className="container mx-auto max-w-screen-xl p-6">
            <h1 className="mb-6 font-bold text-2xl">Approve Tools</h1>

            {pendingTools.length === 0 ? (
                <div className="rounded-lg bg-muted p-4">
                    <p className="text-center text-muted-foreground">No hay herramientas pendientes de aprobación.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="mb-4 text-muted-foreground">
                        {pendingTools.length} {pendingTools.length === 1 ? "herramienta" : "herramientas"} pendiente{pendingTools.length === 1 ? "" : "s"} de aprobación.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        {pendingTools.map((tool) => (
                            <div
                                key={tool.id}
                                className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                            >
                                <div className="mb-2 flex items-start justify-between">
                                    <h3 className="font-semibold">{tool.name}</h3>
                                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                                        Pendiente
                                    </span>
                                </div>

                                <p className="mb-3 text-muted-foreground text-sm">
                                    {tool.description}
                                </p>

                                {tool.tags && tool.tags.length > 0 && (
                                    <div className="mb-3 flex flex-wrap gap-1">
                                        {tool.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-full bg-muted px-2 py-0.5 text-xs"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4">
                                    <ToolActionButtons toolId={tool.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 