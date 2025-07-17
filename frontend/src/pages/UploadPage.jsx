import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.toLowerCase().endsWith('.dbf')) {
        setMessage('Please select a valid DBF file.');
        setMessageType('error');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage('Please select a DBF file to upload.');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('dbf_file', file);

      const response = await api.post('/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(response.data.message || 'File uploaded successfully!');
      setMessageType('success');
      setFile(null);
      
      // Reset the file input
      const fileInput = document.getElementById('dbf-file');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed. Please try again.');
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Upload</h1>
        <p className="text-muted-foreground">
          Upload DBF files to process employee payslip data.
        </p>
      </div>

      {/* Upload Form */}
      <Card className="shadow-corporate animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload DBF File</span>
          </CardTitle>
          <CardDescription>
            Select a DBF file containing payroll data to upload to the system.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dbf-file">DBF File</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <Input
                    id="dbf-file"
                    type="file"
                    accept=".dbf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="dbf-file"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">
                        Click to select DBF file
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or drag and drop your file here
                      </p>
                    </div>
                  </label>
                </div>
                
                {file && (
                  <div className="flex items-center space-x-2 p-3 bg-accent rounded-md">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <Alert 
                variant={messageType === 'error' ? 'destructive' : 'default'}
                className="animate-slide-up"
              >
                {messageType === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!file || uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload DBF File
                </>
              )}
            </Button>
          </form>

          {/* Information */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Important Notes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Only DBF files are accepted</li>
              <li>• File should contain valid payroll data structure</li>
              <li>• Processing may take a few minutes for large files</li>
              <li>• Ensure data integrity before uploading</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;