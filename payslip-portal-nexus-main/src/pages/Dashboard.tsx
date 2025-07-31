import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Download, FileSpreadsheet, Filter, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface Payslip {
  id: string;
  month: number;
  year: number;
  gross_salary: number;
  net_salary: number;
  download_url: string;
  processed_date: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [filteredPayslips, setFilteredPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  useEffect(() => {
    fetchPayslips();
  }, []);

  useEffect(() => {
    filterPayslips();
  }, [payslips, filterMonth, filterYear]);

  const fetchPayslips = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/dashboard/', {
        withCredentials: true,});
      setPayslips(response.data.payslips || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch payslips',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterPayslips = () => {
    let filtered = [...payslips];

    if (filterMonth) {
      filtered = filtered.filter(p => p.month.toString() === filterMonth);
    }

    if (filterYear) {
      filtered = filtered.filter(p => p.year.toString() === filterYear);
    }

    setFilteredPayslips(filtered);
  };

  const handleDownload = async (payslip: Payslip) => {
    try {
      const response = await axios.get(payslip.download_url, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip-${payslip.month}-${payslip.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: `Payslip for ${months[payslip.month - 1]?.label} ${payslip.year} is downloading.`,
      });
    } catch (error: any) {
      toast({
        title: 'Download failed',
        description: error.response?.data?.message || 'Failed to download payslip',
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setFilterMonth('');
    setFilterYear('');
  };

  const getMonthName = (month: number) => {
    return months.find(m => m.value === month.toString())?.label || month.toString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">
            View and download your payslips below
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <FileSpreadsheet className="h-3 w-3" />
            <span>{filteredPayslips.length} payslip(s)</span>
          </Badge>
        </div>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Payslips</span>
          </CardTitle>
          <CardDescription>
            Filter your payslips by month and year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Label htmlFor="month">Month</Label>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                placeholder="Enter year (e.g., 2024)"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                min="2020"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={filterPayslips} variant="default">
                Apply Filter
              </Button>
              <Button onClick={clearFilters} variant="outline">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payslips Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Payslips</h2>
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPayslips.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No payslips found</h3>
              <p className="text-muted-foreground">
                {payslips.length === 0 
                  ? "You don't have any payslips yet." 
                  : "No payslips match your current filters."
                }
              </p>
              {payslips.length > 0 && (
                <Button onClick={clearFilters} variant="outline" className="mt-4">
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPayslips.map((payslip) => (
              <Card key={payslip.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{getMonthName(payslip.month)} {payslip.year}</span>
                    </span>
                    <Badge variant="outline">
                      {new Date(payslip.processed_date).toLocaleDateString()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gross Salary:</span>
                      <span className="font-medium flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {payslip.gross_salary.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Net Salary:</span>
                      <span className="font-medium text-primary flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {payslip.net_salary.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleDownload(payslip)}
                    className="w-full"
                    variant="default"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};