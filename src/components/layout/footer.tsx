export default function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="border-t">
            <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    {/* <Icons.logo /> */}
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by{" "}
                        <a
                            href="https://github.com/your-username" // Replace with your GitHub profile
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium underline underline-offset-4"
                        >
                            Your Name/Team
                        </a>
                        . The source code is available on{" "}
                        <a
                            href="https://github.com/your-username/tool-alternatives-mvp" // Replace with your repo URL
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium underline underline-offset-4"
                        >
                            GitHub
                        </a>
                        .
                    </p>
                </div>
                <p className="text-center text-sm text-muted-foreground md:text-left">
                    © {currentYear} Tool Alternatives Hub. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
