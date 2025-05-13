import { db } from "@/db";
import { tools } from "@/db/schema";
import { isAdmin } from "@/lib/check-admin";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

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
        <div className="container max-w-screen-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Approve Tools</h1>

            {pendingTools.length === 0 ? (
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-center text-muted-foreground">No hay herramientas pendientes de aprobación.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-muted-foreground mb-4">
                        {pendingTools.length} {pendingTools.length === 1 ? "herramienta" : "herramientas"} pendiente{pendingTools.length === 1 ? "" : "s"} de aprobación.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        {pendingTools.map((tool) => (
                            <div
                                key={tool.id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold">{tool.name}</h3>
                                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                        Pendiente
                                    </span>
                                </div>

                                <p className="text-sm text-muted-foreground mb-3">
                                    {tool.description}
                                </p>

                                {tool.tags && tool.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {tool.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs px-2 py-0.5 bg-muted rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
                                    // Aquí se implementaría la lógica para aprobar
                                    >
                                        Aprobar
                                    </button>
                                    <button
                                        type="button"
                                        className="px-3 py-1 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90"
                                    // Aquí se implementaría la lógica para rechazar
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 