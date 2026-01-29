#!/usr/bin/env python3
"""Generate a word cloud from commit messages."""

import logging
import re
import sys
from pathlib import Path

import matplotlib.pyplot as plt
from wordcloud import WordCloud

sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'config'))

logger = logging.getLogger(__name__)
from constants import (
    WORDCLOUD_WIDTH, WORDCLOUD_HEIGHT, WORDCLOUD_MAX_FONT_SIZE, WORDCLOUD_PREFER_HORIZONTAL,
    FIGURE_WIDTH_LARGE, FIGURE_HEIGHT, SAVE_DPI_STANDARD
)

# Stopwords to exclude from word cloud
STOPWORDS = {
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


def _clean_commit_text(text: str) -> str:
    """Clean commit message text for word cloud generation."""
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
    return re.sub(r'[^\w\s]', ' ', text)


def _create_wordcloud(text: str) -> WordCloud:
    """Create a WordCloud object from cleaned text."""
    return WordCloud(
        width=WORDCLOUD_WIDTH,
        height=WORDCLOUD_HEIGHT,
        background_color='white',
        colormap='viridis',
        max_words=100,
        stopwords=STOPWORDS,
        min_font_size=10,
        max_font_size=WORDCLOUD_MAX_FONT_SIZE,
        relative_scaling=0.5,
        prefer_horizontal=WORDCLOUD_PREFER_HORIZONTAL
    ).generate(text)


def _save_wordcloud(wordcloud: WordCloud, output_file: str) -> None:
    """Save word cloud image to file."""
    plt.figure(figsize=(FIGURE_WIDTH_LARGE, FIGURE_HEIGHT))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.tight_layout(pad=0)
    plt.savefig(output_file, dpi=SAVE_DPI_STANDARD, bbox_inches='tight', facecolor='white')
    plt.close()
    logger.info("Word cloud saved as %s", output_file)


def generate_wordcloud(
    input_file: str = 'commit_messages.txt',
    output_file: str = 'images/commit_wordcloud.png'
) -> None:
    """Generate a word cloud from commit messages."""
    with open(input_file, 'r') as f:
        text = f.read()

    cleaned_text = _clean_commit_text(text)
    wordcloud = _create_wordcloud(cleaned_text)
    _save_wordcloud(wordcloud, output_file)

if __name__ == '__main__':
    generate_wordcloud()
