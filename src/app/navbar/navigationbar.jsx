"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const links = [
	{ label: "dashboard", href: "/" },
	{ label: "register", href: "/register" },
	{ label: "verify", href: "/verify" },
	{ label: "items", href: "/items" },
	{ label: "records", href: "/records" },
];

const INDICATOR_INSET = 16;

function classNames(...values) {
	return values.filter(Boolean).join(" ");
}

function isActive(pathname, href) {
	if (href === "/") {
		return pathname === "/";
	}
	return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavigationBar() {
	const pathname = usePathname() || "/";
	const { user, isAuthenticated, logout } = useAuth();
	const linkRefs = useRef(new Map());
	const indicatorRef = useRef(null);
	const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0, opacity: 0 });
	const [menuOpen, setMenuOpen] = useState(false);

	const activeHref = useMemo(() => {
		const match = links.find((link) => isActive(pathname, link.href));
		return match ? match.href : null;
	}, [pathname]);

	const updateIndicator = useCallback(() => {
		if (!indicatorRef.current || !activeHref) {
			setIndicatorStyle((previous) => ({ ...previous, opacity: 0 }));
			return;
		}

		const element = linkRefs.current.get(activeHref);
		if (!element) {
			setIndicatorStyle((previous) => ({ ...previous, opacity: 0 }));
			return;
		}

		const { offsetWidth, offsetLeft } = element;
		const width = Math.max(offsetWidth - INDICATOR_INSET * 2, 8);
		setIndicatorStyle({ width, left: offsetLeft + INDICATOR_INSET, opacity: 1 });
	}, [activeHref]);

	useLayoutEffect(() => {
		updateIndicator();
	}, [updateIndicator]);

	useEffect(() => {
		function handleResize() {
			updateIndicator();
		}

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [updateIndicator]);

	useEffect(() => {
		setMenuOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!menuOpen) {
			return;
		}

		function handleKeydown(event) {
			if (event.key === "Escape") {
				setMenuOpen(false);
			}
		}

		document.addEventListener("keydown", handleKeydown);
		return () => document.removeEventListener("keydown", handleKeydown);
	}, [menuOpen]);

	useEffect(() => {
		if (!menuOpen) {
			return;
		}

		const { body } = document;
		const previousOverflow = body.style.overflow;
		body.style.overflow = "hidden";
		return () => {
			body.style.overflow = previousOverflow;
		};
	}, [menuOpen]);

	const toggleMenu = useCallback(() => {
		setMenuOpen((previous) => !previous);
	}, []);

	const closeMenu = useCallback(() => {
		setMenuOpen(false);
	}, []);

	return (
		<>
			<header className="flex shrink-0 items-center justify-center px-4 pt-6 pb-4 md:pt-10 md:pb-6">
				<nav
					aria-label="Primary navigation"
					className="hidden rounded-full bg-neutral-900/80 px-6 py-3 shadow-lg shadow-black/50 ring-1 ring-neutral-700/50 backdrop-blur md:flex md:items-center md:gap-8"
				>
					{/* Logo */}
					<Link href="/" className="flex items-center">
						<div className="flex h-10 items-center rounded-full bg-emerald-400/10 px-5 ring-1 ring-emerald-400/30 transition-all hover:bg-emerald-400/20 hover:ring-emerald-400/50">
							<span className="text-base font-bold tracking-wider text-emerald-400">ATLAS</span>
						</div>
					</Link>

					{/* Navigation Links */}
					<ul className="flex items-center gap-2">
						{links.map((link) => {
							const active = isActive(pathname, link.href);
							const baseClasses = "px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition-colors duration-200 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-400";
							const activeClasses = "text-emerald-400";
							const inactiveClasses = "text-neutral-300 hover:text-emerald-200";

							return (
								<li key={link.href}>
									<Link
										href={link.href}
										aria-current={active ? "page" : undefined}
										className={classNames(baseClasses, active ? activeClasses : inactiveClasses)}
									>
										{link.label}
									</Link>
								</li>
							);
						})}
					</ul>

					{/* Logout Button */}
					<button
						onClick={logout}
						className="rounded-full bg-red-500/10 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-400 ring-1 ring-red-500/20 transition-all duration-200 hover:bg-red-500/20 hover:ring-red-500/40 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-400"
					>
						Logout
					</button>
				</nav>
			</header>

			{/* Floating Burger Menu Button */}
			<button
				type="button"
				onClick={toggleMenu}
				aria-label="Toggle navigation"
				aria-expanded={menuOpen}
				className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/95 text-neutral-200 shadow-xl shadow-black/60 backdrop-blur-md transition-all duration-200 hover:border-emerald-400 hover:text-emerald-200 hover:scale-110 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-400 md:hidden"
			>
				<span className="sr-only">Toggle navigation</span>
				<span className="relative block h-5 w-6">
					<span
						aria-hidden="true"
						className={classNames(
							"absolute left-0 h-0.5 w-6 transform transition-all duration-200 ease-in-out",
							menuOpen ? "top-2.5 rotate-45 bg-emerald-400" : "top-1 bg-neutral-200"
						)}
					/>
					<span
						aria-hidden="true"
						className={classNames(
							"absolute left-0 h-0.5 w-6 transform transition-all duration-200 ease-in-out",
							menuOpen ? "top-2.5 -rotate-45 bg-emerald-400" : "top-2.5 bg-neutral-200"
						)}
					/>
					<span
						aria-hidden="true"
						className={classNames(
							"absolute left-0 h-0.5 w-6 transform transition-all duration-200 ease-in-out",
							menuOpen ? "top-2.5 rotate-45 opacity-0" : "top-4 bg-neutral-200"
						)}
					/>
				</span>
			</button>

			<nav
				aria-label="Mobile navigation"
				className={classNames(
					"fixed inset-y-0 right-0 z-50 w-72 max-w-full bg-neutral-900/95 px-6 py-12 shadow-2xl shadow-black/50 transition-transform duration-300 ease-in-out md:hidden",
					menuOpen ? "translate-x-0" : "translate-x-full"
				)}
			>
				<div className="flex flex-col gap-6">
					<p className="text-sm uppercase tracking-[0.35em] text-neutral-500">Navigate</p>
					<ul className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em]">
						{links.map((link) => {
							const active = isActive(pathname, link.href);
							const baseClasses = "block rounded-xl px-4 py-3 font-semibold transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-400";
							const activeClasses = "bg-emerald-500/10 text-emerald-300";
							const inactiveClasses = "text-neutral-200 hover:bg-neutral-800/60 hover:text-emerald-200";

							return (
								<li key={`mobile-${link.href}`}>
									<Link
										href={link.href}
										aria-current={active ? "page" : undefined}
										onClick={closeMenu}
										className={classNames(baseClasses, active ? activeClasses : inactiveClasses)}
									>
										{link.label}
									</Link>
								</li>
							);
						})}
					</ul>
					
					<div className="mt-4 space-y-3 border-t border-neutral-800 pt-6">
						<button
							onClick={() => {
								logout();
								closeMenu();
							}}
							className="block w-full rounded-xl bg-red-500/10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-red-400 transition hover:bg-red-500/20 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-400"
						>
							Logout
						</button>
					</div>
				</div>
			</nav>

			{menuOpen ? (
				<button
					type="button"
					onClick={closeMenu}
					className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden"
					aria-label="Close navigation"
				/>
			) : null}
		</>
	);
}

