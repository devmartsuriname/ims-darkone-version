import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';

interface Photo {
  id: string;
  file_path: string;
  photo_category: string;
  photo_description?: string | null;
  taken_at: string;
  file_size: number | null;
  gps_latitude?: number | null;
  gps_longitude?: number | null;
}

interface PhotoCaptureSystemProps {
  visitId: string;
  applicationId: string;
}

const PHOTO_CATEGORIES = [
  'EXTERIOR_FRONT',
  'EXTERIOR_BACK', 
  'EXTERIOR_SIDES',
  'FOUNDATION',
  'ROOF',
  'WALLS_INTERIOR',
  'WALLS_EXTERIOR',
  'FLOOR',
  'WINDOWS_DOORS',
  'SANITATION',
  'ELECTRICAL',
  'WATER_SUPPLY',
  'SEWERAGE',
  'DEFECTS',
  'GENERAL'
];

export const PhotoCaptureSystem = ({ visitId, applicationId }: PhotoCaptureSystemProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('GENERAL');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    fetchPhotos();
    getCurrentLocation();
  }, [visitId]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Could not get location:', error);
        }
      );
    }
  };

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('control_photos')
        .select('*')
        .eq('control_visit_id', visitId)
        .order('taken_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        await uploadPhoto(file);
      }
      
      fetchPhotos(); // Refresh photos list
      setDescription(''); // Clear description
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload some photos');
    } finally {
      setUploading(false);
    }
  }, [visitId, applicationId, selectedCategory, description, location]);

  const uploadPhoto = async (file: File) => {
    try {
      // Generate file path
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const filePath = `control-visits/${visitId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('control-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save photo metadata
      const { error: dbError } = await supabase
        .from('control_photos')
        .insert({
          control_visit_id: visitId,
          application_id: applicationId,
          file_path: filePath,
          photo_category: selectedCategory,
          photo_description: description || null,
          file_size: file.size,
          gps_latitude: location?.latitude,
          gps_longitude: location?.longitude,
          taken_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  const deletePhoto = async (photoId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('control-photos')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('control_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;

      toast.success('Photo deleted successfully');
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    disabled: uploading
  });

  const formatCategoryName = (category: string) => {
    return category.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPhotosByCategory = (category: string) => {
    return photos.filter(photo => photo.photo_category === category);
  };

  const getPhotoUrl = (filePath: string) => {
    return supabase.storage.from('control-photos').getPublicUrl(filePath).data.publicUrl;
  };

  return (
    <div className="row">
      <div className="col-lg-8">
        <div className="mb-4">
          <h6>Photo Upload</h6>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Photo Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                {PHOTO_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {formatCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control"
                placeholder="Brief description of the photo..."
              />
            </div>
          </div>

          <div
            {...getRootProps()}
            className={`border border-dashed rounded p-4 text-center ${
              isDragActive ? 'border-primary bg-light' : 'border-secondary'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div>
                <div className="spinner-border text-primary mb-2"></div>
                <p>Uploading photos...</p>
              </div>
            ) : isDragActive ? (
              <div>
                <i className="bx bx-cloud-upload display-4 text-primary mb-2"></i>
                <p>Drop photos here to upload</p>
              </div>
            ) : (
              <div>
                <i className="bx bx-camera display-4 text-muted mb-2"></i>
                <p>Drag & drop photos here, or click to select</p>
                <small className="text-muted">Supports: JPEG, PNG, GIF, WebP</small>
              </div>
            )}
          </div>

          {location && (
            <div className="mt-2">
              <small className="text-success">
                <i className="bx bx-current-location me-1"></i>
                GPS location captured: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </small>
            </div>
          )}
        </div>

        <div className="row">
          {PHOTO_CATEGORIES.map(category => {
            const categoryPhotos = getPhotosByCategory(category);
            if (categoryPhotos.length === 0) return null;

            return (
              <div key={category} className="col-12 mb-4">
                <h6 className="border-bottom pb-2">{formatCategoryName(category)} ({categoryPhotos.length})</h6>
                <div className="row">
                  {categoryPhotos.map(photo => (
                    <div key={photo.id} className="col-md-3 mb-3">
                      <div className="card">
                        <img
                          src={getPhotoUrl(photo.file_path)}
                          alt={photo.photo_description || 'Control photo'}
                          className="card-img-top"
                          style={{ height: '150px', objectFit: 'cover' }}
                        />
                        <div className="card-body p-2">
                          {photo.photo_description && (
                            <p className="card-text small mb-1">{photo.photo_description}</p>
                          )}
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {new Date(photo.taken_at).toLocaleTimeString()}
                            </small>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deletePhoto(photo.id, photo.file_path)}
                            >
                              <i className="bx bx-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="col-lg-4">
        <div className="card border">
          <div className="card-header">
            <h6 className="card-title mb-0">Photo Requirements</h6>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Total Photos:</span>
                <span className={`badge ${photos.length >= 5 ? 'bg-success' : 'bg-warning'}`}>
                  {photos.length}
                </span>
              </div>
              <small className="text-muted">Minimum 5 photos required</small>
            </div>

            <h6 className="mt-3">Photo Categories:</h6>
            <div className="list-group list-group-flush">
              {PHOTO_CATEGORIES.map(category => {
                const count = getPhotosByCategory(category).length;
                return (
                  <div key={category} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <small>{formatCategoryName(category)}</small>
                    <span className={`badge ${count > 0 ? 'bg-success' : 'bg-light text-dark'}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3">
              <h6>Guidelines:</h6>
              <ul className="list-unstyled small">
                <li><i className="bx bx-check text-success me-1"></i> Clear, well-lit photos</li>
                <li><i className="bx bx-check text-success me-1"></i> Multiple angles of defects</li>
                <li><i className="bx bx-check text-success me-1"></i> Include context/surroundings</li>
                <li><i className="bx bx-check text-success me-1"></i> GPS location auto-captured</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};