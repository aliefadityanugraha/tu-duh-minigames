import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

export function CustomSkinUploader({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file) => {
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('skin', file);

      try {
        const response = await fetch('/api/upload-skin', { method: 'POST', body: formData });
        const data = await response.json();
        if (response.ok && data.skinUrl) {
          onUpload(data.skinUrl);
        } else {
          console.error('Server error:', data);
          alert(`Gagal mengunggah skin: ${data.error || 'Server error'}`);
        }
      } catch (err) {
        console.error('Error uploading:', err);
        alert('Terjadi kesalahan saat mengunggah.');
      } finally {
        setIsUploading(false);
      }
    } else {
      alert('Mohon unggah file gambar yang valid!');
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center aspect-square rounded-xl border-4 border-black cursor-pointer select-none overflow-hidden transition-all duration-200 ${
        isDragging
          ? 'bg-[#ffe5b3] -translate-y-1 shadow-[5px_5px_0px_#000]'
          : 'bg-[#ffe5b3] hover:bg-[#ffd58f] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-y-0 active:shadow-[2px_2px_0px_#000] shadow-[3px_3px_0px_#000]'
      } ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => !isUploading && document.getElementById('skin-upload-input').click()}
    >
      <input
        id="skin-upload-input"
        type="file"
        accept="image/*"
        className="hidden"
        disabled={isUploading}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {isUploading ? (
        <div className="flex flex-col items-center justify-center p-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-2" />
          <p className="text-[9px] font-bold font-mono text-black text-center uppercase tracking-wider">MENGUNGGAH...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-2 text-black text-center">
          <Upload size={28} className="mb-1" />
          <p className="text-[10px] font-extrabold font-mono uppercase tracking-wider leading-tight">
            UPLOAD FOTO
          </p>
          <p className="text-[8px] font-mono opacity-80 mt-0.5 leading-none">
            KARAKTER
          </p>
        </div>
      )}
    </div>
  );
}
