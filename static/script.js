document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const imageUpload = document.getElementById('image-upload');
    const resultImage = document.getElementById('result-image');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const genderSelect = document.getElementById('gender');
    const backgroundSelect = document.getElementById('background');
    const generateBtn = document.getElementById('generate-btn');
    const imagePreview = document.getElementById('image-preview');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreviewSpinner = document.getElementById('image-preview-spinner');
    const removeImageBtn = document.getElementById('remove-image');
    const resultContent = document.getElementById('result-content');
    const placeholderContent = document.getElementById('placeholder-content');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const shareBtn = document.getElementById('share-btn');

    let selectedFile = null;
    let currentStep = 0;

    // Progress steps for loading animation
    const progressSteps = document.querySelectorAll('.step');

    function updateProgressStep(stepIndex) {
        progressSteps.forEach((step, index) => {
            if (index <= stepIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    function resetApp() {
        selectedFile = null;
        currentStep = 0;

        // Reset file input
        imageUpload.value = '';

        // Reset preview
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        imagePreviewContainer.style.display = 'none';
        imagePreviewSpinner.style.display = 'none';

        // Reset results
        resultImage.src = '';
        resultContent.style.display = 'none';
        placeholderContent.style.display = 'flex';
        downloadBtn.href = '';
        downloadBtn.style.display = 'none';

        // Reset loading and error states
        loading.style.display = 'none';
        errorMessage.textContent = '';

        // Reset form values
        genderSelect.value = 'none';
        backgroundSelect.value = 'neutral';

        // Reset progress steps
        updateProgressStep(-1);
    }

    // Event Listeners
    imageUpload.addEventListener('change', handleImageUpload);
    resetBtn.addEventListener('click', resetApp);
    generateBtn.addEventListener('click', handleGenerate);

    // Remove image functionality
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            selectedFile = null;
            imageUpload.value = '';
            imagePreviewContainer.style.display = 'none';
            imagePreview.src = '';
        });
    }

    // Fullscreen functionality
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            if (resultImage.src) {
                const newWindow = window.open('', '_blank');
                newWindow.document.write(`
                    <html>
                        <head><title>Professional Headshot - Full Size</title></head>
                        <body style="margin:0;padding:20px;background:#000;display:flex;justify-content:center;align-items:center;min-height:100vh;">
                            <img src="${resultImage.src}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="Professional Headshot">
                        </body>
                    </html>
                `);
            }
        });
    }

    // Share functionality
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            if (navigator.share && resultImage.src) {
                try {
                    await navigator.share({
                        title: 'My Professional Headshot',
                        text: 'Check out my AI-generated professional headshot!',
                        url: window.location.href
                    });
                } catch (err) {
                    console.log('Error sharing:', err);
                    // Fallback to copying URL
                    copyToClipboard(window.location.href);
                }
            } else {
                // Fallback for browsers that don't support Web Share API
                copyToClipboard(window.location.href);
            }
        });
    }

    function handleImageUpload(event) {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(selectedFile.type)) {
                showError('Please upload a valid image file (JPG, PNG, or WebP).');
                return;
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (selectedFile.size > maxSize) {
                showError('File size must be less than 10MB.');
                return;
            }

            imagePreviewContainer.style.display = 'block';
            imagePreviewSpinner.style.display = 'block';
            imagePreview.style.display = 'none';

            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                imagePreviewSpinner.style.display = 'none';
                clearError();
            };
            reader.onerror = () => {
                showError('Error reading the image file.');
                imagePreviewContainer.style.display = 'none';
            };
            reader.readAsDataURL(selectedFile);
        }
    }

    function handleGenerate() {
        clearError();
        if (!selectedFile) {
            showError('Please upload an image first.');
            return;
        }
        generateHeadshot(selectedFile);
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function clearError() {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            // Show a temporary success message
            const originalText = shareBtn.innerHTML;
            shareBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                shareBtn.innerHTML = originalText;
            }, 2000);
        }).catch(() => {
            console.log('Failed to copy to clipboard');
        });
    }

    async function generateHeadshot(file) {
        // Show loading state
        loading.style.display = 'block';
        placeholderContent.style.display = 'none';
        resultContent.style.display = 'none';
        clearError();

        // Reset progress
        currentStep = 0;
        updateProgressStep(0);

        // Disable generate button during processing
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        const formData = new FormData();
        formData.append('image', file);
        formData.append('gender', genderSelect.value);
        formData.append('background', backgroundSelect.value);

        try {
            const response = await fetch('/generate-headshot', {
                method: 'POST',
                body: formData
            });

            const prediction = await response.json();

            if (!response.ok) {
                throw new Error(prediction.error || 'Failed to start headshot generation.');
            }

            if (prediction.urls && prediction.urls.get) {
                // Move to AI enhancement step
                currentStep = 1;
                updateProgressStep(1);
                pollForResult(prediction.id);
            } else {
                throw new Error('Invalid response from server.');
            }
        } catch (error) {
            handleGenerationError(error.message);
        }
    }

    function handleGenerationError(message) {
        loading.style.display = 'none';
        placeholderContent.style.display = 'flex';
        showError(message);

        // Re-enable generate button
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Professional Headshot';

        // Reset progress
        updateProgressStep(-1);
    }

    async function pollForResult(predictionId) {
        let pollCount = 0;
        const maxPolls = 60; // Maximum 2 minutes of polling

        const pollInterval = setInterval(async () => {
            pollCount++;

            // Timeout after max polls
            if (pollCount > maxPolls) {
                clearInterval(pollInterval);
                handleGenerationError('Generation timed out. Please try again.');
                return;
            }

            try {
                const response = await fetch(`/get-prediction/${predictionId}`);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to get prediction status.');
                }

                if (result.status === 'succeeded') {
                    clearInterval(pollInterval);

                    // Move to final step
                    currentStep = 2;
                    updateProgressStep(2);

                    // Small delay to show completion
                    setTimeout(() => {
                        handleGenerationSuccess(result.output);
                    }, 1000);

                } else if (result.status === 'failed' || result.status === 'canceled') {
                    clearInterval(pollInterval);
                    handleGenerationError('Headshot generation failed. Please try again.');
                }
                // Continue polling for 'starting' and 'processing' statuses
            } catch (error) {
                clearInterval(pollInterval);
                handleGenerationError(error.message);
            }
        }, 2000);
    }

    function handleGenerationSuccess(imageUrl) {
        // Hide loading, show result
        loading.style.display = 'none';
        resultContent.style.display = 'block';
        placeholderContent.style.display = 'none';

        // Set result image
        resultImage.src = imageUrl;
        downloadBtn.href = imageUrl;
        downloadBtn.style.display = 'block';

        // Re-enable generate button
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Professional Headshot';

        // Add success animation
        resultContent.style.opacity = '0';
        resultContent.style.transform = 'translateY(20px)';

        setTimeout(() => {
            resultContent.style.transition = 'all 0.5s ease';
            resultContent.style.opacity = '1';
            resultContent.style.transform = 'translateY(0)';
        }, 100);

        console.log('Headshot generation completed successfully');
    }

    // Drag and drop functionality
    const uploadZone = document.querySelector('.file-upload-zone');

    if (uploadZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            uploadZone.classList.add('drag-over');
        }

        function unhighlight() {
            uploadZone.classList.remove('drag-over');
        }

        uploadZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files.length > 0) {
                imageUpload.files = files;
                handleImageUpload({ target: { files: files } });
            }
        }
    }
});
