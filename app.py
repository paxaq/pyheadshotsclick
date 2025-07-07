import os
from flask import Flask, render_template, request, jsonify
import replicate
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

cloudinary.config(
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key = os.getenv('CLOUDINARY_API_KEY'),
    api_secret = os.getenv('CLOUDINARY_API_SECRET')
)

# The replicate client uses the REPLICATE_API_TOKEN environment variable automatically.

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate-headshot', methods=['POST'])
def generate_headshot():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image_file = request.files['image']
    gender = request.form.get('gender')
    background = request.form.get('background')

    try:
        upload_result = cloudinary.uploader.upload(image_file, transformation=[{'width': 1024, 'height': 1024, 'crop': 'limit'}])
        image_url = upload_result['secure_url']
        print(f"Uploaded image to Cloudinary: {image_url}")
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return jsonify({'error': 'Failed to upload image to Cloudinary.'}), 500

    input_data = {"input_image": image_url}
    if gender and gender != 'none':
        input_data['gender'] = gender
    if background:
        input_data['background'] = background

    print(f"Sending data to Replicate: {input_data.keys()}") # Log keys to avoid printing large base64 string
    print(f"Image URL sent to Replicate: {image_url}")

    try:
        prediction = replicate.predictions.create(
            model="flux-kontext-apps/professional-headshot",
            input=input_data
        )
        print(f"Replicate prediction created: {prediction.dict()}")
    except replicate.exceptions.ReplicateError as e:
        print(f"Replicate API error: {e}")
        return jsonify({'error': str(e)}), 500

    return jsonify(prediction.dict())

@app.route('/get-prediction/<prediction_id>')
def get_prediction(prediction_id):
    try:
        prediction = replicate.predictions.get(prediction_id)
        print(f"Polling prediction {prediction_id}: status={prediction.status}, output={prediction.output}, error={prediction.error}")
    except replicate.exceptions.ReplicateError as e:
        print(f"Replicate API error during polling: {e}")
        return jsonify({'error': str(e)}), 500

    return jsonify(prediction.dict())

@app.errorhandler(Exception)
def handle_exception(e):
    # Log the exception for debugging purposes
    print(f"An unhandled exception occurred: {e}")
    # Return a JSON response with a 500 status code
    return jsonify({'error': 'An unexpected server error occurred.', 'details': str(e)}), 500