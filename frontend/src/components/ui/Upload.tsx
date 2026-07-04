import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { uploadFile } from '../../api/api';
import { useNexoraStore } from '../../store/store';
import { UploadCloud, File, AlertCircle, Loader2 } from 'lucide-react';

interface UploadProps {
  id: string;
  label?: string;
  required?: boolean;
  helper_text?: string;
  accept?: string;
  multiple?: boolean;
}

export const Upload: React.FC<UploadProps> = ({
  id,
  label,
  required = false,
  helper_text,
  accept,
  multiple = false,
}) => {
  const { setValue, register, formState: { errors } } = useFormContext();
  const sessionId = useNexoraStore((state) => state.sessionId);
  const error = errors[id];

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ filename: string; path: string }>>([]);

  // Register value with react-hook-form
  register(id, { required: required ? `${label || id} is required` : false });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !sessionId) return;

    setUploading(true);
    setUploadError(null);

    try {
      const results: Array<{ filename: string; path: string }> = [];
      for (let i = 0; i < files.length; i++) {
        const fileResult = await uploadFile(sessionId, files[i]);
        results.push({
          filename: fileResult.filename,
          path: fileResult.path,
        });
      }

      const updated = multiple ? [...uploadedFiles, ...results] : results;
      setUploadedFiles(updated);

      // Save list to react-hook-form state
      setValue(id, multiple ? updated : updated[0], { shouldValidate: true });
    } catch (err) {
      console.error('File upload failure:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <span className="text-sm font-medium text-dark-200">
          {label} {required && <span className="text-accent-error">*</span>}
        </span>
      )}

      <div className="relative">
        <label className="flex flex-col items-center justify-center w-full min-h-[140px] px-6 py-6 border-2 border-dashed border-dark-600 rounded-xl bg-dark-800/20 hover:bg-dark-800/40 hover:border-accent-primary transition-all cursor-pointer group">
          <input
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            disabled={uploading || !sessionId}
          />
          <div className="flex flex-col items-center gap-2 text-center">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-accent-primary animate-spin" />
                <span className="text-sm text-dark-200">Uploading file(s)...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-8 w-8 text-dark-400 group-hover:text-accent-primary transition-colors" />
                <span className="text-sm font-medium text-dark-200">
                  Click or drag files to upload
                </span>
                {accept && (
                  <span className="text-xs text-dark-400">Accepts: {accept}</span>
                )}
              </>
            )}
          </div>
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-2 space-y-2">
          {uploadedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-dark-800 border border-dark-600 text-sm text-white">
              <File size={16} className="text-accent-secondary" />
              <span className="truncate flex-1">{file.filename}</span>
              <span className="text-xs text-dark-300">Uploaded</span>
            </div>
          ))}
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 text-xs text-accent-error mt-1">
          <AlertCircle size={14} />
          <span>{uploadError}</span>
        </div>
      )}

      {helper_text && !error && !uploadError && (
        <span className="text-xs text-dark-300 mt-1">{helper_text}</span>
      )}
      {error && !uploadError && (
        <span className="text-xs text-accent-error mt-1">
          {error.message as string}
        </span>
      )}
    </div>
  );
};
