from catboost import CatBoostRegressor
from keras.preprocessing.sequence import pad_sequences
from keras.preprocessing.text import Tokenizer
import pandas as pd

data = pd.read_csv('fake_reviews_dataset.csv')
tokenizer = Tokenizer()
tokenizer.fit_on_texts(data['text_'])

model = CatBoostRegressor()
model = model.load_model("catboost_model.cbm")

def filter_reviews(reviews):
    original_reviews = []
    for review in reviews:
        review_seq = tokenizer.texts_to_sequences([review["review"]])
        review_padded = pad_sequences(review_seq, maxlen=521)
        predicted_prob = model.predict(review_padded)
        
        predicted_label = 'CG' if predicted_prob < 0.5 else 'OR'
        
        if predicted_label == 'OR':
            original_reviews.append(review)
    
    return original_reviews