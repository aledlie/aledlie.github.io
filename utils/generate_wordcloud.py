#!/usr/bin/env python3
"""Generate a word cloud from commit messages."""

from wordcloud import WordCloud
import matplotlib.pyplot as plt
import re

# WordCloud image configuration
WORDCLOUD_WIDTH = 1200
WORDCLOUD_HEIGHT = 600
MAX_FONT_SIZE = 120
PREFER_HORIZONTAL = 0.7

# Output figure configuration
FIGURE_WIDTH = 12
FIGURE_HEIGHT = 6
SAVE_DPI = 150

def generate_wordcloud(input_file='commit_messages.txt', output_file='images/commit_wordcloud.png'):
    """Generate a word cloud from commit messages."""

    # Read commit messages
    with open(input_file, 'r') as f:
        text = f.read()

    # Clean up text - remove common prefixes and technical noise
    # Remove conventional commit prefixes
    text = re.sub(r'\b(fix|feat|docs|style|refactor|chore|test|perf|ci|build)\b', '', text, flags=re.IGNORECASE)
    # Remove scope parentheses content but keep the word
    text = re.sub(r'\(([^)]+)\):', r'\1', text)
    # Remove URLs
    text = re.sub(r'https?://\S+', '', text)
    # Remove file paths
    text = re.sub(r'[\w/]+\.(js|ts|tsx|jsx|scss|css|html|md|json|yml|yaml|py|sh)', '', text)
    # Remove numbers
    text = re.sub(r'\b\d+\b', '', text)
    # Remove special characters but keep spaces
    text = re.sub(r'[^\w\s]', ' ', text)

    # Common stopwords to exclude
    stopwords = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
        'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
        'we', 'us', 'our', 'you', 'your', 'i', 'me', 'my', 'he', 'she', 'his', 'her',
        'not', 'no', 'yes', 'so', 'if', 'then', 'else', 'when', 'where', 'which',
        'who', 'whom', 'what', 'how', 'why', 'all', 'each', 'every', 'both',
        'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same',
        'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'use',
        'used', 'using', 'add', 'added', 'adding', 'update', 'updated', 'updating',
        'remove', 'removed', 'removing', 'change', 'changed', 'changes', 'changing',
        'new', 'file', 'files', 'code', 'via', 'into', 'etc', 'eg', 'ie'
    }

    # Generate word cloud
    wordcloud = WordCloud(
        width=WORDCLOUD_WIDTH,
        height=WORDCLOUD_HEIGHT,
        background_color='white',
        colormap='viridis',
        max_words=100,
        stopwords=stopwords,
        min_font_size=10,
        max_font_size=MAX_FONT_SIZE,
        relative_scaling=0.5,
        prefer_horizontal=PREFER_HORIZONTAL
    ).generate(text)

    # Save the image
    plt.figure(figsize=(FIGURE_WIDTH, FIGURE_HEIGHT))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.tight_layout(pad=0)
    plt.savefig(output_file, dpi=SAVE_DPI, bbox_inches='tight', facecolor='white')
    plt.close()

    print(f"Word cloud saved as '{output_file}'")

if __name__ == '__main__':
    generate_wordcloud()
