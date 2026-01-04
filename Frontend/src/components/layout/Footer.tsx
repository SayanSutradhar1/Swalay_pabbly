import Link from "next/link";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-gray-200 bg-white py-4 px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                    &copy; {currentYear} Swalay. All rights reserved.
                </p>
                <Link
                    href="/privacy-policy"
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                    Privacy Policy
                </Link>
            </div>
        </footer>
    );
}
