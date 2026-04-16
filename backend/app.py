# from flask import Flask, jsonify
# from flask_cors import CORS
# from process_monitor import get_processes

# app = Flask(__name__)
# CORS(app)

# @app.route('/')
# def home():
#     return "Backend Running"

# @app.route('/processes')
# def processes():
#     return jsonify(get_processes())

# if __name__ == '__main__':
#     app.run(debug=True)
    
from flask import Flask, jsonify
from flask_cors import CORS
from process_monitor import get_processes

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Desktop tracker running"

@app.route('/processes')
def processes():
    # This still works for debugging
    # Shows current running processes snapshot
    return jsonify(get_processes())

@app.route('/desktop/current')
def current_desktop():
    from process_monitor import get_current_desktop_session
    data = get_current_desktop_session()
    return jsonify(data if data else {"name": "Idle", "minutes": 0})

if __name__ == '__main__':
    # process_monitor.py starts the tracker thread
    # automatically when imported above
    app.run(debug=True)