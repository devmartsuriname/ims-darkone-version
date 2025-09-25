import { useState } from 'react';
import { resizeLogoMaintainAspectRatio, loadImageFromFile, canvasToBlob } from '@/utils/logo-resizer';
import newLogoSource from '@/assets/images/new-logo-source.png';

const LogoReplacer = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<{
    large: string;
    small: string;
  } | null>(null);

  const processLogos = async () => {
    setIsProcessing(true);
    try {
      // Load the source image
      const response = await fetch(newLogoSource);
      const blob = await response.blob();
      const file = new File([blob], 'logo.png', { type: 'image/png' });
      const sourceImage = await loadImageFromFile(file);

      // Create large version (for navigation - target height 28px but make it crisp)
      const largeCanvas = resizeLogoMaintainAspectRatio(sourceImage, 56); // 2x for crisp display
      const largeBlob = await canvasToBlob(largeCanvas);

      // Create small version (24x24 square for sidebar)
      const smallCanvas = resizeLogoMaintainAspectRatio(sourceImage, 24, 24);
      const smallBlob = await canvasToBlob(smallCanvas);

      // Create download URLs
      const largeUrl = URL.createObjectURL(largeBlob);
      const smallUrl = URL.createObjectURL(smallBlob);

      setDownloadLinks({
        large: largeUrl,
        small: smallUrl
      });

      console.log('Logo processing completed successfully');
    } catch (error) {
      console.error('Error processing logos:', error);
      alert('Error processing logos. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="page-title">Logo Replacer</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h4 className="header-title">Process New Transparent Logo</h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h5>Source Logo Preview:</h5>
                  <img 
                    src={newLogoSource} 
                    alt="New Logo Source" 
                    className="img-fluid border p-2 mb-3"
                    style={{ maxHeight: '150px', background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}
                  />
                </div>
                <div className="col-md-6">
                  <h5>Processing Info:</h5>
                  <ul className="list-unstyled">
                    <li><strong>Large Logo:</strong> Height 56px (2x for crisp display)</li>
                    <li><strong>Small Logo:</strong> 24x24px (centered in square)</li>
                    <li><strong>Format:</strong> PNG with transparency</li>
                    <li><strong>Quality:</strong> Lossless</li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <button 
                  className="btn btn-primary"
                  onClick={processLogos}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Process & Generate Logo Files'}
                </button>
              </div>

              {downloadLinks && (
                <div className="mt-4">
                  <h5>Download Processed Logos:</h5>
                  <div className="d-flex gap-3 justify-content-center">
                    <a 
                      href={downloadLinks.large} 
                      download="logo-large.png"
                      className="btn btn-success"
                    >
                      Download Large Logo (for dark & light)
                    </a>
                    <a 
                      href={downloadLinks.small} 
                      download="logo-sm.png"
                      className="btn btn-success"
                    >
                      Download Small Logo
                    </a>
                  </div>
                  
                  <div className="alert alert-info mt-3">
                    <h6>Manual Replacement Instructions:</h6>
                    <ol>
                      <li>Download both logo files above</li>
                      <li>Replace <code>src/assets/images/logo-dark.png</code> with the large logo</li>
                      <li>Replace <code>src/assets/images/logo-light.png</code> with the large logo (same file)</li>
                      <li>Replace <code>src/assets/images/logo-sm.png</code> with the small logo</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoReplacer;