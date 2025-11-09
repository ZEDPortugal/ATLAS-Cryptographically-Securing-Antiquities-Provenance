"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

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
			<header className="shrink-0 px-4 pt-4 pb-3 md:px-6 md:pt-6 md:pb-4 xl:px-12 xl:pt-10 xl:pb-6">
				{/* Tablet/Desktop Layout */}
				<div className="hidden md:block">
					{/* Logo - Top on tablet/iPad, Left on large desktop */}
					<div className="flex items-center justify-center xl:hidden mb-4">
						<Link href="/" className="flex items-center">
							<div className="flex h-10 items-center rounded-full bg-neutral-900/80 px-4 shadow-lg shadow-black/50 ring-1 ring-neutral-700/50 backdrop-blur transition-all hover:ring-emerald-400/50 dark:bg-neutral-900/80 light:bg-neutral-100/80 light:ring-neutral-300/50 lg:h-11 lg:px-5">
								<span className="font-golosText text-base font-bold tracking-wider text-white dark:text-white light:text-neutral-900 lg:text-[1.05rem]">A T L A S</span>
							</div>
						</Link>
					</div>

					{/* Navigation and Logout Row */}
					<div className="flex items-center justify-between gap-3 lg:gap-4">
						{/* Logo for Large Desktop */}
						<Link href="/" className="hidden xl:flex items-center">
							<div className="flex h-12 items-center rounded-full bg-neutral-900/80 px-6 shadow-lg shadow-black/50 ring-1 ring-neutral-700/50 backdrop-blur transition-all hover:ring-emerald-400/50 dark:bg-neutral-900/80 light:bg-neutral-100/80 light:ring-neutral-300/50">
								<span className="font-golosText text-lg font-bold tracking-wider text-white dark:text-white light:text-neutral-900">A T L A S</span>
							</div>
						</Link>

						{/* Navigation Links - Left on tablet, Center on desktop */}
						<nav
							aria-label="Primary navigation"
							className="flex xl:flex-1 xl:justify-center"
						>
						<ul className="relative flex items-center gap-1.5 rounded-full bg-neutral-900/80 px-3 py-2 shadow-lg shadow-black/50 ring-1 ring-neutral-700/50 backdrop-blur dark:bg-neutral-900/80 light:bg-neutral-100/80 light:ring-neutral-300/50 lg:gap-2 lg:px-4 xl:px-6 xl:py-3">
							<span
								ref={indicatorRef}
								style={{
									width: `${indicatorStyle.width}px`,
									left: `${indicatorStyle.left}px`,
									opacity: indicatorStyle.opacity,
								}}
								className="pointer-events-none absolute bottom-1.5 h-1 rounded-full bg-emerald-400 transition-all duration-300 ease-out"
							/>
							{links.map((link) => {
								const active = isActive(pathname, link.href);
								const baseClasses = "font-golosText px-2.5 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-400 lg:px-3 lg:text-[0.65rem] lg:tracking-[0.25em] xl:px-4 xl:py-2 xl:text-xs xl:tracking-[0.3em]";
								const activeClasses = "text-emerald-400";
								const inactiveClasses = "text-neutral-300 hover:text-emerald-200 dark:text-neutral-300 light:text-neutral-600 light:hover:text-emerald-500";

								return (
									<li key={link.href}>
										<Link
											href={link.href}
											aria-current={active ? "page" : undefined}
											ref={(element) => {
												if (!element) {
													linkRefs.current.delete(link.href);
													return;
												}
												linkRefs.current.set(link.href, element);
											}}
											className={classNames(baseClasses, active ? activeClasses : inactiveClasses)}
										>
											{link.label}
										</Link>
									</li>
								);
							})}
						</ul>
					</nav>

					{/* Right Side - Logout Button Only */}
					<div className="flex items-center gap-3">
						<button
							onClick={logout}
							className="flex h-10 items-center rounded-full bg-neutral-900/80 px-3 shadow-lg shadow-black/50 ring-1 ring-neutral-700/50 backdrop-blur transition-all hover:ring-red-500/50 dark:bg-neutral-900/80 light:bg-neutral-100/80 light:ring-neutral-300/50 lg:h-11 lg:px-4 xl:h-12 xl:px-6"
						>
							<span className="font-golosText text-[0.65rem] uppercase tracking-[0.25em] text-red-400 transition-colors hover:text-red-300 light:text-red-500 light:hover:text-red-600 lg:text-xs lg:tracking-[0.28em] xl:text-sm xl:tracking-[0.3em]">
								Logout
							</span>
						</button>
					</div>
					</div>
				</div>

				{/* Mobile Logo Only */}
				<div className="flex md:hidden items-center justify-center">
					<Link href="/" className="flex items-center">
						<div className="flex h-10 items-center rounded-full bg-neutral-900/80 px-4 shadow-lg shadow-black/50 ring-1 ring-neutral-700/50 backdrop-blur transition-all hover:ring-emerald-400/50 dark:bg-neutral-900/80 light:bg-neutral-100/80 light:ring-neutral-300/50">
							<span className="font-golosText text-base font-bold tracking-wider text-white dark:text-white light:text-neutral-900">A T L A S</span>
						</div>
					</Link>
				</div>
			</header>

			{/* Floating Theme Toggle Button - Tablet/Desktop Only */}
			<div className="fixed bottom-6 left-6 z-50 hidden md:block">
				<ThemeToggle />
			</div>

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
					<p className="font-golosText text-sm uppercase tracking-[0.35em] text-neutral-500">Navigate</p>
					<ul className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em]">
						{links.map((link) => {
							const active = isActive(pathname, link.href);
							const baseClasses = "font-golosText block rounded-xl px-4 py-3 font-semibold transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-400";
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
						<div className="flex items-center justify-between px-4 py-2">
							<span className="font-golosText text-xs uppercase tracking-[0.3em] text-neutral-400">Theme</span>
							<ThemeToggle />
						</div>
						<button
							onClick={() => {
								logout();
								closeMenu();
							}}
							className="font-golosText block w-full rounded-xl bg-red-500/10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-red-400 transition hover:bg-red-500/20 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-400"
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

