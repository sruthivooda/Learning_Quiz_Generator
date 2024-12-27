from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import json
import os

from app.models.question import Question
from app.mcq_generation import MCQGenerator

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

MQC_Generator = MCQGenerator()

@app.route("/")
@cross_origin()
def hello():
    return json.dumps('Hello to Leaf!')

@app.route("/generate", methods=["POST"])
@cross_origin()
def generate():
    requestJson = json.loads(request.data)
    text = requestJson['text']
    count = 10 if requestJson['count'] == '' else int(requestJson['count'])
    
    questions = MQC_Generator.generate_mcq_questions(text, count)
    result = list(map(lambda x: json.dumps(x.__dict__), questions))

    return json.dumps(result)

@app.route("/upload", methods=["POST"])
@cross_origin()
def upload():
    try:
        text = request.form.get('text')
        file = request.files.get('file')

        if file:
            save_dir = 'uploads'  # Use a writable directory within your project
            os.makedirs(save_dir, exist_ok=True)  # Create the directory if it doesn't exist
            file_path = os.path.join(save_dir, file.filename)
            file.save(file_path)
            # Process the file if needed

        # Update the context in context.txt
        with open('context.txt', 'w') as f:
            if text:
                f.write(text)
            elif file:
                # Read the file content and write to context.txt
                with open(file_path, 'r') as file_content:
                    content = file_content.read()
                    print(f"File content: {content}")  # Log the file content
                    f.write(content)

        # Generate output using LLM
        with open('context.txt', 'r') as f:
            context = f.read()
        questions = MQC_Generator.generate_mcq_questions(context, 10)
        result = list(map(lambda x: x.__dict__, questions))

        # Log the generated questions
        print(f"Generated questions: {result}")

        return jsonify({'status': 'success', 'result': result})
    except Exception as e:
        # Log the exception
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    from werkzeug.serving import run_simple
    run_simple('localhost', 9002, app)