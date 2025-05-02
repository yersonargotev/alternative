import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            disableTransitionOnChange
            defaultTheme="system"
        >
            <TooltipProvider delayDuration={0}>
                <Toaster position="bottom-right" richColors />
                {children}
            </TooltipProvider>
        </ThemeProvider>
    );
}
