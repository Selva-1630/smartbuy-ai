import { SentimentAnalysisResult } from '../types.js';

interface AspectKeywordMap {
  [aspect: string]: {
    positive: string[];
    negative: string[];
  };
}

const ASPECT_MAP: AspectKeywordMap = {
  'battery': {
    positive: ['all-day', 'long battery', 'hours', 'endurance', 'fast charge', 'quick charge', 'supervooc', 'magsafe', 'lasts days', 'glacier battery', 'great battery'],
    negative: ['drains fast', 'battery drain', 'poor battery', 'short battery', 'slow charge', 'charge frequently', 'heavy drain'],
  },
  'performance': {
    positive: ['fast', 'blazing', 'smooth', 'powerful', 'no lag', 'snappy', 'quick', 'flawless', 'heavy multitasking', 'compiling', 'responsive'],
    negative: ['slow', 'laggy', 'stutter', 'sluggish', 'freezes', 'thermal throttle', 'heats up', 'hot', 'warm'],
  },
  'display': {
    positive: ['oled', 'vibrant', 'bright', '120hz', '144hz', 'sharp', 'crisp', 'anti-reflective', 'gorgeous display', 'deep blacks', 'stunning screen'],
    negative: ['dim', 'dull', '60hz', 'bezel', 'glare', 'subpixel', 'fringing', 'poor viewing angle', 'washed out'],
  },
  'camera': {
    positive: ['200mp', 'sharp photo', '5x zoom', 'great camera', 'night mode', 'portrait', 'natural skin tone', '4k 120fps', 'videography', 'clear selfie'],
    negative: ['grainy', 'blurry', 'poor low light', 'oversaturated', 'shutter lag', 'no telephoto', 'average camera'],
  },
  'build & design': {
    positive: ['titanium', 'lightweight', 'compact', 'premium', 'sleek', 'featherweight', 'all-metal', 'carbon fiber', 'thin', 'comfortable', 'solid build'],
    negative: ['bulky', 'heavy', 'plastic', 'fingerprints', 'fragile', 'scratches easily', 'clamping pressure', 'thick'],
  },
  'sound & audio': {
    positive: ['punchy bass', 'clear sound', 'spatial audio', 'ldac', 'crystal clear', 'dolby atmos', 'immersive', 'great mic', 'noise cancelling', 'anc'],
    negative: ['tinny', 'muffled', 'poor bass', 'average speakers', 'downward firing', 'weak mic', 'distortion'],
  },
  'value': {
    positive: ['worth every penny', 'value for money', 'budget friendly', 'affordable', 'bang for buck', 'great price', 'unbeatable value', 'great deal'],
    negative: ['overpriced', 'expensive', 'costly', 'not worth', 'pricey', 'poor value'],
  },
};

const POSITIVE_WORDS = new Set([
  'great', 'excellent', 'superb', 'awesome', 'good', 'fantastic', 'amazing', 'brilliant', 'impressive',
  'fast', 'smooth', 'reliable', 'durable', 'crisp', 'vibrant', 'clear', 'punchy', 'comfortable',
  'perfect', 'unbeatable', 'love', 'best', 'flawless', 'snappy', 'sharp', 'phenomenal', 'solid',
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'poor', 'slow', 'heavy', 'expensive', 'fragile', 'terrible', 'disappointing', 'dull',
  'laggy', 'stutter', 'warm', 'hot', 'dim', 'noisy', 'drain', 'overpriced', 'cheap', 'scratch',
  'bulky', 'flimsy', 'glitchy', 'defect', 'broke', 'annoying', 'hate', 'worst',
]);

export class SentimentService {
  /**
   * Analyzes an individual review text or array of reviews and extracts polarity, aspect highlights, and concerns.
   */
  public analyzeReviewText(text: string, userRating?: number): {
    score: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    label: string;
    highlights: string[];
    concerns: string[];
  } {
    const lower = text.toLowerCase();
    const words = lower.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach((w) => {
      if (POSITIVE_WORDS.has(w)) positiveCount++;
      if (NEGATIVE_WORDS.has(w)) negativeCount++;
    });

    const highlights: string[] = [];
    const concerns: string[] = [];

    // Analyze aspects
    for (const [aspect, keywords] of Object.entries(ASPECT_MAP)) {
      const hasPos = keywords.positive.some((phrase) => lower.includes(phrase));
      const hasNeg = keywords.negative.some((phrase) => lower.includes(phrase));

      if (hasPos) {
        highlights.push(`Positive ${aspect} mentioned`);
      }
      if (hasNeg) {
        concerns.push(`Concern regarding ${aspect}`);
      }
    }

    // Incorporate explicit user star rating if present
    let ratingBonus = 0;
    if (userRating) {
      if (userRating >= 4) ratingBonus = 15;
      else if (userRating <= 2) ratingBonus = -20;
    }

    const netScore = Math.max(0, Math.min(100, Math.round(50 + (positiveCount - negativeCount) * 10 + ratingBonus)));

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    let label = 'Mixed';

    if (netScore >= 65) {
      sentiment = 'positive';
      label = netScore >= 85 ? 'Very Positive' : 'Positive';
    } else if (netScore <= 40) {
      sentiment = 'negative';
      label = netScore <= 25 ? 'Very Negative' : 'Negative';
    }

    return {
      score: netScore,
      sentiment,
      label,
      highlights: highlights.slice(0, 3),
      concerns: concerns.slice(0, 3),
    };
  }

  /**
   * Aggregates multiple reviews into a unified SentimentAnalysisResult.
   */
  public aggregateSentiment(reviews: Array<{ comment: string; rating: number }>, baseProductFeatures?: string[]): SentimentAnalysisResult {
    if (!reviews || reviews.length === 0) {
      return {
        overallScore: 85,
        sentimentLabel: 'Positive',
        positivePercentage: 80,
        neutralPercentage: 15,
        negativePercentage: 5,
        positiveHighlights: ['Reliable everyday performance', 'Solid build quality'],
        negativeConcerns: ['Minor learning curve with new interface'],
        confidence: 80,
        totalReviewsAnalyzed: 0,
      };
    }

    let totalScore = 0;
    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;

    const allHighlights = new Set<string>();
    const allConcerns = new Set<string>();

    reviews.forEach((r) => {
      const res = this.analyzeReviewText(r.comment, r.rating);
      totalScore += res.score;
      if (res.sentiment === 'positive') posCount++;
      else if (res.sentiment === 'negative') negCount++;
      else neuCount++;

      res.highlights.forEach((h) => allHighlights.add(h));
      res.concerns.forEach((c) => allConcerns.add(c));
    });

    const count = reviews.length;
    const avgScore = Math.round(totalScore / count);
    const positivePercentage = Math.round((posCount / count) * 100);
    const negativePercentage = Math.round((negCount / count) * 100);
    const neutralPercentage = Math.max(0, 100 - positivePercentage - negativePercentage);

    let sentimentLabel: SentimentAnalysisResult['sentimentLabel'] = 'Positive';
    if (avgScore >= 88) sentimentLabel = 'Very Positive';
    else if (avgScore >= 68) sentimentLabel = 'Positive';
    else if (avgScore >= 45) sentimentLabel = 'Mixed';
    else if (avgScore >= 30) sentimentLabel = 'Negative';
    else sentimentLabel = 'Very Negative';

    // Fallback highlights from product features if empty
    const highlights = Array.from(allHighlights);
    if (highlights.length === 0 && baseProductFeatures && baseProductFeatures.length > 0) {
      highlights.push(`Praised for ${baseProductFeatures[0]}`);
      if (baseProductFeatures[1]) highlights.push(`Fast and responsive ${baseProductFeatures[1]}`);
    }

    const concerns = Array.from(allConcerns);

    return {
      overallScore: avgScore,
      sentimentLabel,
      positivePercentage,
      neutralPercentage,
      negativePercentage,
      positiveHighlights: highlights.slice(0, 4),
      negativeConcerns: concerns.length > 0 ? concerns.slice(0, 3) : ['No critical hardware flaws reported'],
      confidence: Math.min(99, Math.max(70, 75 + count * 3)),
      totalReviewsAnalyzed: count,
    };
  }
}

export const sentimentService = new SentimentService();
