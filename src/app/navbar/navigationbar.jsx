"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

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
	const linkRefs = useRef(new Map());
	const indicatorRef = useRef(null);
	const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0, opacity: 0 });

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

	return (
		<header className="flex shrink-0 justify-center px-4 pt-10 pb-6">
			<nav
				aria-label="Primary navigation"
				className="rounded-full bg-neutral-900/80 px-6 py-2 shadow-lg shadow-black/50 ring-1 ring-neutral-700/50 backdrop-blur"
			>
				<ul className="relative flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-[0.35em]">
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
						const baseClasses = "flex h-10 items-center justify-center px-4 font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400";
						const activeClasses = "text-emerald-400";
						const inactiveClasses = "text-neutral-300 hover:text-emerald-200";

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
		</header>
	);
}

