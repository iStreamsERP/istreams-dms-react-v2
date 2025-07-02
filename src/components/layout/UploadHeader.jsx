import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { LogOut, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const UploadHeader = () => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="w-full flex items-center justify-between px-4 py-3  z-50">
      {/* Logo */}
      <div className="text-lg font-semibold tracking-tight ">
        iStreams DMS
      </div>

      {/* User Info */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
          <Avatar>
            <AvatarImage src={userData.userAvatar} alt={userData.userName} />
            <AvatarFallback>{userData.userName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-semibold">{userData.userName}</span>
            <span className="text-xs text-muted-foreground">
              {userData.userEmail}
            </span>
          </div>
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
    </header>
  );
};
