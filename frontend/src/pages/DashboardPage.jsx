import React, { useState, useEffect } from 'react';
import { Download, Filter, Calendar, User, Search, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

const DashboardPage = () => {
  const [payslips, setPayslips] = useState([]);
  const [filteredPayslips, setFilteredPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    month: '',
    year: new Date().getFullYear().toString()
  });

  const employeeName = localStorage.getItem('employee_name');

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
    { value: '12', label: 'December' }
  ];

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async (filterParams = {}) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filterParams.month) params.append('month', filterParams.month);
      if (filterParams.year) params.append('year', filterParams.year);

      const response = await api.get(`/dashboard/?${params.toString()}`);
      setPayslips(response.data.payslips);
      setFilteredPayslips(response.data.payslips);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payslips');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const filterParams = {};
    if (filters.month) filterParams.month = filters.month;
    if (filters.year) filterParams.year = filters.year;
    
    fetchPayslips(filterParams);
  };

  const handleClearFilters = () => {
    setFilters({ month: '', year: new Date().getFullYear().toString() });
    fetchPayslips();
  };

  const formatDate = (month, year) => {
    const monthName = months.find(m => m.value === month.toString())?.label || month;
    return `${monthName} ${year}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleDownload = (payslipUrl) => {
    window.open(payslipUrl, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center space-x-3 mb-2">
          <User className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {employeeName}
          </h1>
        </div>
        <p className="text-muted-foreground">
          View and download your payslips from the portal below.
        </p>
      </div>

      {/* Filters Section */}
      <Card className="mb-6 shadow-corporate animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter Payslips</span>
          </CardTitle>
          <CardDescription>
            Filter your payslips by month and year to find specific records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select
                value={filters.month}
                onValueChange={(value) => setFilters({ ...filters, month: value })}
              >
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

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                placeholder="Enter year"
                min="2020"
                max="2030"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleFilter} className="flex-1">
                <Search className="w-4 h-4 mr-2" />
                Apply Filter
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6 animate-slide-up">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Payslips List */}
      <Card className="shadow-corporate animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Your Payslips</span>
          </CardTitle>
          <CardDescription>
            {filteredPayslips.length} payslip(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading payslips...</p>
              </div>
            </div>
          ) : filteredPayslips.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No payslips found
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or contact HR if you expect to see payslips here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayslips.map((payslip, index) => (
                <div
                  key={payslip.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {formatDate(payslip.month, payslip.year)}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {payslip.gross_salary && (
                          <Badge variant="secondary">
                            Gross: {formatCurrency(payslip.gross_salary)}
                          </Badge>
                        )}
                        {payslip.net_salary && (
                          <Badge variant="outline">
                            Net: {formatCurrency(payslip.net_salary)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDownload(payslip.pdf_file)}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;