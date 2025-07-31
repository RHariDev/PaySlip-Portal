import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, FileSpreadsheet, User, Shield, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Validation schemas
const employeeSchema = z.object({
  employeeNumber: z.string().min(1, 'Employee number is required'),
  dateOfBirth: z.date().refine((date) => date !== undefined, {
    message: 'Date of birth is required',
  }),
});

const adminSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;
type AdminFormData = z.infer<typeof adminSchema>;

export const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState('employee');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Employee form
  const employeeForm = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  // Admin form
  const adminForm = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
  });

  const handleEmployeeLogin = async (data: EmployeeFormData) => {
    setIsLoading(true);
    try {
      await login({
        empno: data.employeeNumber,
        dob: format(data.dateOfBirth, 'yyyy-MM-dd'),
      }, false);
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      
    navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (data: AdminFormData) => {
    setIsLoading(true);
    try {
      await login({
        username: data.username,
        password: data.password,
      }, true);
      
      toast({
        title: 'Admin access granted',
        description: 'Welcome to the admin panel.',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="fixed top-4 right-4 h-9 w-9 p-0"
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Payslip Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            Access your payslips and profile information
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose your login method below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employee" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Employee</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </TabsTrigger>
              </TabsList>

              {/* Employee Login */}
              <TabsContent value="employee" className="space-y-4">
                <form onSubmit={employeeForm.handleSubmit(handleEmployeeLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeNumber">Employee Number</Label>
                    <Input
                      id="employeeNumber"
                      placeholder="Enter your employee number"
                      {...employeeForm.register('employeeNumber')}
                      className={employeeForm.formState.errors.employeeNumber ? 'border-destructive' : ''}
                    />
                    {employeeForm.formState.errors.employeeNumber && (
                      <p className="text-sm text-destructive">
                        {employeeForm.formState.errors.employeeNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={employeeForm.watch('dateOfBirth') ? format(employeeForm.watch('dateOfBirth'), 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            employeeForm.setValue('dateOfBirth', new Date(e.target.value));
                          }
                        }}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        min="1900-01-01"
                        className={cn(
                          "flex-1",
                          employeeForm.formState.errors.dateOfBirth && "border-destructive"
                        )}
                        placeholder="YYYY-MM-DD"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            type="button"
                            className={cn(
                              "shrink-0",
                              employeeForm.formState.errors.dateOfBirth && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={employeeForm.watch('dateOfBirth')}
                            onSelect={(date) => employeeForm.setValue('dateOfBirth', date!)}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            defaultMonth={new Date(1980, 0)}
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            captionLayout="dropdown-buttons"
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {employeeForm.formState.errors.dateOfBirth && (
                      <p className="text-sm text-destructive">
                        {employeeForm.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in as Employee'}
                  </Button>
                </form>
              </TabsContent>

              {/* Admin Login */}
              <TabsContent value="admin" className="space-y-4">
                <form onSubmit={adminForm.handleSubmit(handleAdminLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      {...adminForm.register('username')}
                      className={adminForm.formState.errors.username ? 'border-destructive' : ''}
                    />
                    {adminForm.formState.errors.username && (
                      <p className="text-sm text-destructive">
                        {adminForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      {...adminForm.register('password')}
                      className={adminForm.formState.errors.password ? 'border-destructive' : ''}
                    />
                    {adminForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {adminForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in as Admin'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Need help? Contact your HR department</p>
        </div>
      </div>
    </div>
  );
};