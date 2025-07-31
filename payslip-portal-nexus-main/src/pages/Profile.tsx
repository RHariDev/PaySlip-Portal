import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building,
  CreditCard,
  Shield,
  IdCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface ProfileData {
  id: string;
  name: string;
  employee_number: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  hire_date: string;
  department: string;
  position: string;
  salary: number;
  bank_account: string;
  tax_id: string;
}

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/profile/');
      setProfileData(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch profile data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const maskBankAccount = (account: string) => {
    if (!account) return 'Not provided';
    return `****-****-${account.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{profileData?.name || user?.name}</h1>
          <p className="text-muted-foreground">
            Employee Profile & Information
          </p>
        </div>
        <div className="ml-auto">
          <Badge variant="secondary" className="flex items-center space-x-1">
            {user?.isAdmin ? (
              <>
                <Shield className="h-3 w-3" />
                <span>Administrator</span>
              </>
            ) : (
              <>
                <IdCard className="h-3 w-3" />
                <span>Employee #{profileData?.employee_number || user?.employeeNumber}</span>
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Profile Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
            <CardDescription>
              Your basic personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData?.email || 'Not provided'}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData?.phone || 'Not provided'}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData?.address || 'Not provided'}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date of Birth</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData?.date_of_birth ? formatDate(profileData.date_of_birth) : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Employment Details</span>
            </CardTitle>
            <CardDescription>
              Your work-related information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <IdCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Employee Number</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData?.employee_number || user?.employeeNumber}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData?.department || 'Not provided'}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Position</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData?.position || 'Not provided'}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Hire Date</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData?.hire_date ? formatDate(profileData.hire_date) : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Financial Details</span>
            </CardTitle>
            <CardDescription>
              Your salary and banking information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Monthly Salary</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData?.salary ? `$${profileData.salary.toLocaleString()}` : 'Not disclosed'}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Bank Account</p>
                  <p className="text-sm text-muted-foreground">
                    {maskBankAccount(profileData?.bank_account || '')}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <IdCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tax ID</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData?.tax_id ? `***-**-${profileData.tax_id.slice(-4)}` : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
            <CardDescription>
              Your account status and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Account Type</p>
                  <Badge variant={user?.isAdmin ? "default" : "secondary"}>
                    {user?.isAdmin ? 'Administrator' : 'Employee'}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Access Level</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.isAdmin ? 'Full system access' : 'Employee portal access'}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Login</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};