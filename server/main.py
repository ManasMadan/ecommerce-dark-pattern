from flask import Flask, jsonify, request 
from fake_review import filter_reviews
from summary import getSummary
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/') 
def home(): 
    return jsonify({'error':False,'message':"Working - Home Page"}) 

@app.route('/analyze-reviews',methods=["POST"])
def analyze_reviews():
    try:
        data = request.get_json()
        reviews = data["reviews"]
        filtered_reviews = filter_reviews(reviews)
        summary = getSummary(filtered_reviews)
        return jsonify({'error':False,'message':"Working","summary":summary,"filtered":filtered_reviews}) 
    except Exception as e:
        print(e)
        return jsonify({'error':True,'message':"Something Went Wrong"}) 
    