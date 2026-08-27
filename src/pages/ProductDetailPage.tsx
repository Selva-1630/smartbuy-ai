import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import { api } from '../services/api';
import { ScoreBadge } from '../components/ScoreBadge';
import { SentimentChart } from '../components/SentimentChart';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  Heart,
  Layers,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ShieldCheck,
  Send,
  Plus,
  Check,
  Share2,
} from 'lucide-react';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: any, extra?: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Filter reviews by rating
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      try {
        const res = await api.getProductById(productId);
        setProduct(res.product);
        setReviews(res.reviews || []);
        setSelectedImage(res.product.image);

        // Check if favorited
        const favs = await api.getFavorites().catch(() => []);
        setIsFavorited(favs.some((f) => f.productId === productId));
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (productId) {
      loadDetails();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Loading product intelligence & specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you requested does not exist in our catalog.</p>
        <button
          onClick={() => onNavigate('search')}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const inCompare = isInCompare(product.id);

  const handleToggleCompare = () => {
    if (inCompare) {
      removeFromCompare(product.id);
      showToast('info', `Removed ${product.name} from comparison.`);
    } else {
      const added = addToCompare(product);
      if (added) {
        showToast('success', `Added ${product.name} to comparison.`);
      } else {
        showToast('error', 'You can compare up to 4 products at a time.');
      }
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorited) {
        await api.removeFavorite(product.id);
        setIsFavorited(false);
        showToast('info', 'Removed from saved favorites.');
      } else {
        await api.addFavorite(product.id);
        setIsFavorited(true);
        showToast('success', 'Added to saved favorites.');
      }
    } catch {
      setIsFavorited(!isFavorited);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('success', 'Product link copied to clipboard!');
    }
  };

  const handleBuyProduct = () => {
    const recipientEmail = user?.email || 'demo.user@gmail.com';
    const subject = encodeURIComponent(`Order Confirmation: ${product.name}`);
    const body = encodeURIComponent(
      `Hello,\n\nYour order for ${product.name} has been confirmed.\n\nOrder Summary:\n- Product: ${product.name}\n- Brand: ${product.brand}\n- Category: ${product.category}\n- Price: ₹${product.priceINR.toLocaleString('en-IN')}\n- Order Status: Confirmed\n\nThank you for shopping with SmartBuy AI.\n\nThis is a sample Gmail purchase confirmation email.`
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${subject}&body=${body}`;

    setIsOrderConfirmed(true);
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    showToast('success', `Sample Gmail confirmation opened for ${recipientEmail}`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      showToast('error', 'Review comment must be at least 5 characters.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.addReview({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle || `${reviewRating} Star Review`,
        comment: reviewComment,
      });

      setReviews((prev) => [res.review, ...prev]);
      // Update local product stats
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              rating: res.updatedProductStats.rating,
              reviewCount: res.updatedProductStats.reviewCount,
              sentimentSummary: res.updatedProductStats.sentimentSummary,
            }
          : null
      );

      setShowReviewForm(false);
      setReviewComment('');
      setReviewTitle('');
      showToast('success', 'Review submitted and sentiment re-analyzed!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter === 'all') return true;
    return r.rating === ratingFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back navigation button */}
      <button
        onClick={() => onNavigate('search')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to catalog</span>
      </button>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Col: Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Display Image */}
          <div className="relative aspect-4/3 sm:aspect-square w-full bg-slate-100 dark:bg-slate-800/80 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.isTrending && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md">
                Trending
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.galleryImages && product.galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-indigo-600 scale-105 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Essential Overview & AI Ratings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Brand & Title */}
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
              <span>{product.brand}</span>
              <span>•</span>
              <span className="text-slate-500">{product.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Value Score Bar */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {product.rating}
                </span>
                <span className="text-xs text-slate-400">
                  ({product.reviewCount.toLocaleString()} ratings)
                </span>
              </div>
              <ScoreBadge score={product.valueScore} label="Value Index" size="md" />
            </div>
          </div>

          {/* Price Block */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                ₹{product.priceINR.toLocaleString('en-IN')}
              </div>
              {product.originalPriceINR > product.priceINR && (
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                  <span className="line-through">₹{product.originalPriceINR.toLocaleString('en-IN')}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Save ₹{(product.originalPriceINR - product.priceINR).toLocaleString('en-IN')} (
                    {Math.round(
                      ((product.originalPriceINR - product.priceINR) / product.originalPriceINR) * 100
                    )}
                    % OFF)
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                ${product.priceUSD} USD
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                In Stock & Verified
              </div>
            </div>
          </div>

          {/* AI Verdict Summary Banner */}
          <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-4.5 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>SmartBuy AI Executive Verdict</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {product.aiVerdict || product.summary}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <button
              id="details-toggle-compare-btn"
              onClick={handleToggleCompare}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                inCompare
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white'
              }`}
            >
              {inCompare ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{inCompare ? 'Added to Compare' : 'Add to Compare'}</span>
            </button>

            <button
              id="details-toggle-fav-btn"
              onClick={handleToggleFavorite}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                isFavorited
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-600 dark:text-rose-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-rose-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              <span>{isFavorited ? 'Saved to Favorites' : 'Save Favorite'}</span>
            </button>

            <button
              onClick={handleBuyProduct}
              className="py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Buy Now</span>
            </button>

            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Link</span>
            </button>
          </div>

          {isOrderConfirmed && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/30 dark:text-emerald-300">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-emerald-600 p-1 text-white">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Order Confirmed</p>
                  <p className="text-xs mt-1">
                    Your order for {product.name} has been placed successfully and a sample confirmation email was prepared for {user?.email || 'demo.user@gmail.com'}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Structured Section Tabs / Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Left (8 cols): Specifications & Pros/Cons */}
        <div className="lg:col-span-8 space-y-8">
          {/* Specifications Table */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technical Specifications</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.entries(product.specs || {}).map(([key, value]) => (
                <div key={key} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white text-right">{value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Pros & Cons */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Key Strengths & Pros</span>
              </div>
              <ul className="space-y-2">
                {product.pros.map((pro, i) => (
                  <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-500/30 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
                <XCircle className="w-4 h-4" />
                <span>Tradeoffs & Limitations</span>
              </div>
              <ul className="space-y-2">
                {product.cons.map((con, i) => (
                  <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✗</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Sentiment Intelligence Component */}
          {product.sentimentSummary && <SentimentChart sentiment={product.sentimentSummary} />}

          {/* Verified Customer Reviews & Review Form */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Verified Buyer Reviews ({reviews.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Real feedback with automated aspect sentiment tagging
                </p>
              </div>

              <button
                id="write-review-btn"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{showReviewForm ? 'Cancel Review' : 'Write a Review'}</span>
              </button>
            </div>

            {/* Interactive Review Form */}
            {showReviewForm && (
              <form
                onSubmit={handleReviewSubmit}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 animate-slide-up"
              >
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Submit Verified Feedback & Run Sentiment Check
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                      {reviewRating} of 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Excellent display and snappy battery"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Detailed Experience
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe performance, battery life, display, build quality, camera, etc..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReview ? 'Analyzing & Submitting...' : 'Post Review'}</span>
                </button>
              </form>
            )}

            {/* Filter by star rating */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="font-semibold text-slate-500">Filter:</span>
              <button
                onClick={() => setRatingFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  ratingFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                All ({reviews.length})
              </button>
              {[5, 4, 3, 2, 1].map((s) => (
                <button
                  key={s}
                  onClick={() => setRatingFilter(s)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    ratingFilter === s
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {s}★
                </button>
              ))}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.date}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {rev.comment}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      {rev.userName}
                    </span>
                    {rev.sentiment && (
                      <span
                        className={`capitalize font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                          rev.sentiment === 'positive'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : rev.sentiment === 'negative'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {rev.sentiment} Sentiment
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right (4 cols): Quick AI Advice & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base">Unsure about this model?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask SmartBuy AI to compare this with other models in the {product.category} category or find a budget alternative.
            </p>
            <button
              onClick={() => onNavigate('assistant', { initialQuery: `Should I buy ${product.name} or is there a better alternative?` })}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Ask AI About Alternatives
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
