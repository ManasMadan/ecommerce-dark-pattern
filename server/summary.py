from transformers import pipeline
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def split_reviews(reviews, max_words=700):
    """
    Split a list of reviews into sublists, each containing no more than max_words words.
    """
    review_arrays = []
    current_words = 0
    current_array = []

    for review in reviews:
        review_length = len(review.split())

        if current_words + review_length > max_words:
            review_arrays.append(current_array)
            current_array = []
            current_words = 0

        current_array.append(review)
        current_words += review_length

    if current_array:
        review_arrays.append(current_array)

    review_arrays = [arr for arr in review_arrays if sum(len(review.split()) for review in arr) >= 160]

    return review_arrays

def summarize_reviews(review_arrays):
    """
    Summarize each array of reviews using the summarization model.
    """
    summaries = []

    for reviews in review_arrays:
        article = " ".join(reviews)
        summary = summarizer(article, max_length=130, min_length=30, do_sample=False)
        summaries.append(summary)

    return summaries

def overall_summary(summaries):
    """
    Generate an overall summary of all the individual summaries.
    """
    overall_text = " ".join(summary[0]["summary_text"] for summary in summaries)
    overall_summary = summarizer(overall_text, max_length=100, min_length=30, do_sample=False)

    return overall_summary

def getSummary(reviews):
    review_arrays = split_reviews(reviews)
    summaries = summarize_reviews(review_arrays)
    overall = overall_summary(summaries)
    return overall[0]["summary_text"]