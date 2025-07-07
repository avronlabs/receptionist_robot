import Link from 'next/link';
import { Gamepad2, Home, Menu } from 'lucide-react';
import { useRouter } from 'next/router';

export default function NavBar({ pagename = "Receptionist Assistant" }) {
    const router = useRouter();
    const isHome = router.pathname === '/';
    return (
        <nav className="relative flex items-center px-4 py-2 bg-gray-100 shadow">
            {/* Centered page name */}
            {/* Show Home icon only if not on home page */}
            {!isHome && (
                <Link href="/">
                    <button className="px-2 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600">
                        <Home size={28} />
                    </button>
                </Link>
            )}
            <span className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-gray-800">
                {pagename}
            </span>
            <div className="flex gap-4 ml-auto">

                <Link href="/controls">
                    <button className="px-2 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600">
                        <Gamepad2 size={28} />
                    </button>
                </Link>
                <Link href="/settings">
                    <button className="px-2 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600">
                        <Menu size={28} />
                    </button>
                </Link>
            </div>
        </nav>
    );
}
