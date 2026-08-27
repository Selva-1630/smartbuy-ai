# SmartBuy AI – Intelligent Shopping Assistant

SmartBuy AI is a full-stack, AI-powered intelligent shopping assistant web application. It combines multi-weighted decision algorithms, natural language understanding, and aspect-based review sentiment intelligence to evaluate products and deliver transparent, unbiased buying recommendations.

---

## 🌟 Key Capabilities

1. **Intelligent Product Discovery & Search**
   - Natural language search parser (extracts budget, category, and usage from phrases like *"Best laptop under ₹60,000 for coding"*).
   - Multi-category filtering (Smartphones, Laptops, Headphones, Smart Watches, Tablets, Monitors).
   - Brand, budget sliders, and sort options (Top Rated, Value for Money, Price Asc/Desc).
   - Instant autocomplete with live catalog matches.

2. **5-Factor Weighted Recommendation Engine**
   - **Rating Score (30%)**: Scaled from star ratings with review-volume confidence weighting.
   - **Value for Money Index (25%)**: Evaluates hardware specifications relative to price tier and active discounts.
   - **Feature Match Score (20%)**: Matches user priority keywords (e.g., OLED, ANC, 5000mAh, RTX, lightweight).
   - **Review Sentiment Score (15%)**: Aggregates customer feedback polarity.
   - **User Requirement Match (10%)**: Enforces budget compliance and intended use-case fit (gaming, college, office, photography, etc.).
   - **Dynamic Award Badges**: Best Overall, Best Value, Best Rated, Budget Choice.
   - **Customizable Weights**: Users can fine-tune scoring weights via an interactive configuration modal.

3. **Multi-Product Comparison Matrix**
   - Side-by-side comparison for 2 to 4 products.
   - Automatic winner determination across Best Overall, Best Value, Best Rated, and Budget Choice.
   - Granular technical spec-by-spec comparison table.
   - Visual pros, cons, and sentiment distribution contrast.

4. **Review Intelligence & Aspect Sentiment Analysis**
   - Aspect-based NLP engine analyzing Battery, Performance, Display, Camera, Build Quality, Audio, and Value.
   - Positive/Neutral/Negative percentage distribution.
   - Automated extraction of positive highlights and critical concerns.
   - Interactive review submission that recalculates product rating and sentiment in real time.

5. **Conversational Shopping Advisor (Dual AI Engine)**
   - Powered by Google Gemini (`gemini-3.7-flash`) via the modern `@google/genai` SDK when configured.
   - Automatic, local rule-based intelligence fallback ensuring 100% functionality without external API keys.
   - Interactive candidate product cards embedded directly within chat responses.

6. **Automated System Test Suite**
   - Live endpoint (`/api/test-suite/run`) executing automated tests across Authentication, Catalog Search, Comparison Matrix, 5-Factor Recommendation Engine, NLP Review Sentiment, and API Input Validation.

---

## 🏗️ Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Context API (`AuthContext`, `CompareContext`, `ToastContext`).
- **Backend**: Node.js, Express, TypeScript (`tsx` in dev, `esbuild` bundled CJS for production).
- **AI / LLM Integration**: `@google/genai` SDK (`gemini-3.7-flash`) with server-side proxying.
- **Data & Auth**: In-memory MongoDB-compatible Collection layer (`server/config/db.ts`), JWT authentication, `bcryptjs` password hashing.

---

## 🛠️ API Reference

### Authentication
- `POST /api/auth/register`: Create user account (`name`, `email`, `password`).
- `POST /api/auth/login`: Authenticate and receive JWT token.
- `GET /api/auth/me`: Fetch authenticated user profile.

### Products
- `GET /api/products`: Retrieve filtered, sorted, and paginated products.
- `GET /api/products/:id`: Get product details and verified reviews.
- `GET /api/products/categories`: Get category list with item counts and price ranges.
- `GET /api/products/search`: Search products with query text.
- `POST /api/products/compare`: Compare 2 to 4 products and calculate highlights.

### Recommendations
- `POST /api/recommendations`: Compute ranked recommendations from criteria or natural query.
- `POST /api/recommendations/chat`: Conversational AI advisor endpoint.
- `GET /api/recommendations/weights`: Retrieve current algorithm weights.
- `PUT /api/recommendations/weights`: Update recommendation scoring weights.

### Reviews
- `GET /api/reviews/product/:productId`: Get all reviews for a product.
- `POST /api/reviews`: Submit review with live sentiment analysis.
- `POST /api/reviews/analyze`: Standalone review sentiment analyzer.

### Favorites & History
- `GET /api/favorites`: Get user shortlist.
- `POST /api/favorites`: Add product to shortlist.
- `DELETE /api/favorites/:id`: Remove product from shortlist.
- `GET /api/history/searches`: Get search history.

### Testing
- `GET /api/test-suite/run` & `POST /api/test-suite/run`: Run automated test verification suite.

---

## ⚙️ Environment Variables

```env
# Optional: Gemini API Key for enhanced LLM conversational reasoning
GEMINI_API_KEY=

# Secret used to sign JWT session tokens
JWT_SECRET=smartbuy_jwt_super_secret_key_2026

# Optional: MongoDB URI for persistent external database
MONGODB_URI=
```
