import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Heart, MessageCircle, Star, MapPin, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReviewCard from "@/components/community/ReviewCard";

export default function Community() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState({
    destination: "",
    content: "",
    rating: 5,
    tags: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const allReviews = await base44.entities.Review.list("-created_date", 50);
      setReviews(allReviews);
    } catch (error) {
      navigate(createPageUrl("Auth"));
    }
  };

  const createPost = async () => {
    if (!newPost.destination || !newPost.content) return;

    try {
      await base44.entities.Review.create({
        destination: newPost.destination,
        content: newPost.content,
        rating: newPost.rating,
        tags: newPost.tags.split(",").map(t => t.trim()).filter(t => t),
        likes: 0,
        comments: []
      });
      setNewPost({ destination: "", content: "", rating: 5, tags: "" });
      setShowPostForm(false);
      loadData();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const likePost = async (postId) => {
    try {
      const post = reviews.find(r => r.id === postId);
      await base44.entities.Review.update(postId, {
        likes: (post.likes || 0) + 1
      });
      loadData();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const addComment = async (postId, comment) => {
    try {
      const post = reviews.find(r => r.id === postId);
      const newComment = {
        user_email: user.email,
        comment: comment,
        timestamp: new Date().toISOString()
      };
      await base44.entities.Review.update(postId, {
        comments: [...(post.comments || []), newComment]
      });
      loadData();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Travel Community</h1>
                <p className="text-gray-600">Share your adventures and inspire others</p>
              </div>
            </div>
            <Button
              onClick={() => setShowPostForm(!showPostForm)}
              className="bg-gradient-to-r from-green-500 to-emerald-400 hover:shadow-lg rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </motion.div>

        {/* Create Post Form */}
        <AnimatePresence>
          {showPostForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-sky-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Share Your Experience</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-sky-600" />
                      Destination
                    </Label>
                    <Input
                      placeholder="Where did you go?"
                      value={newPost.destination}
                      onChange={(e) => setNewPost({ ...newPost, destination: e.target.value })}
                      className="rounded-xl border-sky-200"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Your Review</Label>
                    <Textarea
                      placeholder="Share your experience, tips, and recommendations..."
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      className="rounded-xl border-sky-200 min-h-[120px]"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      Rating
                    </Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => setNewPost({ ...newPost, rating })}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              rating <= newPost.rating
                                ? "text-amber-500 fill-amber-500"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Tags (comma-separated)</Label>
                    <Input
                      placeholder="e.g., #SoloTravel, #Adventure, #Beach"
                      value={newPost.tags}
                      onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                      className="rounded-xl border-sky-200"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={createPost}
                      disabled={!newPost.destination || !newPost.content}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-400 hover:shadow-lg rounded-xl"
                    >
                      Publish Post
                    </Button>
                    <Button
                      onClick={() => setShowPostForm(false)}
                      variant="outline"
                      className="rounded-xl border-sky-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviews Feed */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-sky-100 text-center"
            >
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Posts Yet</h3>
              <p className="text-gray-600 mb-4">Be the first to share your travel experience!</p>
              <Button
                onClick={() => setShowPostForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-400 hover:shadow-lg rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </motion.div>
          ) : (
            reviews.map((review, index) => (
              <ReviewCard
                key={review.id}
                review={review}
                index={index}
                currentUser={user}
                onLike={likePost}
                onComment={addComment}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}