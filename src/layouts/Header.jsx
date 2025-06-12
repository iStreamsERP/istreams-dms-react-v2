import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import {
  CloudMoon,
  CloudSun,
  LogOut,
  Maximize,
  Minimize,
  PanelLeftClose,
  Settings2,
} from "lucide-react";
import PropTypes from "prop-types";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Header = ({ collapsed, setCollapsed }) => {
  const { userData, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="relative z-10 flex items-center justify-between p-3 bg-slate-100 shadow-md transition-colors dark:bg-slate-950">
      {/* Left Side: Logo & Collapse Button */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => setCollapsed(!collapsed)}>
          <PanelLeftClose className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </Button>
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/"
            className="text-sm font-semibold whitespace-nowrap hover:text-primary transition-colors"
          >
            iStreams ERP Solutions - DMS
          </Link>
          <Badge>
            {userData.isAdmin ? "Admin Mode" : "User Mode"}
          </Badge>
        </div>
      </div>

      {/* Right Side: Actions */}
      <nav className="flex items-center gap-2">
        <div className="hidden lg:block border border-gray-300 dark:border-gray-700 px-3 py-1.5 rounded-md text-sm font-medium">
          {userData.companyName}
        </div>

        {/* Theme Toggle */}
        <Button variant="ghost" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <CloudSun /> : <CloudMoon />}
        </Button>

        {/* Fullscreen Toggle */}
        <Button variant="ghost" className="hidden md:inline-flex" onClick={toggleFullScreen}>
          {isFullscreen ? <Minimize /> : <Maximize />}
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
            <Avatar>
              <AvatarImage src={userData.userAvatar} alt={userData.userName} />
              <AvatarFallback>{userData.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-semibold">{userData.userName}</span>
              <span className="text-xs text-muted-foreground">{userData.userEmail}</span>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64 mt-2">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userData.userName}</p>
                <p className="text-xs text-muted-foreground">{userData.userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/account-settings")}>
                <div className="flex justify-between items-center w-full">
                  Account Settings <Settings2 size={16} />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                Theme
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600"
              >
                <div className="flex justify-between items-center w-full">
                  Log out <LogOut size={16} />
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-0">
                <Button className="w-full">Upgrade to Pro</Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
};

Header.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  setCollapsed: PropTypes.func.isRequired,
};
