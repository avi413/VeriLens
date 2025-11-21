/**
 * VeriLens Camera Module - Simple Mobile Camera Like iOS/Android
 */

class CameraApp {
  constructor() {
    this.currentView = 'camera';
    this.stream = null;
    this.facingMode = 'environment'; // 'user' for front, 'environment' for back
    this.capturedImage = null;
    this.verificationResult = null;

    // DOM elements
    this.video = document.getElementById('camera');
    this.canvas = document.getElementById('canvas');
    this.statusElement = document.getElementById('status');

    // Buttons
    this.startCameraBtn = document.getElementById('start-camera');
    this.captureBtn = document.getElementById('capture');
    this.flipCameraBtn = document.getElementById('flip-camera');
    this.backToCameraBtn = document.getElementById('back-to-camera');
    this.viewResultsBtn = document.getElementById('view-results');
    this.backToProcessingBtn = document.getElementById('back-to-processing');
    this.newPhotoBtn = document.getElementById('new-photo');
    this.saveImageBtn = document.getElementById('save-image');

    this.init();
  }

  static init() {
    if (!window.cameraAppInstance) {
      window.cameraAppInstance = new CameraApp();
    }
    return window.cameraAppInstance;
  }

  init() {
    this.bindEvents();
    this.updateStatus('Ready to capture photos');
    console.log('📱 VeriLens Camera App initialized');
  }

  bindEvents() {
    // Camera controls
    this.startCameraBtn.addEventListener('click', () => this.startCamera());
    this.captureBtn.addEventListener('click', () => this.capturePhoto());
    this.flipCameraBtn.addEventListener('click', () => this.flipCamera());

    // Navigation
    this.backToCameraBtn.addEventListener('click', () =>
      this.showView('camera')
    );
    this.viewResultsBtn.addEventListener('click', () =>
      this.showView('dashboard')
    );
    this.backToProcessingBtn.addEventListener('click', () =>
      this.showView('processing')
    );
    this.newPhotoBtn.addEventListener('click', () => this.showView('camera'));

    // Download and Save functionality
    const downloadImageBtn = document.getElementById('download-image');
    if (downloadImageBtn) {
      downloadImageBtn.addEventListener('click', () => this.downloadImage());
    }

    const saveImageBtn = document.getElementById('save-image');
    if (saveImageBtn) {
      saveImageBtn.addEventListener('click', () => this.saveImage());
    }

    const downloadMetadataBtn = document.getElementById('download-metadata');
    if (downloadMetadataBtn) {
      downloadMetadataBtn.addEventListener('click', () =>
        this.downloadMetadata()
      );
    }

    // Navigation
    const showHashCheckerBtn = document.getElementById('show-hash-checker');
    if (showHashCheckerBtn) {
      showHashCheckerBtn.addEventListener('click', () =>
        this.showView('hash-checker')
      );
    }

    const showSavedImagesBtn = document.getElementById('show-saved-images');
    if (showSavedImagesBtn) {
      showSavedImagesBtn.addEventListener('click', () => {
        this.showSavedImagesDialog();
      });
    }

    const backFromHashCheckerBtn = document.getElementById(
      'back-from-hash-checker'
    );
    if (backFromHashCheckerBtn) {
      backFromHashCheckerBtn.addEventListener('click', () =>
        this.showView('camera')
      );
    }

    // Hash checker functionality
    this.initHashChecker();

    // Certificate and sharing
    document
      .getElementById('save-certificate')
      .addEventListener('click', () => this.saveCertificate());
    document
      .getElementById('share-results')
      .addEventListener('click', () => this.shareResults());
    document
      .getElementById('copy-hash')
      .addEventListener('click', () => this.copyHash());

    // Keyboard shortcuts (like iOS camera)
    document.addEventListener('keydown', (e) => {
      if (this.currentView === 'camera' && this.stream) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          this.capturePhoto();
        } else if (e.code === 'KeyF') {
          e.preventDefault();
          this.flipCamera();
        }
      }
    });
  }

  async startCamera() {
    try {
      this.updateStatus('Starting camera...');
      this.startCameraBtn.disabled = true;

      // Request camera with high quality settings (like iOS)
      const constraints = {
        video: {
          facingMode: this.facingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30 },
        },
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;

      // Enable controls
      this.captureBtn.disabled = false;
      this.flipCameraBtn.disabled = false;
      this.startCameraBtn.textContent = '✅ Camera Active';

      this.updateStatus('Camera ready - Position your subject');
      console.log('📹 Camera started successfully');
    } catch (error) {
      console.error('Camera error:', error);
      this.handleCameraError(error);
    }
  }

  async flipCamera() {
    if (!this.stream) return;

    try {
      // Stop current stream
      this.stream.getTracks().forEach((track) => track.stop());

      // Toggle facing mode
      this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';

      // Restart with new facing mode
      await this.startCamera();

      console.log(`📱 Camera flipped to ${this.facingMode}`);
    } catch (error) {
      console.error('Flip camera error:', error);
      this.updateStatus('Failed to flip camera');
    }
  }

  async capturePhoto() {
    if (!this.stream) return;

    try {
      this.updateStatus('Capturing photo...');

      // Set canvas size to match video
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;

      // Draw current video frame
      const ctx = this.canvas.getContext('2d');

      // Mirror front camera like iOS
      if (this.facingMode === 'user') {
        ctx.scale(-1, 1);
        ctx.translate(-this.canvas.width, 0);
      }

      ctx.drawImage(this.video, 0, 0);

      // Create image blob (high quality like iPhone)
      const blob = await new Promise((resolve) => {
        this.canvas.toBlob(resolve, 'image/jpeg', 0.95);
      });

      // Store captured image
      this.capturedImage = {
        blob: blob,
        dataUrl: this.canvas.toDataURL('image/jpeg', 0.95),
        timestamp: new Date().toISOString(),
        facingMode: this.facingMode,
        dimensions: {
          width: this.canvas.width,
          height: this.canvas.height,
        },
      };

      console.log('📸 Photo captured:', {
        size: `${(blob.size / 1024).toFixed(1)} KB`,
        dimensions: `${this.canvas.width}x${this.canvas.height}`,
        facingMode: this.facingMode,
      });

      // Show flash effect (like iOS)
      this.showFlashEffect();

      // Stop camera and go to processing
      this.stopCamera();
      this.startProcessing();
    } catch (error) {
      console.error('Capture error:', error);
      this.updateStatus('Failed to capture photo');
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
      this.video.srcObject = null;

      // Reset buttons
      this.startCameraBtn.disabled = false;
      this.startCameraBtn.textContent = '📹 Start Camera';
      this.captureBtn.disabled = true;
      this.flipCameraBtn.disabled = true;
    }
  }

  showFlashEffect() {
    // Create white flash overlay (like iOS camera)
    const flash = document.createElement('div');
    flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            opacity: 0;
            pointer-events: none;
            z-index: 9999;
        `;

    document.body.appendChild(flash);

    // Animate flash
    flash.animate([{ opacity: 0 }, { opacity: 0.8 }, { opacity: 0 }], {
      duration: 150,
      easing: 'ease-out',
    }).onfinish = () => {
      flash.remove();
    };
  }

  async startProcessing() {
    this.showView('processing');

    // Display captured photo
    const capturedImg = document.getElementById('captured-image');
    capturedImg.src = this.capturedImage.dataUrl;

    // Start verification process
    await VerificationService.processPhoto(
      this.capturedImage,
      (step, status) => {
        this.updateProcessingStep(step, status);
      }
    );

    // Enable view results button
    this.viewResultsBtn.disabled = false;
  }

  updateProcessingStep(stepId, status) {
    const stepElement = document.getElementById(`step-${stepId}`);
    if (!stepElement) return;

    const statusElement = stepElement.querySelector('.status');

    // Remove previous status
    stepElement.classList.remove('active', 'completed');

    switch (status) {
      case 'active':
        stepElement.classList.add('active');
        statusElement.textContent = '⏳';
        break;
      case 'completed':
        stepElement.classList.add('completed');
        statusElement.textContent = '✅';
        break;
      case 'error':
        statusElement.textContent = '❌';
        break;
    }
  }

  async saveImage() {
    if (!this.capturedImage || !this.verificationResult) {
      this.updateStatus('No image or verification result to save');
      return;
    }

    try {
      this.updateStatus('Saving image...');

      const response = await fetch('/api/save-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: this.capturedImage.dataUrl,
          metadata: {
            timestamp: this.capturedImage.timestamp,
            dimensions: this.capturedImage.dimensions,
            facingMode: this.capturedImage.facingMode,
            fileSize: this.capturedImage.blob.size,
            format: 'JPEG',
          },
          verificationResult: this.verificationResult,
        }),
      });

      const result = await response.json();

      if (result.success) {
        this.updateStatus(`✅ Image saved: ${result.filename}`);
        console.log('💾 Image saved successfully:', result);

        // Update dashboard with save info
        this.updateSaveInfo(result);
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      this.updateStatus(`❌ Failed to save: ${error.message}`);
    }
  }

  downloadImage() {
    if (!this.capturedImage) {
      this.updateStatus('No image to download');
      return;
    }

    try {
      // Create download link
      const link = document.createElement('a');
      link.href = this.capturedImage.dataUrl;

      // Generate filename with timestamp
      const timestamp = new Date(this.capturedImage.timestamp)
        .toISOString()
        .replace(/[:.]/g, '-');
      link.download = `verilens-${timestamp}.jpg`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.updateStatus('✅ Image downloaded successfully');
      console.log('⬇️ Image downloaded:', link.download);
    } catch (error) {
      console.error('Download error:', error);
      this.updateStatus(`❌ Download failed: ${error.message}`);
    }
  }

  downloadMetadata() {
    if (!this.verificationResult) {
      this.updateStatus('No verification data to download');
      return;
    }

    try {
      // Create comprehensive metadata
      const metadata = {
        image: {
          timestamp: this.capturedImage.timestamp,
          dimensions: this.capturedImage.dimensions,
          facingMode: this.capturedImage.facingMode,
          fileSize: this.capturedImage.blob.size,
          format: 'JPEG',
        },
        verification: this.verificationResult,
        downloadedAt: new Date().toISOString(),
        verilensVersion: '1.0.0',
      };

      // Create and download JSON file
      const jsonData = JSON.stringify(metadata, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date(this.capturedImage.timestamp)
        .toISOString()
        .replace(/[:.]/g, '-');
      link.download = `verilens-metadata-${timestamp}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      this.updateStatus('✅ Metadata downloaded successfully');
      console.log('📄 Metadata downloaded:', link.download);
    } catch (error) {
      console.error('Metadata download error:', error);
      this.updateStatus(`❌ Metadata download failed: ${error.message}`);
    }
  }

  updateSaveInfo(saveResult) {
    const saveInfoDiv = document.getElementById('save-info');
    if (saveInfoDiv) {
      saveInfoDiv.innerHTML = `
        <h3>💾 Saved Image</h3>
        <div class="metadata-item">
          <span class="label">Filename:</span>
          <span class="value">${saveResult.filename}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Size:</span>
          <span class="value">${(saveResult.fileSize / 1024).toFixed(
            1
          )} KB</span>
        </div>
        <div class="metadata-item">
          <span class="label">Path:</span>
          <span class="value">${saveResult.filePath}</span>
        </div>
        <a href="${saveResult.filePath}" target="_blank" class="btn btn-small">
          📁 View Image
        </a>
      `;
      saveInfoDiv.style.display = 'block';
    }
  }

  initHashChecker() {
    const fileInput = document.getElementById('hash-file-input');
    const selectBtn = document.getElementById('select-image-btn');
    const dragDropArea = document.getElementById('drag-drop-area');
    const compareBtn = document.getElementById('compare-hash-btn');
    const copyHashBtn = document.getElementById('copy-calculated-hash');

    // File selection
    if (selectBtn && fileInput) {
      selectBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.processImageForHash(e.target.files[0]);
        }
      });
    }

    // Drag and drop
    if (dragDropArea) {
      dragDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragDropArea.classList.add('dragover');
      });

      dragDropArea.addEventListener('dragleave', () => {
        dragDropArea.classList.remove('dragover');
      });

      dragDropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dragDropArea.classList.remove('dragover');

        if (e.dataTransfer.files.length > 0) {
          this.processImageForHash(e.dataTransfer.files[0]);
        }
      });

      dragDropArea.addEventListener('click', () => {
        if (fileInput) fileInput.click();
      });
    }

    // Hash comparison
    if (compareBtn) {
      compareBtn.addEventListener('click', () => {
        this.compareHashes();
      });
    }

    // Copy hash
    if (copyHashBtn) {
      copyHashBtn.addEventListener('click', () => {
        const hashElement = document.getElementById('calculated-hash');
        if (hashElement && hashElement.textContent !== 'Calculating...') {
          navigator.clipboard.writeText(hashElement.textContent).then(() => {
            copyHashBtn.textContent = '✅ Copied';
            setTimeout(() => {
              copyHashBtn.textContent = '📋 Copy';
            }, 2000);
          });
        }
      });
    }
  }

  async processImageForHash(file) {
    try {
      document.getElementById('hash-result-section').style.display = 'block';
      document.getElementById('calculated-hash').textContent = 'Calculating...';

      // Generate hash
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // Get image dimensions
      const img = new Image();
      const imgUrl = URL.createObjectURL(file);

      img.onload = () => {
        document.getElementById('calculated-hash').textContent = hash;
        document.getElementById('hash-file-size').textContent = `${(
          file.size / 1024
        ).toFixed(1)} KB`;
        document.getElementById(
          'hash-dimensions'
        ).textContent = `${img.width} × ${img.height}`;

        URL.revokeObjectURL(imgUrl);
      };

      img.src = imgUrl;
    } catch (error) {
      console.error('Hash calculation error:', error);
      document.getElementById('calculated-hash').textContent =
        'Error calculating hash';
    }
  }

  compareHashes() {
    const calculatedHash =
      document.getElementById('calculated-hash').textContent;
    const expectedHash = document
      .getElementById('expected-hash-input')
      .value.trim();
    const resultDiv = document.getElementById('hash-comparison-result');

    if (!expectedHash) {
      resultDiv.innerHTML = `
        <div class="comparison-result error">
          ❌ Please enter the expected hash from VeriLens
        </div>
      `;
      resultDiv.style.display = 'block';
      return;
    }

    if (
      calculatedHash === 'Calculating...' ||
      calculatedHash === 'Error calculating hash'
    ) {
      resultDiv.innerHTML = `
        <div class="comparison-result error">
          ❌ Please calculate an image hash first
        </div>
      `;
      resultDiv.style.display = 'block';
      return;
    }

    const isMatch = calculatedHash.toLowerCase() === expectedHash.toLowerCase();

    resultDiv.innerHTML = `
      <div class="comparison-result ${isMatch ? 'success' : 'error'}">
        ${isMatch ? '✅' : '❌'} ${
      isMatch
        ? 'HASHES MATCH - Image is Authentic'
        : 'HASHES DO NOT MATCH - Image has been tampered with or is different'
    }
      </div>
      <div class="hash-details">
        <div class="hash-row">
          <span class="label">Calculated:</span>
          <code>${calculatedHash}</code>
        </div>
        <div class="hash-row">
          <span class="label">Expected:</span>
          <code>${expectedHash}</code>
        </div>
      </div>
    `;

    resultDiv.style.display = 'block';
  }

  async showSavedImagesDialog() {
    try {
      // Fetch saved images list
      const response = await fetch('/api/saved-images');
      const data = await response.json();

      if (data.images && data.images.length > 0) {
        // Create modal dialog
        const modal = document.createElement('div');
        modal.className = 'saved-images-modal';
        modal.innerHTML = `
          <div class="modal-content">
            <div class="modal-header">
              <h3>📁 Saved Images (${data.images.length})</h3>
              <button class="close-btn" onclick="this.closest('.saved-images-modal').remove()">✕</button>
            </div>
            <div class="saved-images-grid">
              ${data.images
                .map(
                  (img) => `
                <div class="saved-image-item">
                  <img src="${img.path}" alt="${img.filename}" />
                  <div class="image-info">
                    <p class="filename">${img.filename}</p>
                    <div class="image-actions">
                      <a href="${img.path}" download="${img.filename}" class="btn btn-small">⬇️ Download</a>
                      <a href="${img.path}" target="_blank" class="btn btn-small">👁️ View</a>
                      <a href="${img.metadataPath}" download="${img.filename}.metadata.json" class="btn btn-small">📄 Metadata</a>
                    </div>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `;

        document.body.appendChild(modal);
      } else {
        this.updateStatus('No saved images found');
      }
    } catch (error) {
      console.error('Error fetching saved images:', error);
      this.updateStatus('Error loading saved images');
    }
  }

  showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach((view) => {
      view.classList.remove('active');
    });

    // Show target view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
      targetView.classList.add('active');
      this.currentView = viewName;
    }

    console.log(`📱 Switched to ${viewName} view`);
  }

  newPhoto() {
    // Reset everything and go back to camera
    this.capturedImage = null;
    this.verificationResult = null;
    this.showView('camera');
    this.updateStatus('Ready to capture photos');

    // Reset processing steps
    document.querySelectorAll('.step').forEach((step) => {
      step.classList.remove('active', 'completed');
      step.querySelector('.status').textContent = '⏳';
    });

    this.viewResultsBtn.disabled = true;
  }

  updateStatus(message) {
    this.statusElement.textContent = message;
    console.log('📱 Status:', message);
  }

  handleCameraError(error) {
    let message = 'Camera access failed';

    switch (error.name) {
      case 'NotAllowedError':
        message = 'Camera permission denied';
        break;
      case 'NotFoundError':
        message = 'No camera found';
        break;
      case 'NotSupportedError':
        message = 'Camera not supported';
        break;
    }

    this.updateStatus(message);
    this.startCameraBtn.disabled = false;
    this.startCameraBtn.textContent = '❌ Camera Error';
  }

  // Certificate and sharing functions
  async saveCertificate() {
    if (!this.verificationResult) return;

    try {
      const certificate = this.generateCertificate();
      const blob = new Blob([JSON.stringify(certificate, null, 2)], {
        type: 'application/json',
      });

      // Create download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verilens-certificate-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.updateStatus('Certificate saved');
    } catch (error) {
      console.error('Save certificate error:', error);
      this.updateStatus('Failed to save certificate');
    }
  }

  async shareResults() {
    if (!this.verificationResult) return;

    try {
      const shareData = {
        title: 'VeriLens Photo Verification',
        text: `Photo verified with ${this.verificationResult.confidence}% confidence`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\nHash: ${this.verificationResult.hash}`
        );
        this.updateStatus('Results copied to clipboard');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  }

  async copyHash() {
    if (!this.verificationResult?.hash) return;

    try {
      await navigator.clipboard.writeText(this.verificationResult.hash);
      this.updateStatus('Hash copied to clipboard');
    } catch (error) {
      console.error('Copy hash error:', error);
    }
  }

  generateCertificate() {
    return {
      version: '1.0',
      issuer: 'VeriLens Mobile Camera',
      timestamp: new Date().toISOString(),
      photo: {
        hash: this.verificationResult.hash,
        timestamp: this.capturedImage.timestamp,
        dimensions: this.capturedImage.dimensions,
      },
      blockchain: this.verificationResult.blockchain,
      verification: this.verificationResult.verification,
    };
  }
}

// Export for global access
window.CameraApp = CameraApp;
