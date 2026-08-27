import { Product, ScoredProduct, RecommendationWeights, RecommendationRequest, RecommendationResponse } from '../types.js';

export const DEFAULT_WEIGHTS: RecommendationWeights = {
  ratingWeight: 0.30,
  valueForMoneyWeight: 0.25,
  featureMatchWeight: 0.20,
  reviewSentimentWeight: 0.15,
  userRequirementMatchWeight: 0.10,
};

export class RecommendationService {
  private customWeights: RecommendationWeights = { ...DEFAULT_WEIGHTS };

  public getWeights(): RecommendationWeights {
    return { ...this.customWeights };
  }

  public updateWeights(weights: Partial<RecommendationWeights>): RecommendationWeights {
    this.customWeights = {
      ratingWeight: weights.ratingWeight !== undefined ? Math.max(0, Math.min(1, weights.ratingWeight)) : this.customWeights.ratingWeight,
      valueForMoneyWeight: weights.valueForMoneyWeight !== undefined ? Math.max(0, Math.min(1, weights.valueForMoneyWeight)) : this.customWeights.valueForMoneyWeight,
      featureMatchWeight: weights.featureMatchWeight !== undefined ? Math.max(0, Math.min(1, weights.featureMatchWeight)) : this.customWeights.featureMatchWeight,
      reviewSentimentWeight: weights.reviewSentimentWeight !== undefined ? Math.max(0, Math.min(1, weights.reviewSentimentWeight)) : this.customWeights.reviewSentimentWeight,
      userRequirementMatchWeight: weights.userRequirementMatchWeight !== undefined ? Math.max(0, Math.min(1, weights.userRequirementMatchWeight)) : this.customWeights.userRequirementMatchWeight,
    };
    return this.getWeights();
  }

  /**
   * Parses natural language search or assistant query into structured intents (budget, category, usage, priority).
   */
  public parseNaturalQuery(query: string): {
    detectedCategory?: string;
    detectedBudgetINR?: number;
    detectedUsage?: string;
    detectedPriorities: string[];
  } {
    const q = query.toLowerCase();

    // 1. Budget extraction
    let detectedBudgetINR: number | undefined;
    // Matches patterns like "under 60,000", "under ₹60000", "under 60k", "under 1.5 lakh", "budget 30000", "< 50k"
    const kMatch = q.match(/(?:under|below|less than|within|budget of?|around|max)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
    const lakhMatch = q.match(/(?:under|below|less than|within|budget of?|around|max)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*lakh/i);
    const numMatch = q.match(/(?:under|below|less than|within|budget of?|around|max|₹|rs\.?)\s*(\d{4,7})/i);

    if (kMatch && kMatch[1]) {
      detectedBudgetINR = Math.round(parseFloat(kMatch[1]) * 1000);
    } else if (lakhMatch && lakhMatch[1]) {
      detectedBudgetINR = Math.round(parseFloat(lakhMatch[1]) * 100000);
    } else if (numMatch && numMatch[1]) {
      detectedBudgetINR = parseInt(numMatch[1], 10);
    }

    // 2. Category detection
    let detectedCategory: string | undefined;
    if (/laptop|macbook|notebook|pc|ultrabook|thinkpad|computer/i.test(q)) {
      detectedCategory = 'Laptops';
    } else if (/phone|smartphone|mobile|iphone|galaxy|pixel|oneplus/i.test(q)) {
      detectedCategory = 'Smartphones';
    } else if (/headphone|earbud|earphone|headset|audio|airpod|anc|tws|music/i.test(q)) {
      detectedCategory = 'Headphones';
    } else if (/watch|smartwatch|fitness tracker|garmin|apple watch/i.test(q)) {
      detectedCategory = 'Smart Watches';
    } else if (/tablet|ipad|pad|galaxy tab/i.test(q)) {
      detectedCategory = 'Tablets';
    } else if (/monitor|screen|display|ultrasharp|4k display|oled monitor/i.test(q)) {
      detectedCategory = 'Monitors';
    }

    // 3. Usage & Purpose detection
    let detectedUsage: string | undefined;
    if (/code|coding|developer|programming|vscode|docker|python|engineering/i.test(q)) {
      detectedUsage = 'coding';
    } else if (/college|student|university|school|study|note/i.test(q)) {
      detectedUsage = 'college';
    } else if (/game|gaming|esports|fps|rtx|steam|gpu/i.test(q)) {
      detectedUsage = 'gaming';
    } else if (/photo|photography|camera|video|creator|editing|youtube/i.test(q)) {
      detectedUsage = 'photography';
    } else if (/travel|commute|flight|train|portable/i.test(q)) {
      detectedUsage = 'travel';
    } else if (/office|work|business|meetings|excel|zoom/i.test(q)) {
      detectedUsage = 'office';
    } else if (/fitness|running|workout|gym|sports|health|marathon/i.test(q)) {
      detectedUsage = 'fitness';
    }

    // 4. Priority features
    const detectedPriorities: string[] = [];
    if (/battery|long life|endurance|charging/i.test(q)) detectedPriorities.push('Battery Life');
    if (/display|oled|screen|resolution|4k|120hz|144hz|color/i.test(q)) detectedPriorities.push('Display Quality');
    if (/performance|fast|speed|ram|processor|snappy/i.test(q)) detectedPriorities.push('Performance');
    if (/camera|photo|zoom|video/i.test(q)) detectedPriorities.push('Camera');
    if (/sound|audio|bass|anc|noise cancel/i.test(q)) detectedPriorities.push('Audio / ANC');
    if (/lightweight|light|slim|compact|portable/i.test(q)) detectedPriorities.push('Portability');
    if (/budget|cheap|value|affordable|bang for buck/i.test(q)) detectedPriorities.push('Value for Money');

    return {
      detectedCategory,
      detectedBudgetINR,
      detectedUsage,
      detectedPriorities,
    };
  }

  /**
   * Scores and ranks products based on user requirements and weighted formula.
   */
  public rankProducts(products: Product[], request: RecommendationRequest): RecommendationResponse {
    const rawQuery = request.query || '';
    const parsed = this.parseNaturalQuery(rawQuery);

    const category = request.category || parsed.detectedCategory;
    const maxBudget = request.maxBudgetINR || parsed.detectedBudgetINR;
    const usage = (request.usagePurpose || parsed.detectedUsage || '').toLowerCase();
    const priority = request.priorityFeature || (parsed.detectedPriorities[0] || '').toLowerCase();

    const activeWeights: RecommendationWeights = {
      ...this.customWeights,
      ...(request.weights || {}),
    };

    // Normalize weights to sum to 1.0
    const totalWeight =
      activeWeights.ratingWeight +
      activeWeights.valueForMoneyWeight +
      activeWeights.featureMatchWeight +
      activeWeights.reviewSentimentWeight +
      activeWeights.userRequirementMatchWeight;

    const normRatingWeight = totalWeight > 0 ? activeWeights.ratingWeight / totalWeight : 0.3;
    const normValueWeight = totalWeight > 0 ? activeWeights.valueForMoneyWeight / totalWeight : 0.25;
    const normFeatureWeight = totalWeight > 0 ? activeWeights.featureMatchWeight / totalWeight : 0.20;
    const normSentimentWeight = totalWeight > 0 ? activeWeights.reviewSentimentWeight / totalWeight : 0.15;
    const normReqWeight = totalWeight > 0 ? activeWeights.userRequirementMatchWeight / totalWeight : 0.10;

    // Filter products
    let pool = [...products];

    // Filter out excluded IDs
    if (request.excludeProductIds && request.excludeProductIds.length > 0) {
      pool = pool.filter((p) => !request.excludeProductIds!.includes(p.id));
    }

    // Filter by category if specified
    if (category) {
      const matchCat = pool.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      if (matchCat.length > 0) {
        pool = matchCat;
      }
    }

    // Calculate scores for each candidate
    const scoredProducts: ScoredProduct[] = pool.map((product) => {
      // 1. Rating Score (0 to 100)
      // Scaled by 5.0 and damped by review count confidence
      const ratingConfidence = Math.min(1.0, product.reviewCount / 1000);
      const ratingScore = Math.round((product.rating / 5.0) * 90 + ratingConfidence * 10);

      // 2. Value for Money Score (0 to 100)
      // Combines inherent valueScore with discount delta and price tier
      let valueScore = product.valueScore;
      if (product.originalPriceINR > product.priceINR) {
        const discountPct = (product.originalPriceINR - product.priceINR) / product.originalPriceINR;
        valueScore = Math.min(100, Math.round(valueScore + discountPct * 20));
      }

      // 3. Feature Match Score (0 to 100)
      let featureMatchPoints = 70;
      const searchableText = `${product.name} ${product.summary} ${product.features.join(' ')} ${Object.entries(product.specs).map(([k, v]) => `${k} ${v}`).join(' ')}`.toLowerCase();

      // Check query tokens
      if (rawQuery) {
        const tokens = rawQuery.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
        let matches = 0;
        tokens.forEach((t) => {
          if (searchableText.includes(t)) matches++;
        });
        if (tokens.length > 0) {
          featureMatchPoints = Math.min(100, 60 + Math.round((matches / tokens.length) * 40));
        }
      }

      // Check priority match
      if (priority) {
        if (priority.includes('battery') && searchableText.includes('battery')) featureMatchPoints += 15;
        if (priority.includes('oled') || priority.includes('display') && (searchableText.includes('oled') || searchableText.includes('display'))) featureMatchPoints += 15;
        if (priority.includes('anc') || priority.includes('sound') && (searchableText.includes('anc') || searchableText.includes('noise'))) featureMatchPoints += 15;
        if (priority.includes('camera') && searchableText.includes('camera')) featureMatchPoints += 15;
        if (priority.includes('lightweight') && (searchableText.includes('lightweight') || searchableText.includes('thin') || searchableText.includes('1.'))) featureMatchPoints += 15;
      }
      const featureMatchScore = Math.min(100, featureMatchPoints);

      // 4. Review Sentiment Score (0 to 100)
      const sentimentScore = product.sentimentSummary?.overallScore || 85;

      // 5. User Requirement Match Score (0 to 100)
      let reqScore = 75;

      // Budget fit calculation
      if (maxBudget) {
        if (product.priceINR <= maxBudget) {
          // Within budget: optimal range gets highest score
          const ratio = product.priceINR / maxBudget;
          if (ratio >= 0.70) reqScore += 20; // Sweet spot: utilizes budget for highest performance
          else reqScore += 15; // Generously under budget
        } else {
          // Over budget penalty
          const overRatio = (product.priceINR - maxBudget) / maxBudget;
          if (overRatio <= 0.15) {
            reqScore -= 10; // Slightly over budget (still considered if exceptional)
          } else {
            reqScore -= 40; // Significantly over budget
          }
        }
      }

      // Usage purpose match
      if (usage) {
        if (usage.includes('coding') && (searchableText.includes('ram') || searchableText.includes('ssd') || searchableText.includes('keyboard') || searchableText.includes('macbook') || searchableText.includes('intel') || searchableText.includes('ryzen'))) {
          reqScore += 15;
        }
        if (usage.includes('college') && (searchableText.includes('battery') || searchableText.includes('lightweight') || product.priceINR <= 70000)) {
          reqScore += 15;
        }
        if (usage.includes('gaming') && (searchableText.includes('rtx') || searchableText.includes('gpu') || searchableText.includes('144hz') || searchableText.includes('240hz'))) {
          reqScore += 25;
        }
        if (usage.includes('travel') && (searchableText.includes('anc') || searchableText.includes('battery') || searchableText.includes('lightweight') || searchableText.includes('fold'))) {
          reqScore += 15;
        }
      }

      const requirementMatchScore = Math.max(0, Math.min(100, reqScore));

      // Calculate Final Overall Score with Normalized Weights
      const overallScore = Math.round(
        ratingScore * normRatingWeight +
        valueScore * normValueWeight +
        featureMatchScore * normFeatureWeight +
        sentimentScore * normSentimentWeight +
        requirementMatchScore * normReqWeight
      );

      // Generate dynamic match reason
      let matchReason = '';
      if (maxBudget && product.priceINR <= maxBudget) {
        matchReason = `Fits perfectly within your budget of ₹${maxBudget.toLocaleString('en-IN')} with an outstanding ${overallScore}/100 match rating.`;
      } else if (usage) {
        matchReason = `Engineered ideally for ${usage} with strong ${product.features[0] || 'specifications'}.`;
      } else {
        matchReason = `Top rated ${product.category.toLowerCase().replace(/s$/, '')} with high satisfaction score of ${product.rating}★ and strong value rating.`;
      }

      return {
        ...product,
        overallScore,
        scoreBreakdown: {
          ratingScore,
          valueForMoneyScore: valueScore,
          featureMatchScore,
          sentimentScore,
          requirementMatchScore,
        },
        matchReason,
        keyStrengths: product.pros.slice(0, 3),
        keyWeaknesses: product.cons.slice(0, 2),
      };
    });

    // Sort descending by overallScore
    scoredProducts.sort((a, b) => b.overallScore - a.overallScore);

    // Assign Distinctive Badges to Top Products
    if (scoredProducts.length > 0) {
      scoredProducts[0].badge = 'Best Overall';

      // Find Best Value
      const bestVal = [...scoredProducts].sort((a, b) => b.scoreBreakdown.valueForMoneyScore - a.scoreBreakdown.valueForMoneyScore)[0];
      if (bestVal && bestVal.id !== scoredProducts[0].id) {
        bestVal.badge = 'Best Value';
      }

      // Find Best Rated
      const bestRated = [...scoredProducts].sort((a, b) => b.rating - a.rating)[0];
      if (bestRated && !bestRated.badge) {
        bestRated.badge = 'Best Rated';
      }

      // Find Budget Choice
      const budgetChoice = [...scoredProducts].sort((a, b) => a.priceINR - b.priceINR)[0];
      if (budgetChoice && !budgetChoice.badge) {
        budgetChoice.badge = 'Budget Choice';
      }
    }

    const topPick = scoredProducts[0] || null;
    const alternatives = scoredProducts.slice(1, 4);

    let summary = `Found ${scoredProducts.length} product(s) matching your criteria.`;
    if (topPick) {
      summary = `Based on your requirements, the **${topPick.name}** stands out as the top pick (Score: ${topPick.overallScore}/100) due to its superior ${topPick.pros[0]?.toLowerCase() || 'features'} and high value-for-money index.`;
    }

    return {
      analysis: {
        detectedCategory: category,
        detectedBudgetINR: maxBudget,
        detectedUsage: usage || undefined,
        detectedPriorities: parsed.detectedPriorities,
        aiPowered: false,
        provider: 'local-engine',
        summary,
      },
      recommendedProducts: scoredProducts,
      topPick,
      alternatives,
      weightsUsed: activeWeights,
    };
  }
}

export const recommendationService = new RecommendationService();
