# AI Headshots Click (Python)

This is a Python-based web application that transforms your photos into professional headshots using AI. Built with Flask, it allows you to simply upload an image, choose your preferences, and let the AI do the rest!

## Deployment (Vercel)

The fastest way to get started is to deploy this application to Vercel.

1.  **Fork this repository** to your own GitHub account.

2.  **Deploy to Vercel:**
    Click the button below to deploy the project directly to Vercel.
    [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fpyheadshotsclick)
    *(**Note:** Replace `your-username` in the URL above with your actual GitHub username after forking the repository.)*

3.  **Add Environment Variables:**
    During the Vercel setup, you will be prompted to add Environment Variables. Add the following:
    *   `REPLICATE_API_TOKEN`
    *   `CLOUDINARY_CLOUD_NAME`
    *   `CLOUDINARY_API_KEY`
    *   `CLOUDINARY_API_SECRET`

    Your application will be deployed and ready to use.

## Local Development

If you prefer to run the application on your local machine, follow these steps.

### 1. Setup and Installation

a. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/pyheadshotsclick.git
   cd pyheadshotsclick
   ```

b. **Create and activate a Python virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

c. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

d. **Configure Environment Variables:**
   Create a `.env` file in the root of the project and add your secret keys:
   ```
   REPLICATE_API_TOKEN=your_replicate_api_token
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

### 2. Usage

a. **Run the Flask application:**
   ```bash
   flask run
   ```

b. **Open your web browser** and navigate to `http://127.0.0.1:5000`.

c. **Upload an image,** select your desired gender and background, and click "Generate Headshot."

d. **Wait for the AI** to process the image. The generated headshot will appear on the right side of the screen.

e. **Download the headshot** using the "Download Headshot" button.

## How it Works

This application uses a Python Flask backend to handle user requests. When a user uploads a photo, it is first sent to Cloudinary for storage and transformation. The public URL of the stored image is then sent to the Replicate API, which runs an AI model to generate the professional headshot. The frontend polls the backend to check the status of the generation task and displays the final image once it's ready.

## Technologies Used

*   **Backend:** Python (Flask)
*   **Frontend:** HTML, CSS, JavaScript
*   **Image Upload & Storage:** Cloudinary
*   **AI Headshot Generation:** Replicate API
*   **Deployment:** Vercel

## License

This project is licensed under the MIT License.