from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# Load and prepare data
df = pd.read_csv('movies.csv')
df['combined_features'] = df['Genre'] + ' ' + df['Overview'] + ' ' + df['Director'] + ' ' + df['Star1'] + ' ' + df['Star2'] + ' ' + df['Star3'] + ' ' + df['Star4']
tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(df['combined_features'])
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

def recommend_movies(query, topn=5):
    idx = df[df['SeriesTitle'].str.lower() == query.lower()].index
    if len(idx) == 0:
        return {'error': 'Movie not found in the dataset!'}
    idx = idx[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:topn+1]
    movie_indices = [i[0] for i in sim_scores]
    return df[['SeriesTitle', 'Genre', 'IMDBRating', 'Overview']].iloc[movie_indices].to_dict(orient='records')

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    query = data.get('query', '')
    result = recommend_movies(query)
    return jsonify(result)

@app.route('/')
def serve_index():
    return send_from_directory('.', 'Untitled-1.html')

@app.route('/main.js')
def serve_js():
    return send_from_directory('.', 'main.js')

if __name__ == '__main__':
    app.run(debug=True)
