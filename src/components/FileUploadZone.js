import React, { useRef, useState } from 'react';

/**
 * Drag-and-drop file upload with preview, progress, replace, remove.
 */
const FileUploadZone = ({
  label,
  accept = 'image/*',
  previewUrl,
  onUpload,
  onRemove,
  hint,
  maxSizeMb = 10,
}) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFiles = async (file) => {
    if (!file) return;
    setError('');
    if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
      setError(`Max file size ${maxSizeMb}MB`);
      return;
    }
    setUploading(true);
    setProgress(20);
    try {
      const timer = setInterval(() => setProgress((p) => Math.min(p + 15, 90)), 120);
      await onUpload(file);
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => setProgress(0), 600);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Upload failed');
    }
    setUploading(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFiles(file);
  };

  return (
    <div className="form-group file-upload-zone-wrap">
      {label && <label className="label">{label}</label>}
      <div
        className={`file-upload-zone${dragging ? ' file-upload-zone--drag' : ''}${uploading ? ' file-upload-zone--busy' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="file-upload-zone-input"
          onChange={(e) => {
            handleFiles(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <div className="file-upload-zone-inner">
          <span className="file-upload-zone-icon" aria-hidden="true">📁</span>
          <p className="file-upload-zone-title">
            {uploading ? 'Uploading…' : 'Drop file here or tap to browse'}
          </p>
          {hint && <p className="file-upload-zone-hint">{hint}</p>}
        </div>
        {uploading && (
          <div className="file-upload-zone-progress">
            <div className="file-upload-zone-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      {error && <p className="file-upload-zone-error">{error}</p>}
      {previewUrl && (
        <div className="file-upload-zone-preview">
          <img src={previewUrl} alt="" />
          <div className="file-upload-zone-preview-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()}>
              Replace
            </button>
            {onRemove && (
              <button type="button" className="btn btn-danger btn-sm" onClick={onRemove}>
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
