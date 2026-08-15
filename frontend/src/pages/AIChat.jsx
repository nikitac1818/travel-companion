import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Loader2, MapPin, Plane, Hotel, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import MessageBubble from "@/components/chat/MessageBubble";

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hello! I'm your AI Travel Assistant. I can help you with:\n\n🗺️ Destination recommendations\n✈️ Travel tips and advice\n🎒 Packing suggestions\n🏨 Hotel and activity recommendations\n💡 Local attractions and hidden gems\n\nWhat would you like to know about your next adventure?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Get conversation context
      const conversationHistory = messages
        .slice(-6)
        .map(m => `${m.role}: ${m.content}`)
        .join("\n");

      const prompt = `You are a friendly AI travel assistant. Help the user with their travel questions.
      
Previous conversation:
${conversationHistory}

User: ${input}

Provide helpful, conversational responses. Include emojis where appropriate. If suggesting hotels or destinations, mention they can use the Hotels page in the app. For trip planning, suggest they use the Trip Planner. Keep responses concise but informative.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment! 😊"
      }]);
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    { icon: MapPin, text: "Best places to visit in Goa?", color: "from-blue-400 to-cyan-400" },
    { icon: Hotel, text: "Recommend hotels in Paris", color: "from-purple-400 to-pink-400" },
    { icon: Plane, text: "What to pack for a beach trip?", color: "from-amber-400 to-orange-400" },
    { icon: Sparkles, text: "Hidden gems in Japan", color: "from-green-400 to-teal-400" }
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">AI Travel Assistant</h1>
              <p className="text-gray-600 text-sm">Ask me anything about travel!</p>
            </div>
          </div>
        </motion.div>

        {/* Chat Container */}
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-sky-100 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-500 mb-3">Quick questions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((q, idx) => {
                  const Icon = q.icon;
                  return (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleQuickQuestion(q.text)}
                      className={`flex items-center gap-2 p-3 bg-gradient-to-r ${q.color} text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="truncate">{q.text}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-sky-100 p-4 bg-gradient-to-r from-sky-50 to-teal-50">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about destinations, hotels, tips..."
                className="flex-1 rounded-2xl border-sky-200 focus:border-sky-400 h-12"
                disabled={isTyping}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="h-12 px-6 bg-gradient-to-r from-blue-500 to-cyan-400 hover:shadow-lg rounded-2xl"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}