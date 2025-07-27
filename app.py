from flask import Flask, render_template, request, jsonify
import requests
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyD7mBHNqs90yxJ_mVhbLb7fvMDdkB1HUqQ"  # My API key
genai.configure(api_key=GEMINI_API_KEY)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search_word():
    try:
        word = request.json.get('word')
        if not word:
            return jsonify({'error': 'No word provided'}), 400
        
        # Free Dictionary API
        response = requests.get(f'https://api.dictionaryapi.dev/api/v2/entries/en/{word}')
        
        if response.status_code == 200:
            data = response.json()
            return jsonify(data)
        else:
            return jsonify({'error': 'Word not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/translate', methods=['POST'])
def translate_word():
    try:
        data = request.json
        word = data.get('word')
        target_lang = data.get('target_lang', 'es')
        
        if not word:
            return jsonify({'error': 'No word provided'}), 400
        
        # Language mapping for better prompts
        language_names = {
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese (Simplified)',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'nl': 'Dutch',
            'sv': 'Swedish',
            'no': 'Norwegian',
            'da': 'Danish',
            'fi': 'Finnish',
            'pl': 'Polish',
            'tr': 'Turkish',
            'th': 'Thai',
            'vi': 'Vietnamese'
        }
        
        target_language_name = language_names.get(target_lang, target_lang.upper())
        
        # Create Gemini model - using current model name
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Create a detailed prompt for better translation
        prompt = f"""
        Translate the English word "{word}" to {target_language_name}.
        
        Instructions:
        1. Provide only the most accurate translation
        2. If it's a single word, return only the translated word
        3. If it's a phrase, return the translated phrase
        4. Don't include explanations or additional text
        5. Return only the translation result
        
        Word to translate: {word}
        Target language: {target_language_name}
        """
        
        # Generate response
        response = model.generate_content(prompt)
        translated_text = response.text.strip()
        
        # Clean up the response (remove quotes if present)
        translated_text = translated_text.strip('"').strip("'")
        
        return jsonify({
            'original': word,
            'translated': translated_text,
            'target_language': target_lang,
            'target_language_name': target_language_name
        })
        
    except Exception as e:
        print(f"Translation error: {str(e)}")  # For debugging
        return jsonify({'error': f'Translation failed: {str(e)}'}), 500

# Optional: Add endpoint to get supported languages
@app.route('/languages', methods=['GET'])
def get_supported_languages():
    languages = {
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese (Simplified)',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'nl': 'Dutch',
        'sv': 'Swedish',
        'no': 'Norwegian',
        'da': 'Danish',
        'fi': 'Finnish',
        'pl': 'Polish',
        'tr': 'Turkish',
        'th': 'Thai',
        'vi': 'Vietnamese'
    }
    return jsonify(languages)

# Debug endpoint to list available models
@app.route('/list-models', methods=['GET'])
def list_models():
    try:
        models = []
        for model in genai.list_models():
            if 'generateContent' in model.supported_generation_methods:
                models.append(model.name)
        return jsonify({'available_models': models})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
