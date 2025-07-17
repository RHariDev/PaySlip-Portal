import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, FileText, Upload, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const employeeName = localStorage.getItem('employee_name');
  const isLoggedIn = localStorage.getItem('employee_id');

  const handleLogout = () => {
    localStorage.removeItem('employee_id');
    localStorage.removeItem('employee_name');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (location.pathname === '/login') {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b shadow-corporate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-corporate rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Payslip Portal</h1>
              </div>
            </div>

            {/* Navigation */}
            {isLoggedIn && (
              <nav className="hidden md:flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button 
                    variant={isActive('/dashboard') ? 'default' : 'ghost'}
                    className="flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
                <Link to="/upload">
                  <Button 
                    variant={isActive('/upload') ? 'default' : 'ghost'}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </Button>
                </Link>
              </nav>
            )}

            {/* User Info & Logout */}
            {isLoggedIn && (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{employeeName}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isLoggedIn && (
          <div className="md:hidden border-t bg-muted/50">
            <div className="max-w-7xl mx-auto px-4 py-2">
              <div className="flex space-x-2">
                <Link to="/dashboard" className="flex-1">
                  <Button 
                    variant={isActive('/dashboard') ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/upload" className="flex-1">
                  <Button 
                    variant={isActive('/upload') ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-muted-foreground">
            © 2024 Employee Payslip Portal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;