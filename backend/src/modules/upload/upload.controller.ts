import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { File as MulterFile } from 'multer';
import { createReadStream, unlink } from 'fs';
import { UploadService, UploadResponse } from './upload.service';

/**
 * Controller responsible for handling file upload operations.
 * Manages CSV file uploads and delegates processing to the upload service.
 */
@Controller('api/upload')
export class UploadController {
  /**
   * Creates an instance of UploadController.
   * @param uploadService - Service for processing uploaded files
   */
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Handles POST requests for file uploads.
   * Validates file type, creates a read stream, and processes the upload.
   *
   * @param file - The uploaded file from the request
   * @returns Promise resolving to the upload response with processing results
   * @throws BadRequestException if no file is provided or file type is invalid
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      // Configure multer storage options
      storage: diskStorage({
        // Store uploaded files in the /tmp directory
        destination: '/tmp',
        // Generate unique filename with timestamp to avoid collisions
        filename: (_req, _file, cb) => cb(null, `upload-${Date.now()}.csv`),
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: MulterFile): Promise<UploadResponse> {
    // Validate that a file was actually uploaded
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file MIME type to ensure only CSV files are accepted
    if (!file.mimetype.includes('csv') && !file.mimetype.includes('plain')) {
      // Clean up temporary file before rejecting the request
      unlink(file.path, () => {});
      throw new BadRequestException('Only CSV files are allowed');
    }

    // Create a readable stream from the uploaded file
    const stream = createReadStream(file.path);

    try {
      // Process the uploaded file through the upload service
      return await this.uploadService.processUpload(stream);
    } finally {
      // Ensure temporary file is always deleted, regardless of success or failure
      unlink(file.path, () => {});
    }
  }
}
