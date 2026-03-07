'use client';

import React, { useState } from 'react';
import { uploadCsvFile } from '@/services/api';

export interface FileUploadProps {
  onUploadSuccess: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.includes('csv') || selectedFile.type.includes('plain')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a valid CSV file');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);

    try {
      const response = await uploadCsvFile(file, setUploadProgress);
      setSuccess(response.message);
      setFile(null);
      const inputElement = document.getElementById('fileInput') as HTMLInputElement;
      if (inputElement) {
        inputElement.value = '';
      }
      onUploadSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to upload file. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="card mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Upload CSV File</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <input
            id="fileInput"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isLoading}
            className="input-field flex-1 min-w-52 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!file || isLoading}
            className="btn-primary whitespace-nowrap"
          >
            {isLoading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {success && <div className="success-message">{success}</div>}
      </form>
    </div>
  );
};

export default FileUpload;
