import React from 'react';
import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Define the route mapping for prettier display names
const routeMapping: Record<string, string> = {
  "": "Home",
  "evdriver": "EV Driver",
  "operator": "Operator",
  "stations": "Stations",
};

export function AppBreadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(segment => segment !== "");
  
  // Don't show breadcrumbs on home page
  if (pathSegments.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="mb-6 px-4 py-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {pathSegments.map((segment, index) => {
          // Build the path up to this segment
          const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length - 1;
          const displayName = routeMapping[segment] || segment;
          
          // For the last item in the path, show a page instead of a link
          return (
            <React.Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{displayName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={path}>{displayName}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default AppBreadcrumb; 