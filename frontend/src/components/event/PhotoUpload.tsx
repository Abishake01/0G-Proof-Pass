import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { storageService } from '../../services/storage';
import { useAccount } from 'wagmi';

interface PhotoUploadProps {
  eventId: number;
  onUploadComplete: (hash: string) => void;
}

export default function PhotoUpload({ eventId, onUploadComplete }: PhotoUploadProps) {
  const { address } = useAccount();
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedHashes, setUploadedHashes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError('Please select image files only');
      return;
    }

    const newPhotos = [...photos, ...imageFiles];
    setPhotos(newPhotos);

    // Create previews
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (photos.length === 0 || !address) {
      setError('Please select photos and ensure wallet is connected');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const hashes: string[] = [];

      for (const photo of photos) {
        const result = await storageService.uploadFile(photo, {
          eventId,
          walletAddress: address,
          timestamp: Date.now(),
        });
        hashes.push(result.hash);
      }

      setUploadedHashes(hashes);
      
      // Call onUploadComplete with the first hash (or all hashes)
      if (hashes.length > 0) {
        onUploadComplete(hashes[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Event Photos</label>
        <p className="text-xs text-text-secondary mb-4">
          Upload photos from the event to prove your attendance and participation.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-error/20 border border-error rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary w-full flex items-center justify-center gap-2"
          disabled={uploading}
        >
          <Upload className="w-4 h-4" />
          Select Photos
        </button>

        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-border"
                />
                {!uploadedHashes[index] && (
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1 bg-error rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
                {uploadedHashes[index] && (
                  <div className="absolute inset-0 bg-success/20 flex items-center justify-center rounded-lg">
                    <div className="text-success text-xs font-medium">Uploaded</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {photos.length > 0 && !uploadedHashes[0] && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading to 0G Storage...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                Upload to 0G Storage
              </>
            )}
          </button>
        )}

        {uploadedHashes.length > 0 && (
          <div className="mt-4 p-3 bg-success/20 border border-success rounded-lg">
            <p className="text-success text-sm font-medium">
              ✓ {uploadedHashes.length} photo(s) uploaded to 0G Storage
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Storage Hash: {uploadedHashes[0].slice(0, 20)}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

