import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, Row, Col, Button, Form, Badge, Alert, ProgressBar } from 'react-bootstrap'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

interface MobilePhotoControlProps {
  visitId: string
  applicationId: string
  onPhotoUploaded?: () => void
}

interface Photo {
  id: string
  file_path: string
  photo_category: string
  photo_description?: string | null
  taken_at: string | null
  file_size: number | null
  gps_latitude?: number | null
  gps_longitude?: number | null
}

const PHOTO_CATEGORIES = [
  { 
    key: 'EXTERIOR_FRONT', 
    label: 'Front Exterior', 
    icon: 'bx:home',
    description: 'Front view of the property',
    required: true 
  },
  { 
    key: 'EXTERIOR_BACK', 
    label: 'Back Exterior', 
    icon: 'bx:home-circle',
    description: 'Back view of the property',
    required: true 
  },
  { 
    key: 'INTERIOR_MAIN', 
    label: 'Main Interior', 
    icon: 'bx:home-heart',
    description: 'Main living areas',
    required: true 
  },
  { 
    key: 'STRUCTURAL_ISSUES', 
    label: 'Structural Issues', 
    icon: 'bx:error-circle',
    description: 'Any structural problems',
    required: false 
  },
  { 
    key: 'UTILITIES', 
    label: 'Utilities', 
    icon: 'bx:cog',
    description: 'Water, electrical, sanitation',
    required: true 
  },
  { 
    key: 'FOUNDATION', 
    label: 'Foundation', 
    icon: 'bx:building-house',
    description: 'Foundation condition',
    required: false 
  },
  { 
    key: 'ROOF', 
    label: 'Roof', 
    icon: 'bx:home-smile',
    description: 'Roof condition',
    required: false 
  },
  { 
    key: 'DEFECTS', 
    label: 'Defects', 
    icon: 'bx:x-circle',
    description: 'Visible defects or damage',
    required: false 
  }
]

const REQUIRED_CATEGORIES = PHOTO_CATEGORIES.filter(cat => cat.required).map(cat => cat.key)

export const MobilePhotoControl: React.FC<MobilePhotoControlProps> = ({
  visitId,
  applicationId,
  onPhotoUploaded
}) => {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('EXTERIOR_FRONT')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState<'capture' | 'gallery'>('capture')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [streamRef, setStreamRef] = useState<MediaStream | null>(null)

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Get GPS location
  const getCurrentLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.warn('Could not get location:', error)
          toast.warning('Location access denied. Photos will be saved without GPS data.')
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    }
  }, [])

  useEffect(() => {
    fetchPhotos()
    getCurrentLocation()
  }, [visitId, getCurrentLocation])

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('control_photos')
        .select('*')
        .eq('control_visit_id', visitId)
        .order('taken_at', { ascending: false })

      if (error) throw error
      setPhotos(data || [])
    } catch (error) {
      console.error('Error fetching photos:', error)
      toast.error('Failed to load photos')
    }
  }

  // Camera functionality
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
        setStreamRef(stream)
      }
    } catch (error) {
      console.error('Error starting camera:', error)
      toast.error('Unable to access camera')
    }
  }

  const stopCamera = () => {
    if (streamRef) {
      streamRef.getTracks().forEach(track => track.stop())
      setStreamRef(null)
    }
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
        await uploadPhoto(file)
        stopCamera()
      }
    }, 'image/jpeg', 0.8)
  }

  const uploadPhoto = async (file: File) => {
    if (!isOnline) {
      toast.warning('You are offline. Photos will be uploaded when connection is restored.')
      // TODO: Store in local storage for later upload
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Generate file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${visitId}_${selectedCategory}_${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('control-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Save photo metadata
      const { error: dbError } = await supabase
        .from('control_photos')
        .insert({
          control_visit_id: visitId,
          application_id: applicationId,
          photo_category: selectedCategory,
          photo_description: description || null,
          file_path: filePath,
          file_size: file.size,
          taken_by: user.id,
          taken_at: new Date().toISOString(),
          gps_latitude: location?.latitude || null,
          gps_longitude: location?.longitude || null
        })

      if (dbError) throw dbError

      toast.success('Photo uploaded successfully!')
      setDescription('')
      await fetchPhotos()
      onPhotoUploaded?.()

    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error('Failed to upload photo')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        await uploadPhoto(file)
      }
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    disabled: uploading
  })

  const getCategoryProgress = () => {
    const requiredCount = REQUIRED_CATEGORIES.length
    const completedRequired = REQUIRED_CATEGORIES.filter(cat => 
      photos.some(photo => photo.photo_category === cat)
    ).length
    
    return {
      completed: completedRequired,
      total: requiredCount,
      percentage: (completedRequired / requiredCount) * 100
    }
  }

  const getPhotosByCategory = (category: string) => {
    return photos.filter(photo => photo.photo_category === category)
  }

  const progress = getCategoryProgress()

  return (
    <div className="mobile-photo-control">
      {/* Status Bar */}
      <Alert variant={isOnline ? 'success' : 'warning'} className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <IconifyIcon icon={isOnline ? 'bx:wifi' : 'bx:wifi-off'} className="me-2" />
            {isOnline ? 'Connected' : 'Offline Mode'}
          </div>
          <div>
            {location ? (
              <Badge bg="success">GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Badge>
            ) : (
              <Badge bg="warning">No GPS</Badge>
            )}
          </div>
        </div>
      </Alert>

      {/* Progress Indicator */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Photo Progress</h6>
            <Badge bg={progress.percentage === 100 ? 'success' : 'warning'}>
              {progress.completed}/{progress.total} Required
            </Badge>
          </div>
          <ProgressBar 
            now={progress.percentage} 
            variant={progress.percentage === 100 ? 'success' : 'warning'}
            label={`${progress.percentage.toFixed(0)}%`}
          />
        </Card.Body>
      </Card>

      {/* Tab Navigation */}
      <div className="d-flex mb-3">
        <Button
          variant={activeTab === 'capture' ? 'primary' : 'outline-primary'}
          className="flex-fill me-2"
          onClick={() => setActiveTab('capture')}
        >
          <IconifyIcon icon="bx:camera" className="me-1" />
          Capture
        </Button>
        <Button
          variant={activeTab === 'gallery' ? 'primary' : 'outline-primary'}
          className="flex-fill"
          onClick={() => setActiveTab('gallery')}
        >
          <IconifyIcon icon="bx:image" className="me-1" />
          Gallery ({photos.length})
        </Button>
      </div>

      {activeTab === 'capture' && (
        <div>
          {/* Category Selection */}
          <Card className="mb-3">
            <Card.Body>
              <Form.Label>Photo Category</Form.Label>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mb-3"
              >
                {PHOTO_CATEGORIES.map(category => {
                  const count = getPhotosByCategory(category.key).length
                  return (
                    <option key={category.key} value={category.key}>
                      {category.label} ({count} photos) {category.required ? '*' : ''}
                    </option>
                  )
                })}
              </Form.Select>

              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description for this photo..."
              />
            </Card.Body>
          </Card>

          {/* Camera Interface */}
          <Card className="mb-3">
            <Card.Body>
              {!cameraActive ? (
                <div className="text-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={startCamera}
                    className="mb-3"
                  >
                    <IconifyIcon icon="bx:camera" className="me-2" />
                    Start Camera
                  </Button>
                </div>
              ) : (
                <div>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-100 mb-3"
                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                  />
                  <div className="d-flex gap-2">
                    <Button
                      variant="success"
                      size="lg"
                      onClick={capturePhoto}
                      disabled={uploading}
                      className="flex-fill"
                    >
                      <IconifyIcon icon="bx:camera" className="me-2" />
                      Capture Photo
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={stopCamera}
                      className="flex-fill"
                    >
                      <IconifyIcon icon="bx:x" className="me-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </Card.Body>
          </Card>

          {/* File Upload Alternative */}
          <Card>
            <Card.Body>
              <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                <div className="text-center p-4">
                  <IconifyIcon icon="bx:cloud-upload" style={{ fontSize: '3rem' }} className="text-muted mb-2" />
                  <p className="mb-0">
                    {isDragActive ? 'Drop photos here...' : 'Tap to select photos or drag & drop'}
                  </p>
                  <small className="text-muted">Max 25MB per photo</small>
                </div>
              </div>

              {uploading && (
                <div className="mt-3">
                  <ProgressBar
                    now={uploadProgress}
                    label={`Uploading... ${uploadProgress.toFixed(0)}%`}
                    animated
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div>
          {PHOTO_CATEGORIES.map(category => {
            const categoryPhotos = getPhotosByCategory(category.key)
            
            return (
              <Card key={category.key} className="mb-3">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <IconifyIcon icon={category.icon} className="me-2" />
                      <span>{category.label}</span>
                      {category.required && <Badge bg="info" className="ms-2">Required</Badge>}
                    </div>
                    <Badge bg={categoryPhotos.length > 0 ? 'success' : 'secondary'}>
                      {categoryPhotos.length} photos
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p className="text-muted small mb-3">{category.description}</p>
                  
                  {categoryPhotos.length === 0 ? (
                    <div className="text-center py-3">
                      <IconifyIcon icon="bx:image" className="text-muted mb-2" style={{ fontSize: '2rem' }} />
                      <p className="text-muted small mb-0">No photos in this category</p>
                    </div>
                  ) : (
                    <Row>
                      {categoryPhotos.map((photo) => (
                        <Col xs={6} md={4} key={photo.id} className="mb-3">
                          <div className="position-relative">
                            <img
                              src={`${supabase.storage.from('control-photos').getPublicUrl(photo.file_path).data.publicUrl}`}
                              alt={photo.photo_description || category.label}
                              className="img-fluid rounded"
                              style={{ aspectRatio: '1:1', objectFit: 'cover' }}
                            />
                            {photo.photo_description && (
                              <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-1">
                                <small>{photo.photo_description}</small>
                              </div>
                            )}
                          </div>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Card.Body>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MobilePhotoControl