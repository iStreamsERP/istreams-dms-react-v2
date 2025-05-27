import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import { navbarLinks } from "@/constants";
import PropTypes from "prop-types";
import React, { forwardRef } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react"; // assuming this is used for the dropdown

export const Sidebar = forwardRef(({ collapsed }, ref) => {
  const [expandedMenu, setExpandedMenu] = React.useState(null);

  const toggleMenu = (label) => {
    setExpandedMenu((current) => (current === label ? null : label));
  };

  return (
    <aside
      ref={ref}
      className={cn(
        "fixed z-[100] flex h-full w-[240px] flex-col overflow-x-hidden border-r border-slate-300 bg-white transition-all duration-300 dark:border-slate-700 dark:bg-slate-900",
        collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
        collapsed ? "max-md:-left-full" : "max-md:left-0"
      )}
    >
      <div className="flex gap-x-3 p-3 mx-auto">
        <img
          src={logoLight}
          alt="iStreams ERP Solutions | CRM"
          className="dark:hidden"
        />
        <img
          src={logoDark}
          alt="iStreams ERP Solutions | CRM"
          className="hidden dark:block"
        />
      </div>

      <div className="flex w-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin">
        {navbarLinks.map((navbarLink) => (
          <div key={navbarLink.title}>
            <p
              className={cn(
                "text-xs font-semibold uppercase text-slate-400 px-3"
              )}
            >
              {navbarLink.title}
            </p>
            {navbarLink.links.map((link) => {
              const hasChildren = link.children && link.children.length > 0;
              return (
                <React.Fragment key={link.label}>
                  {hasChildren ? (
                    <div className="w-full">
                      <button
                        onClick={() => toggleMenu(link.label)}
                        className={cn(
                          "sidebar-item",
                          collapsed && "md:w-[45px]",
                          "flex items-center gap-x-2 w-full px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        )}
                      >
                        <link.icon size={18} className="flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <p className="whitespace-nowrap">{link.label}</p>
                            <ChevronDownIcon
                              className={cn(
                                "ml-auto h-4 w-4 transition-transform",
                                expandedMenu === link.label ? "rotate-180" : ""
                              )}
                            />
                          </>
                        )}
                      </button>
                      {expandedMenu === link.label && !collapsed && (
                        <div className="ml-4">
                          {link.children.map((child) => (
                            <NavLink
                              key={child.label}
                              to={child.path}
                              className={cn(
                                "sidebar-item flex items-center gap-x-2 my-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors pl-8"
                              )}
                            >
                              <child.icon size={18} className="flex-shrink-0" />
                              {!collapsed && (
                                <p className="whitespace-nowrap">
                                  {child.label}
                                </p>
                              )}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavLink
                      to={link.path}
                      className={cn(
                        "sidebar-item flex items-center gap-x-2 px-3 py-2 my-2 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                        collapsed && "md:w-[45px]"
                      )}
                    >
                      <link.icon size={18} className="flex-shrink-0" />
                      {!collapsed && (
                        <p className="whitespace-nowrap">{link.label}</p>
                      )}
                    </NavLink>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
  collapsed: PropTypes.bool,
};
