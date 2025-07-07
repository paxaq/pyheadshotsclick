document.addEventListener('DOMContentLoaded', () => {
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

    let selectedFile = null;

    function resetApp() {
        selectedFile = null;
        imageUpload.value = ''; // Clear file input
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        imagePreviewContainer.style.display = 'none'; // Hide container
        imagePreviewSpinner.style.display = 'none'; // Hide spinner
        resultImage.src = '';
        resultImage.style.display = 'none';
        downloadBtn.href = '';
        downloadBtn.style.display = 'none';
        loading.style.display = 'none';
        errorMessage.textContent = '';
        genderSelect.value = 'none';
        backgroundSelect.value = 'neutral';
    }

    imageUpload.addEventListener('change', (event) => {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            imagePreviewContainer.style.display = 'flex'; // Show container
            imagePreviewSpinner.style.display = 'block'; // Show spinner
            imagePreview.style.display = 'none'; // Hide image until loaded

            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block'; // Show image
                imagePreviewSpinner.style.display = 'none'; // Hide spinner
            };
            reader.readAsDataURL(selectedFile);
        }
    });

    resetBtn.addEventListener('click', resetApp);

    generateBtn.addEventListener('click', () => {
        errorMessage.textContent = ''; // Clear previous errors
        if (!selectedFile) {
            errorMessage.textContent = 'Please upload an image first.';
            return;
        }
        generateHeadshot(selectedFile);
    });

    async function generateHeadshot(file) {
        loading.style.display = 'block';
        resultImage.style.display = 'none';
        errorMessage.textContent = '';

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
                pollForResult(prediction.id);
            } else {
                throw new Error('Invalid response from server.');
            }
        } catch (error) {
            loading.style.display = 'none';
            errorMessage.textContent = error.message;
        }
    }

    async function pollForResult(predictionId) {
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/get-prediction/${predictionId}`);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to get prediction status.');
                }

                if (result.status === 'succeeded') {
                    clearInterval(pollInterval);
                    loading.style.display = 'none';
                    resultImage.src = result.output;
                    resultImage.style.display = 'block';
                    console.log('Result image src set to:', resultImage.src);
                    console.log('Result image display style:', resultImage.style.display);
                    downloadBtn.href = result.output;
                    downloadBtn.style.display = 'block';
                } else if (result.status === 'failed' || result.status === 'canceled') {
                    clearInterval(pollInterval);
                    loading.style.display = 'none';
                    errorMessage.textContent = 'Headshot generation failed.';
                }
            } catch (error) {
                clearInterval(pollInterval);
                loading.style.display = 'none';
                errorMessage.textContent = error.message;
            }
        }, 2000);
    }
});
