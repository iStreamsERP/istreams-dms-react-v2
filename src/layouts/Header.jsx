import { useTheme } from "@/components/theme-provider";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
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
    <header className="relative z-10 flex p-3 items-center justify-between bg-slate-100 shadow-md transition-colors dark:bg-slate-950">
      <div className="flex items-center gap-x-2">
        <Button
          variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
        >
          <PanelLeftClose className={collapsed ? "rotate-180 " : ""} />
        </Button>
        <Link to="/" className="hidden md:block text-sm font-semibold whitespace-nowrap cursor-pointer hover:text-gray-300">
          iStreams ERP Solutions - DMS
        </Link>
      </div>

      <nav className="flex items-center justify-end w-full">
        <div className="flex items-center gap-2">
          <div className="border border-gray-700 px-2 py-2 rounded-lg text-sm font-semibold hidden lg:block">
            {userData.organizationName}
          </div>

          <Button
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <CloudSun />
            ) : (
              <CloudMoon />
            )}
          </Button>

          <Button
            variant="ghost"
            className="hidden md:block"
            onClick={toggleFullScreen}
          >
            {isFullscreen ? (
              <Minimize />
            ) : (
              <Maximize />
            )}
          </Button>

         
          <DropdownMenu >
            <DropdownMenuTrigger className="flex items-start gap-2">
              <Avatar>
                <AvatarImage src={userData.userAvatar} alt={userData.userName} />
                <AvatarFallback>{userData.userName}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-lg font-semibold leading-6">
                  {userData.userName}
                </span>
                <span className="text-xs text-gray-400">
                  {userData.userEmail}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[250px]">
              <DropdownMenuLabel className="flex flex-col justify-between items-start mb-2">
                <p className="text-md font-medium">
                  {userData.userName}
                </p>
                <p className="text-xs font-normal text-gray-400">
                  {userData.userEmail}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-gray-400 cursor-pointer">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="flex justify-between items-center text-gray-400 cursor-pointer" onClick={() => navigate("/account-settings")}>
                  Account Settings  <Settings2 />
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-400 cursor-text">
                  Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 flex justify-between items-center cursor-pointer">
                  Log out <LogOut />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <span className="flex justify-between items-center cursor-pointer">
                  <Button className="w-full">
                    Upgrade to Pro
                  </Button>
                </span>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

Header.propTypes = {
  collapsed: PropTypes.bool,
  setCollapsed: PropTypes.func,
};







