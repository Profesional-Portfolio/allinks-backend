import { CloudinaryImageUploaderAdapter } from '../../../src/infraestructure/adapters/cloudinary-image-uploader.adapter';
import { v2 as cloudinary } from 'cloudinary';

jest.mock('cloudinary');

describe('CloudinaryImageUploaderAdapter', () => {
  let adapter: CloudinaryImageUploaderAdapter;
  let mockUploadStream: any;
  let mockUpload: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock upload_stream
    mockUploadStream = {
      end: jest.fn(),
    };

    // Mock cloudinary.uploader.upload_stream
    (cloudinary.uploader.upload_stream as jest.Mock) = jest.fn(
      (options, callback) => {
        // Store the callback for later invocation
        mockUploadStream.callback = callback;
        return mockUploadStream;
      }
    );

    // Mock cloudinary.uploader.upload
    mockUpload = jest.fn();
    (cloudinary.uploader.upload as jest.Mock) = mockUpload;

    adapter = new CloudinaryImageUploaderAdapter();
  });

  describe('uploadImage with Buffer', () => {
    it('should upload image successfully when filePath is a Buffer', async () => {
      const mockBuffer = Buffer.from('test image data');
      const mockResult = {
        secure_url: 'https://cloudinary.com/test-image.jpg',
        public_id: 'test-public-id-123',
      };

      const uploadPromise = adapter.uploadImage(mockBuffer);

      mockUploadStream.callback(null, mockResult);

      const result = await uploadPromise;

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { resource_type: 'auto' },
        expect.any(Function)
      );
      expect(mockUploadStream.end).toHaveBeenCalledWith(mockBuffer);
      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
      });
    });

    it('should reject when upload_stream returns an error', async () => {
      const mockBuffer = Buffer.from('test image data');
      const mockError = new Error('Upload failed');

      const uploadPromise = adapter.uploadImage(mockBuffer);

      mockUploadStream.callback(mockError, null);

      await expect(uploadPromise).rejects.toThrow('Upload failed');
      expect(mockUploadStream.end).toHaveBeenCalledWith(mockBuffer);
    });

    it('should reject when upload_stream returns no result', async () => {
      const mockBuffer = Buffer.from('test image data');

      const uploadPromise = adapter.uploadImage(mockBuffer);

      mockUploadStream.callback(null, null);

      await expect(uploadPromise).rejects.toBeNull();
      expect(mockUploadStream.end).toHaveBeenCalledWith(mockBuffer);
    });

    it('should handle large Buffer uploads', async () => {
      const largeBuffer = Buffer.alloc(5 * 1024 * 1024); // 5MB buffer
      const mockResult = {
        secure_url: 'https://cloudinary.com/large-image.jpg',
        public_id: 'large-public-id',
      };

      const uploadPromise = adapter.uploadImage(largeBuffer);
      mockUploadStream.callback(null, mockResult);

      const result = await uploadPromise;

      expect(mockUploadStream.end).toHaveBeenCalledWith(largeBuffer);
      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
      });
    });

    it('should handle empty Buffer', async () => {
      const emptyBuffer = Buffer.from('');
      const mockResult = {
        secure_url: 'https://cloudinary.com/empty.jpg',
        public_id: 'empty-id',
      };

      const uploadPromise = adapter.uploadImage(emptyBuffer);
      mockUploadStream.callback(null, mockResult);

      const result = await uploadPromise;

      expect(mockUploadStream.end).toHaveBeenCalledWith(emptyBuffer);
      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
      });
    });
  });

  describe('uploadImage with file path string', () => {
    it('should upload image successfully when filePath is a string', async () => {
      const mockFilePath = '/path/to/image.jpg';
      const mockResult = {
        secure_url: 'https://cloudinary.com/uploaded-image.jpg',
        public_id: 'uploaded-public-id-456',
      };

      mockUpload.mockImplementation((path, callback) => {
        callback(null, mockResult);
      });

      const result = await adapter.uploadImage(mockFilePath);

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { resource_type: 'auto' },
        expect.any(Function)
      );
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        mockFilePath,
        expect.any(Function)
      );
      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
      });
    });

    it('should reject when upload returns an error for string path', async () => {
      const mockFilePath = '/path/to/image.jpg';
      const mockError = new Error('File not found');

      mockUpload.mockImplementation((path, callback) => {
        callback(mockError, null);
      });

      await expect(adapter.uploadImage(mockFilePath)).rejects.toThrow(
        'File not found'
      );
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        mockFilePath,
        expect.any(Function)
      );
    });

    it('should reject when upload returns no result for string path', async () => {
      const mockFilePath = '/path/to/image.jpg';

      mockUpload.mockImplementation((path, callback) => {
        callback(null, null);
      });

      await expect(adapter.uploadImage(mockFilePath)).rejects.toBeNull();
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        mockFilePath,
        expect.any(Function)
      );
    });

    it('should handle relative file paths', async () => {
      const mockFilePath = './images/test.png';
      const mockResult = {
        secure_url: 'https://cloudinary.com/test.png',
        public_id: 'test-png-id',
      };

      mockUpload.mockImplementation((path, callback) => {
        callback(null, mockResult);
      });

      const result = await adapter.uploadImage(mockFilePath);

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        mockFilePath,
        expect.any(Function)
      );
      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
      });
    });

    it('should handle absolute file paths', async () => {
      const mockFilePath = '/home/user/images/photo.jpg';
      const mockResult = {
        secure_url: 'https://cloudinary.com/photo.jpg',
        public_id: 'photo-jpg-id',
      };

      mockUpload.mockImplementation((path, callback) => {
        callback(null, mockResult);
      });

      const result = await adapter.uploadImage(mockFilePath);

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        mockFilePath,
        expect.any(Function)
      );
      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
      });
    });

    it('should handle file paths with special characters', async () => {
      const mockFilePath = '/path/to/image with spaces & special-chars.jpg';
      const mockResult = {
        secure_url: 'https://cloudinary.com/special-image.jpg',
        public_id: 'special-id',
      };

      mockUpload.mockImplementation((path, callback) => {
        callback(null, mockResult);
      });

      const result = await adapter.uploadImage(mockFilePath);

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        mockFilePath,
        expect.any(Function)
      );
      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
      });
    });
  });

  describe('uploadImage error scenarios', () => {
    it('should handle network errors during Buffer upload', async () => {
      const mockBuffer = Buffer.from('test data');
      const networkError = new Error('ECONNREFUSED');

      const uploadPromise = adapter.uploadImage(mockBuffer);
      mockUploadStream.callback(networkError, null);

      await expect(uploadPromise).rejects.toThrow('ECONNREFUSED');
    });

    it('should handle network errors during string path upload', async () => {
      const mockFilePath = '/path/to/image.jpg';
      const networkError = new Error('ETIMEDOUT');

      mockUpload.mockImplementation((path, callback) => {
        callback(networkError, null);
      });

      await expect(adapter.uploadImage(mockFilePath)).rejects.toThrow(
        'ETIMEDOUT'
      );
    });

    it('should handle authentication errors', async () => {
      const mockBuffer = Buffer.from('test data');
      const authError = new Error('Invalid API credentials');

      const uploadPromise = adapter.uploadImage(mockBuffer);
      mockUploadStream.callback(authError, null);

      await expect(uploadPromise).rejects.toThrow('Invalid API credentials');
    });

    it('should handle quota exceeded errors', async () => {
      const mockFilePath = '/path/to/image.jpg';
      const quotaError = new Error('Quota exceeded');

      mockUpload.mockImplementation((path, callback) => {
        callback(quotaError, null);
      });

      await expect(adapter.uploadImage(mockFilePath)).rejects.toThrow(
        'Quota exceeded'
      );
    });

    it('should handle invalid file format errors', async () => {
      const mockFilePath = '/path/to/invalid.txt';
      const formatError = new Error('Unsupported file format');

      mockUpload.mockImplementation((path, callback) => {
        callback(formatError, null);
      });

      await expect(adapter.uploadImage(mockFilePath)).rejects.toThrow(
        'Unsupported file format'
      );
    });
  });

  describe('uploadImage result format', () => {
    it('should return correct structure with url and publicId', async () => {
      const mockBuffer = Buffer.from('test');
      const mockResult = {
        secure_url:
          'https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg',
        public_id: 'folder/sample',
      };

      const uploadPromise = adapter.uploadImage(mockBuffer);
      mockUploadStream.callback(null, mockResult);

      const result = await uploadPromise;

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('publicId');
      expect(typeof result.url).toBe('string');
      expect(typeof result.publicId).toBe('string');
    });

    it('should handle public_id with nested folders', async () => {
      const mockFilePath = '/path/to/image.jpg';
      const mockResult = {
        secure_url: 'https://cloudinary.com/image.jpg',
        public_id: 'folder1/folder2/folder3/image',
      };

      mockUpload.mockImplementation((path, callback) => {
        callback(null, mockResult);
      });

      const result = await adapter.uploadImage(mockFilePath);

      expect(result.publicId).toBe('folder1/folder2/folder3/image');
    });

    it('should handle URLs with query parameters', async () => {
      const mockBuffer = Buffer.from('test');
      const mockResult = {
        secure_url: 'https://cloudinary.com/image.jpg?version=123&format=auto',
        public_id: 'test-id',
      };

      const uploadPromise = adapter.uploadImage(mockBuffer);
      mockUploadStream.callback(null, mockResult);

      const result = await uploadPromise;

      expect(result.url).toBe(
        'https://cloudinary.com/image.jpg?version=123&format=auto'
      );
    });
  });

  describe('uploadImage with resource_type auto', () => {
    it('should always use resource_type auto for Buffer uploads', async () => {
      const mockBuffer = Buffer.from('test');
      const mockResult = {
        secure_url: 'https://cloudinary.com/test.jpg',
        public_id: 'test-id',
      };

      const uploadPromise = adapter.uploadImage(mockBuffer);
      mockUploadStream.callback(null, mockResult);

      await uploadPromise;

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { resource_type: 'auto' },
        expect.any(Function)
      );
    });

    it('should create upload_stream before processing string paths', async () => {
      const mockFilePath = '/path/to/image.jpg';
      const mockResult = {
        secure_url: 'https://cloudinary.com/image.jpg',
        public_id: 'image-id',
      };

      mockUpload.mockImplementation((path, callback) => {
        callback(null, mockResult);
      });

      await adapter.uploadImage(mockFilePath);

      // upload_stream should be called first
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
      expect(cloudinary.uploader.upload).toHaveBeenCalled();
    });
  });
});
