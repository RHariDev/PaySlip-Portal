import React, { useState, useRef } from 'react';
import { api, useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload as UploadIcon, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileX,
  CloudUpload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface UploadResponse {
  success: boolean;
  message: string;
  processed_records?: number;
  errors?: string[];
}

export const Upload: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);

  // Redirect non-admin users
  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium">Access Denied</h3>
            <p className="text-muted-foreground">
              You need administrator privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.dbf')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a .dbf file',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'File size must be less than 50MB',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      // Validate and set file directly
      if (!file.name.toLowerCase().endsWith('.dbf')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a .dbf file',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'File size must be less than 50MB',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('dbf_file', selectedFile);

      const response = await api.post('/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      setUploadResult(response.data);
      
      toast({
        title: 'Upload successful',
        description: `Successfully processed ${response.data.processed_records || 0} records`,
      });

      // Clear the selected file
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      const errorResult: UploadResponse = {
        success: false,
        message: error.response?.data?.message || 'Upload failed',
        errors: error.response?.data?.errors || [],
      };
      setUploadResult(errorResult);
      
      toast({
        title: 'Upload failed',
        description: errorResult.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Payslip Data</h1>
        <p className="text-muted-foreground">
          Upload .dbf files to process payslip data for employees
        </p>
      </div>

      {/* Upload Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CloudUpload className="h-5 w-5" />
              <span>File Upload</span>
            </CardTitle>
            <CardDescription>
              Select or drag and drop a .dbf file to upload
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                selectedFile
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <FileSpreadsheet className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <Button onClick={handleUpload} disabled={isUploading}>
                      {isUploading ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <UploadIcon className="h-4 w-4 mr-2" />
                          Upload File
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={clearFile} disabled={isUploading}>
                      <FileX className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <UploadIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Drop your .dbf file here</p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse files
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </Button>
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".dbf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Upload Guidelines</span>
            </CardTitle>
            <CardDescription>
              Important information about file uploads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">File Format</p>
                  <p className="text-xs text-muted-foreground">
                    Only .dbf (dBASE) files are supported
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">File Size</p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size is 50MB
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Data Structure</p>
                  <p className="text-xs text-muted-foreground">
                    Ensure the file contains employee payroll data with proper field names
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Processing Time</p>
                  <p className="text-xs text-muted-foreground">
                    Large files may take several minutes to process
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Always backup your data before uploading. Processed data will overwrite existing payslip records for the same period.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {uploadResult.success ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              <span>Upload Result</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={uploadResult.success ? "default" : "destructive"}>
                {uploadResult.success ? 'Success' : 'Failed'}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Message:</p>
              <p className="text-sm text-muted-foreground">{uploadResult.message}</p>
            </div>

            {uploadResult.processed_records && (
              <div>
                <p className="text-sm font-medium mb-2">Records Processed:</p>
                <p className="text-sm text-muted-foreground">
                  {uploadResult.processed_records} payslip records were successfully processed
                </p>
              </div>
            )}

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Errors:</p>
                <ul className="text-sm text-destructive space-y-1">
                  {uploadResult.errors.map((error, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span>•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};