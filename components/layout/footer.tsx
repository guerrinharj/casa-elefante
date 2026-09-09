export function Footer() {
    return (
        <footer className="border-t border-black px-6 py-6">
            <div className="flex items-center justify-between">
                <p className="text-sm">
                    © 2026 Casa Elefante
                </p>

                <div className="flex gap-4 text-sm">
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Instagram
                    </a>

                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        YouTube
                    </a>
                </div>
            </div>
        </footer>
    );
}