import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
  Moon, 
  Sun, 
  User, 
  LayoutDashboard, 
  Upload, 
  Settings,
  LogOut,
  FileSpreadsheet
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <FileSpreadsheet className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Payslip Portal
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
          {user.isAdmin && (
            <>
              <Link
                to="/upload"
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Link>
              <a
                href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/admin/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </a>
            </>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.isAdmin ? 'Administrator' : `Employee #${user.employeeNumber}`}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="md:hidden">
                <Link to="/dashboard" className="flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="md:hidden">
                <Link to="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              {user.isAdmin && (
                <>
                  <DropdownMenuItem asChild className="md:hidden">
                    <Link to="/upload" className="flex items-center">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="md:hidden">
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/admin/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </a>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};