
import React, { useEffect, useState } from 'react';
import { Star, User, MessageSquare, Plus, ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

interface Props {
    username: string;
}

interface Review {
    id: number;
    created_at: string;
    name: string;
    rating: number;
    content: string;
    is_anonymous: boolean;
}

export const ReviewView: React.FC<Props> = ({ username }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Form States
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setErrorMsg(null);
            
            // Direct Supabase Call (Client-Side)
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setReviews(data || []);
        } catch (error: any) {
            console.error('Error fetching reviews:', error);
            setErrorMsg(error.message || "Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const newReview = {
                name: isAnonymous ? 'Anonymous' : (username || 'CakeWait User'),
                rating,
                content,
                is_anonymous: isAnonymous
            };

            // Direct Supabase Insert
            const { error } = await supabase
                .from('reviews')
                .insert([newReview]);

            if (error) throw error;
            
            // Success
            setShowForm(false);
            setContent('');
            setRating(5);
            fetchReviews(); // Refresh list
            alert('Review submitted successfully! 🎉');
        } catch (error: any) {
            console.error('Error adding review:', error);
            alert(`Failed to add review: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const averageRating = reviews.length 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '5.0';

    if (showForm) {
        return (
            <div className="animate-popup pb-24">
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={() => setShowForm(false)}
                        className="w-10 h-10 rounded-full bg-surfaceLight border border-dark-border flex items-center justify-center text-muted hover:text-primary"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-primary">Write a Review</h2>
                </div>

                <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-[2.5rem] p-6 space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-lime/5 blur-[60px] rounded-full pointer-events-none"></div>

                    <div className="space-y-2 relative z-10">
                        <label className="text-sm text-muted font-medium ml-1">Rate your experience</label>
                        <div className="flex justify-between bg-surfaceLight rounded-2xl p-4 border border-dark-border">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform active:scale-90"
                                >
                                    <Star 
                                        size={32} 
                                        className={star <= rating ? "fill-lime text-lime drop-shadow-[0_0_8px_rgba(210,248,1,0.5)]" : "text-muted opacity-30"} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                        <label className="text-sm text-muted font-medium ml-1">Your Review</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Tell us what you love about CakeWait..."
                            className="w-full h-32 bg-surfaceLight border border-dark-border rounded-2xl p-4 text-primary placeholder-muted focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime transition-all resize-none"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between bg-surfaceLight rounded-2xl p-4 border border-dark-border relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-surface border border-dark-border flex items-center justify-center text-muted">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-primary">Post Anonymously</p>
                                <p className="text-xs text-muted">Hide your name</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${isAnonymous ? 'bg-lime' : 'bg-surface border border-dark-border'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isAnonymous ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-lime text-black font-bold py-4 rounded-2xl shadow-lg shadow-lime/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {submitting ? (
                            <span className="animate-pulse">Submitting...</span>
                        ) : (
                            <>
                                <Send size={20} />
                                Submit Review
                            </>
                        )}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-popup pb-24">
            <div className="bg-dark-card border border-dark-border rounded-[2.5rem] p-6 relative overflow-hidden card-shine">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-lime/10 blur-[50px] rounded-full pointer-events-none"></div>
                
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <h2 className="text-3xl font-black text-primary italic tracking-tight">Community<br/>Reviews</h2>
                        <p className="text-muted text-sm mt-2">See what others say about CakeWalk</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-lime drop-shadow-[0_0_10px_rgba(210,248,1,0.3)]">{averageRating}</div>
                        <div className="flex gap-0.5 text-lime mt-1 text-xs justify-end">
                            <Star size={12} className="fill-lime" />
                            <Star size={12} className="fill-lime" />
                            <Star size={12} className="fill-lime" />
                            <Star size={12} className="fill-lime" />
                            <Star size={12} className="fill-lime" />
                        </div>
                        <p className="text-[10px] text-muted mt-1">{reviews.length} reviews</p>
                    </div>
                </div>
            </div>

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3 text-red-200 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                    <div>
                        <p className="font-bold text-red-400">Connection Error</p>
                        <p className="opacity-80">{errorMsg}</p>
                        {errorMsg.includes("relation") && (
                            <p className="text-xs mt-2 opacity-70 bg-black/20 p-2 rounded">
                                Hint: The 'reviews' table might be missing in Supabase.
                            </p>
                        )}
                    </div>
                </div>
            )}

            <button
                onClick={() => setShowForm(true)}
                className="w-full bg-surfaceLight border border-dark-border hover:border-lime/50 text-primary py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] group"
            >
                <div className="w-8 h-8 rounded-full bg-lime text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus size={18} />
                </div>
                <span className="font-bold">Add Your Review</span>
            </button>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-muted text-xs">Loading reviews...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-dark-border rounded-3xl opacity-50">
                        <MessageSquare className="w-8 h-8 text-muted mx-auto mb-2" />
                        <p className="text-muted text-sm">No reviews yet. Be the first!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-surfaceLight border border-dark-border rounded-3xl p-5 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-surface border border-dark-border flex items-center justify-center text-muted">
                                        {review.is_anonymous ? <User size={18} /> : review.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-primary text-sm">{review.name}</h4>
                                        <div className="flex gap-0.5 text-lime">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={10} 
                                                    className={i < review.rating ? "fill-lime" : "text-muted opacity-30"} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-muted bg-surface px-2 py-1 rounded-full border border-dark-border">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                "{review.content}"
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
