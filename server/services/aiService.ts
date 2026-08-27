import { GoogleGenAI } from '@google/genai';
import { Product, RecommendationRequest, RecommendationResponse } from '../types.js';
import { recommendationService } from './recommendationService.js';
import { sentimentService } from './sentimentService.js';

export class AIService {
  private genAI: GoogleGenAI | null = null;
  private hasApiKey = false;

  constructor() {
    this.initClient();
  }

  private initClient() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
      try {
        this.genAI = new GoogleGenAI({
          apiKey: apiKey.trim(),
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        this.hasApiKey = true;
        console.log('🤖 AI Service: Gemini API Key detected & initialized with model gemini-3.7-flash');
      } catch (err) {
        console.warn('⚠️ AI Service: Failed to initialize Gemini API client, falling back to local engine:', err);
        this.genAI = null;
        this.hasApiKey = false;
      }
    } else {
      this.hasApiKey = false;
      console.log('💡 AI Service: Running in Local Intelligent Recommendation & NLP mode (No external API key required)');
    }
  }

  public isAiConfigured(): boolean {
    return this.hasApiKey && this.genAI !== null;
  }

  /**
   * Main recommendation pipeline that blends structured scoring with optional Gemini LLM reasoning.
   */
  public async getSmartRecommendation(
    catalogProducts: Product[],
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    // 1. Run core rule-based weighted recommendation algorithm on catalog products
    const localResult = recommendationService.rankProducts(catalogProducts, request);

    // 2. If Gemini API is available, enrich the recommendation with deep contextual AI narrative
    if (this.isAiConfigured() && this.genAI && localResult.topPick) {
      try {
        const top3 = localResult.recommendedProducts.slice(0, 3).map((p) => ({
          name: p.name,
          brand: p.brand,
          category: p.category,
          priceINR: p.priceINR,
          rating: p.rating,
          valueScore: p.valueScore,
          overallScore: p.overallScore,
          pros: p.pros,
          cons: p.cons,
          specs: p.specs,
        }));

        const prompt = `You are SmartBuy AI, an elite, unbiased shopping assistant.
A user asked: "${request.query || 'Recommend the best product'}"
Intended usage: ${request.usagePurpose || 'General use'}
Max budget: ₹${request.maxBudgetINR ? request.maxBudgetINR.toLocaleString('en-IN') : 'Any'}

Here are the top ranked candidates scored by our engine:
${JSON.stringify(top3, null, 2)}

Provide a concise, professional 3-sentence shopping verdict explaining why the top product (${localResult.topPick.name}) is the best choice for this user, noting its specific advantage over the alternatives.`;

        const response = await this.genAI.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
        });

        const aiText = response.text?.trim();
        if (aiText) {
          localResult.analysis.summary = aiText;
          localResult.analysis.aiPowered = true;
          localResult.analysis.provider = 'gemini';
        }
      } catch (err) {
        console.warn('⚠️ External Gemini call timed out or failed, using local recommendation summary:', err);
      }
    }

    return localResult;
  }

  /**
   * Conversational Assistant Chat Handler
   */
  public async chatShoppingAssistant(
    userMessage: string,
    catalogProducts: Product[]
  ): Promise<{
    reply: string;
    recommendations: RecommendationResponse;
    suggestedQuestions: string[];
    isAiPowered: boolean;
  }> {
    // 1. Compute recommendation from user query
    const recResult = await this.getSmartRecommendation(catalogProducts, { query: userMessage });

    // 2. Build conversational response
    if (this.isAiConfigured() && this.genAI) {
      try {
        const topPicksContext = recResult.recommendedProducts.slice(0, 4).map((p) => ({
          name: p.name,
          price: `₹${p.priceINR.toLocaleString('en-IN')}`,
          score: `${p.overallScore}/100`,
          keyPros: p.pros.slice(0, 2),
          keyCons: p.cons.slice(0, 1),
        }));

        const prompt = `You are SmartBuy AI's intelligent shopping companion.
User query: "${userMessage}"

Our algorithmic ranking identified these top options from our catalog:
${JSON.stringify(topPicksContext, null, 2)}

Respond directly and warmly to the user with a tailored, concise recommendation (max 100 words), highlighting why the top option fits their budget and needs, and what tradeoff they should keep in mind. Avoid generic hype.`;

        const response = await this.genAI.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
        });

        const reply = response.text?.trim() || recResult.analysis.summary;

        return {
          reply,
          recommendations: recResult,
          suggestedQuestions: [
            `How does ${recResult.topPick?.name || 'this'} compare with the cheaper alternative?`,
            `What are the battery life and build quality tradeoffs?`,
            `Is there a discount or better value option in another category?`,
          ],
          isAiPowered: true,
        };
      } catch (err) {
        console.warn('⚠️ Gemini chat call fallback:', err);
      }
    }

    // Local rule-based conversational reply
    let reply = '';
    if (recResult.topPick) {
      reply = `Based on your request "${userMessage}", our intelligent ranking engine calculated **${recResult.topPick.name}** as your best match with an overall score of **${recResult.topPick.overallScore}/100**.\n\n` +
        `• **Why it wins:** ${recResult.topPick.pros[0] || 'Top specifications in class'}.\n` +
        `• **Price:** ₹${recResult.topPick.priceINR.toLocaleString('en-IN')}${recResult.analysis.detectedBudgetINR ? ` (Within your ₹${recResult.analysis.detectedBudgetINR.toLocaleString('en-IN')} budget target)` : ''}.\n` +
        `• **Key Tradeoff:** ${recResult.topPick.cons[0] || 'Slightly higher premium'}.`;
    } else {
      reply = `I couldn't find a direct product match in the catalog for "${userMessage}". Try adjusting your budget or category filter.`;
    }

    return {
      reply,
      recommendations: recResult,
      suggestedQuestions: [
        'Compare the top 2 choices side-by-side',
        'Show me options with the longest battery life',
        'What is the best rated model under this price?',
      ],
      isAiPowered: false,
    };
  }

  /**
   * Analyzes raw review texts using Gemini or Local NLP
   */
  public async analyzeReviews(reviews: Array<{ comment: string; rating: number }>, productName: string) {
    const localAnalysis = sentimentService.aggregateSentiment(reviews);

    if (this.isAiConfigured() && this.genAI && reviews.length > 0) {
      try {
        const prompt = `Analyze these customer reviews for ${productName}:
${reviews.map((r, i) => `${i + 1}. [${r.rating}★]: "${r.comment}"`).join('\n')}

Extract:
1. 3 concise positive highlights (max 6 words each)
2. 2 critical concerns/weaknesses (max 6 words each)
3. Return valid JSON only: { "highlights": ["..."], "concerns": ["..."] }`;

        const response = await this.genAI.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.highlights && Array.isArray(parsed.highlights)) {
          localAnalysis.positiveHighlights = parsed.highlights;
        }
        if (parsed.concerns && Array.isArray(parsed.concerns)) {
          localAnalysis.negativeConcerns = parsed.concerns;
        }
      } catch (err) {
        console.warn('⚠️ Gemini review analysis fallback to local NLP:', err);
      }
    }

    return localAnalysis;
  }
}

export const aiService = new AIService();
