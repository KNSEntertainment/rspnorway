"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  members: MemberData[];
}

interface MemberData {
  [key: string]: string;
}

export default function ExecutiveMemberBulkUpload({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const downloadTemplate = () => {
    const csvContent = `name,email,phone,address,city,postalCode,dateOfBirth,gender
John Doe,john@example.com,+47 123 45 678,Main Street 123,Oslo,0010,1990-01-01,male
Jane Smith,jane@example.com,+47 987 65 432,High Street 45,Bergen,5000,1985-05-15,female`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'executive-members-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const validateCSV = (content: string): ValidationResult => {
    const lines = content.split('\n').filter(line => line.trim());
    const errors: string[] = [];
    const members: MemberData[] = [];

    if (lines.length < 2) {
      errors.push('CSV must contain at least a header row and one data row');
      return { isValid: false, errors, members };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['name', 'email', 'phone', 'address', 'city', 'postalcode', 'dateofbirth', 'gender'];
    
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        errors.push(`Missing required column: ${required}`);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors, members };
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const member: MemberData = {};
      
      headers.forEach((header, index) => {
        member[header] = values[index] || '';
      });

      // Validate required fields
      if (!member.name) errors.push(`Row ${i + 1}: Name is required`);
      if (!member.email) errors.push(`Row ${i + 1}: Email is required`);
      if (!member.phone) errors.push(`Row ${i + 1}: Phone is required`);
      if (!member.address) errors.push(`Row ${i + 1}: Address is required`);
      if (!member.city) errors.push(`Row ${i + 1}: City is required`);
      if (!member.postalcode) errors.push(`Row ${i + 1}: Postal code is required`);
      if (!member.dateofbirth) errors.push(`Row ${i + 1}: Date of birth is required`);
      if (!member.gender) errors.push(`Row ${i + 1}: Gender is required`);
      
      // Validate email format
      if (member.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
        errors.push(`Row ${i + 1}: Invalid email format`);
      }

      // Validate gender
      if (member.gender && !['male', 'female', 'other', 'prefer-not-to-say'].includes(member.gender.toLowerCase())) {
        errors.push(`Row ${i + 1}: Gender must be one of: male, female, other, prefer-not-to-say`);
      }

      // Skip adding if there are validation errors for this row
      if (member.name && member.email && member.phone && member.address && member.city && 
          member.postalcode && member.dateofbirth && member.gender &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email) &&
          ['male', 'female', 'other', 'prefer-not-to-say'].includes(member.gender.toLowerCase())) {
        members.push(member);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      members
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setValidationResult({
          isValid: false,
          errors: ['Please select a valid CSV file'],
          members: []
        });
        return;
      }
      setFile(selectedFile);
      setValidationResult(null);
      setUploadResult(null);
    }
  };

  const handleValidate = async () => {
    if (!file) return;

    const content = await file.text();
    const validation = validateCSV(content);
    setValidationResult(validation);
  };

  const handleUpload = async () => {
    if (!validationResult?.isValid || validationResult.members.length === 0) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const response = await fetch('/api/executive-members/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ members: validationResult.members }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadResult({
          success: result.success || 0,
          failed: result.failed || 0,
          errors: result.errors || []
        });
        
        if (result.success > 0) {
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        }
      } else {
        setUploadResult({
          success: 0,
          failed: validationResult.members.length,
          errors: [result.error || 'Upload failed']
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadResult({
        success: 0,
        failed: validationResult.members.length,
        errors: ['Network error occurred']
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-brand">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Executive Members</h2>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>

      {/* Template Download Section */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Start with a template</h3>
            <p className="text-sm text-blue-700">Download the CSV template to see the required format</p>
          </div>
          <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Template
          </Button>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Select CSV File
        </label>
        <div className="border-2 border-dashed border-light rounded-lg p-6 text-center hover:border-brand transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 mb-1">
              {file ? file.name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-500">CSV files only</p>
          </label>
        </div>
      </div>

      {/* Validation Section */}
      {file && (
        <div className="mb-6">
          <Button onClick={handleValidate} variant="outline" className="w-full mb-4">
            <FileText className="w-4 h-4 mr-2" />
            Validate CSV
          </Button>
        </div>
      )}

      {/* Validation Results */}
      {validationResult && (
        <div className={`mb-6 p-4 rounded-lg border ${
          validationResult.isValid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center mb-2">
            {validationResult.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            )}
            <h3 className={`font-semibold ${
              validationResult.isValid ? 'text-green-900' : 'text-red-900'
            }`}>
              {validationResult.isValid ? 'Validation Successful' : 'Validation Failed'}
            </h3>
          </div>
          
          {validationResult.isValid ? (
            <p className="text-green-700 mb-2">
              Found {validationResult.members.length} valid member(s) ready to upload
            </p>
          ) : (
            <div className="space-y-1">
              {validationResult.errors.map((error, index) => (
                <p key={index} className="text-red-700 text-sm">• {error}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Section */}
      {validationResult?.isValid && validationResult.members.length > 0 && (
        <div className="mb-6">
          <Button 
            onClick={handleUpload} 
            disabled={uploading}
            className="w-full bg-brand hover:bg-brand/90"
          >
            {uploading ? 'Uploading...' : `Upload ${validationResult.members.length} Member(s)`}
          </Button>
        </div>
      )}

      {/* Upload Results */}
      {uploadResult && (
        <div className={`p-4 rounded-lg border ${
          uploadResult.success > 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center mb-2">
            {uploadResult.success > 0 ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            )}
            <h3 className={`font-semibold ${
              uploadResult.success > 0 ? 'text-green-900' : 'text-red-900'
            }`}>
              Upload Complete
            </h3>
          </div>
          
          <div className="space-y-1">
            <p className={`text-sm ${
              uploadResult.success > 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              ✓ {uploadResult.success} member(s) successfully uploaded
            </p>
            {uploadResult.failed > 0 && (
              <p className="text-sm text-red-700">
                ✗ {uploadResult.failed} member(s) failed to upload
              </p>
            )}
            
            {uploadResult.errors.length > 0 && (
              <div className="mt-2 space-y-1">
                {uploadResult.errors.map((error, index) => (
                  <p key={index} className="text-red-700 text-sm">• {error}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Required Columns:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>name</strong> - Full name (required)</li>
          <li>• <strong>email</strong> - Email address (required)</li>
          <li>• <strong>phone</strong> - Phone number (required)</li>
          <li>• <strong>address</strong> - Street address (required)</li>
          <li>• <strong>city</strong> - City name (required)</li>
          <li>• <strong>postalcode</strong> - Postal code (required)</li>
          <li>• <strong>dateofbirth</strong> - Date of birth (YYYY-MM-DD) (required)</li>
          <li>• <strong>gender</strong> - Gender: male, female, other, prefer-not-to-say (required)</li>
        </ul>
      </div>
    </div>
  );
}
