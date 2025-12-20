# backend/services/topic_modeling.py
from bertopic import BERTopic

def analyze_topics(texts, language="english", top_n_words=5):
    """Discovers topics from a list of texts using BERTopic."""
    if not texts or len(texts) < 2:
        return []
        
    topic_model = BERTopic(language=language, verbose=False)
    topics, _ = topic_model.fit_transform(texts)
    
    # Get discovered topics and their keywords
    topic_info = topic_model.get_topic_info()
    
    results = []
    for _, row in topic_info.iterrows():
        # Skip the outlier topic often labeled as -1
        if row["Topic"] == -1:
            continue
            
        results.append({
            "topic_id": row["Topic"],
            "name": row["Name"],
            "count": row["Count"],
            "keywords": row["Name"].split("_")[1:] # Basic keyword extraction from name
        })
        
    return results
