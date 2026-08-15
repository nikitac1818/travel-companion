import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Star, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function ReviewCard({ review, index, currentUser, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleComment = () => {
    if (!commentText.trim()) return;
    onComment(review.id, commentText);
    setCommentText("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-sky-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-sky-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-semibold">
              {review.created_by?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{review.created_by}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(review.created_date), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? "text-amber-500 fill-amber-500"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sky-600 font-semibold mb-3">
          <MapPin className="w-4 h-4" />
          <span>{review.destination}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-700 leading-relaxed mb-4">{review.content}</p>

        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {review.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gradient-to-r from-sky-50 to-teal-50 text-sky-700 rounded-full text-sm border border-sky-100"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-4 flex items-center gap-4">
        <Button
          onClick={() => onLike(review.id)}
          variant="ghost"
          className="flex items-center gap-2 hover:bg-red-50 rounded-xl group"
        >
          <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:fill-red-500 transition-all" />
          <span className="font-semibold text-gray-600 group-hover:text-red-600">
            {review.likes || 0}
          </span>
        </Button>

        <Button
          onClick={() => setShowComments(!showComments)}
          variant="ghost"
          className="flex items-center gap-2 hover:bg-blue-50 rounded-xl group"
        >
          <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-all" />
          <span className="font-semibold text-gray-600 group-hover:text-blue-600">
            {review.comments?.length || 0}
          </span>
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          className="border-t border-sky-100 bg-gradient-to-r from-sky-50 to-teal-50 p-4"
        >
          {/* Comments List */}
          {review.comments && review.comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {review.comments.map((comment, idx) => (
                <div key={idx} className="bg-white rounded-xl p-3 border border-sky-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {comment.user_email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{comment.user_email}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {format(new Date(comment.timestamp), "MMM d")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 ml-8">{comment.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="flex gap-2">
            <Input
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleComment()}
              className="rounded-xl border-sky-200 bg-white"
            />
            <Button
              onClick={handleComment}
              disabled={!commentText.trim()}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:shadow-lg rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}