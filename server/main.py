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
        review_texts = [review["review"].replace('\"','') for review in filtered_reviews]
        stars_list = [float(review["stars"]) for review in filtered_reviews]
        corrected_ratings = sum(stars_list)/len(stars_list)
        summary = getSummary(review_texts)
        return jsonify({'error':False,'message':"Working","summary":summary,"filtered":filtered_reviews,"corrected_ratings":str(round(corrected_ratings, 2))}) 
    except Exception as e:
        print(e)
        return jsonify({'error':True,'message':"Something Went Wrong"}) 
    