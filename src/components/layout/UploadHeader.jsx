import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const UploadHeader = () => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="w-full flex items-center justify-between px-4 py-1 h-[8vh]">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-x-3">
        <img src={logoDark} alt="Logo" className="h-8 dark" />
      </Link>

      {/* User Info */}
      {userData && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
            <Avatar>
              <AvatarImage
                src={userData.userAvatar || ""}
                alt={userData.userName || "User"}
              />
              <AvatarFallback>{userData.userName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64 mt-2">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userData.userName}</p>
                <p className="text-xs text-muted-foreground">
                  {userData.userEmail}
                </p>
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
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <div className="flex justify-between items-center w-full">
                  Log out <LogOut size={16} />
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
};
