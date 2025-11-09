"use client";

import { usePathname } from "next/navigation";
import NavigationBar from "../navbar/navigationbar";

export default function ConditionalNav() {
  const pathname = usePathname();
  
  // Don't show navigation on login and registration pages
  const hideNavPages = ["/login", "/dev-register", "/user-register", "/verify-secure"];
  const shouldHideNav = hideNavPages.some(page => pathname.startsWith(page));
  
  if (shouldHideNav) {
    return null;
  }
  
  return <NavigationBar />;
}
