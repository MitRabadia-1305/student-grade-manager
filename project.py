from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route('/export', methods=['POST'])
def export():
    file_path = "students.json"
    student_data = request.get_json()
    with open(file_path, "w") as file:
        json.dump(student_data, file, indent=4)

    return jsonify({"status": "success", "message": "Data exported successfully"})


@app.route('/save', methods=['POST'])
def save():
    file_path = 'student_data.json'
    student_data = request.get_json()

    with open(file_path, "w") as file:
        json.dump(student_data, file, indent=4)

    return jsonify({"status": "success", "message": "Data exported successfully"})

@app.route('/load', methods=['GET'])
def load():
    file_path = 'student_data.json'
    try:
        with open(file_path, "r") as file:
            student_data = json.load(file)

        return jsonify(student_data)
    except FileNotFoundError:
        return jsonify([])


if __name__ == "__main__":
    app.run()