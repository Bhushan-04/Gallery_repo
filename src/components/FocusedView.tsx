import { useState } from "react";
import { db } from "../lib/instantdb";
import { id } from "@instantdb/react";
import { useStore } from "../lib/store";
import { X, MessageSquare, Send, Trash2, Smile } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";

export default function FocusedView() {
    const { activeImageId, setActiveImageId, user } = useStore();
    const [comment, setComment] = useState("");
    const [showPicker, setShowPicker] = useState(false);

    const { data, isLoading } = db.useQuery(
        activeImageId ? {
            images: { $: { where: { id: activeImageId as any } }, interactions: {} }
        } : {}
    );

    if (!activeImageId) return null;
    // Use a slight delay or persistent skeleton if needed, but here we just return null to avoid flicker
    if (isLoading || !data?.images || !data.images[0]) return null;

    const image = data.images[0];
    const sortedInteractions = (image.interactions || []).sort((a: any, b: any) => a.createdAt - b.createdAt);

    const close = () => setActiveImageId(null);

    const addInteraction = (type: "emoji" | "comment", content: string) => {
        if (!content.trim() || !user) return;

        const interactionId = id();
        db.transact([
            db.tx.interactions[interactionId].update({
                type,
                content,
                createdAt: Date.now(),
                userName: user.name,
                userColor: user.color,
                userId: user.id,
            }),
            db.tx.images[image.id].link({ interactions: interactionId }),
        ]);
        if (type === 'comment') setComment("");
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md animate-fadeIn overflow-y-auto lg:overflow-hidden no-scrollbar" onClick={close}>

            {/* Close Button - Switch to fixed positioning relative to viewport for scrollable mobile view */}
            <button onClick={close} className="fixed top-6 right-6 z-[110] p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-xl">
                <X size={24} />
            </button>

            <div className="w-full min-h-full lg:h-full flex flex-col lg:flex-row max-w-[1920px] mx-auto" onClick={e => e.stopPropagation()}>

                {/* Left: Immersive Image Stage */}
                <div className="w-full lg:flex-1 lg:h-full bg-black flex items-center justify-center relative p-4 lg:p-10 shrink-0">
                    <img
                        src={image.url}
                        alt={image.altDescription}
                        className="w-auto h-auto max-h-[60vh] lg:max-w-full lg:max-h-full object-contain shadow-2xl drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] rounded-sm"
                    />
                </div>

                {/* Right: Interaction Sidebar (Glass) */}
                <div className="w-full lg:w-[450px] lg:h-full flex flex-col bg-gray-900/50 backdrop-blur-2xl border-t lg:border-t-0 lg:border-l border-white/5 shrink-0">

                    {/* Header */}
                    <div className="p-6 border-b border-white/5 bg-white/5 sticky top-0 z-10 backdrop-blur-xl lg:static lg:bg-transparent lg:backdrop-blur-none">
                        <h3 className="font-semibold text-lg text-white tracking-wide">Discussion</h3>
                        <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Live Interactions</p>
                    </div>

                    {/* List - Scroll naturally on mobile, internal scroll on desktop */}
                    <div className="flex-1 p-6 space-y-6 overflow-visible lg:overflow-y-auto custom-scrollbar">
                        {sortedInteractions.map((msg: any) => (
                            <div key={msg.id} className="flex gap-4 group items-start">
                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]" style={{ backgroundColor: msg.userColor || '#666' }}>
                                    {msg.userName?.[0] || '?'}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-white/90">{msg.userName}</span>
                                        <span className="text-[10px] text-white/30">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    <div className={`text-sm leading-relaxed ${msg.type === 'emoji' ? 'text-2xl' : 'text-white/70'}`}>
                                        {msg.content}
                                    </div>
                                </div>

                                {user && msg.userId === user.id && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            db.transact(db.tx.interactions[msg.id].delete());
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}

                        {sortedInteractions.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-white/20">
                                <MessageSquare size={40} strokeWidth={1} className="mb-4 opacity-50" />
                                <p className="font-light">No interactions yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-black/40 border-t border-white/5">
                        {/* Quick Reactions */}
                        {/* Emoji Picker Popover */}
                        <div className="flex items-center gap-3 mb-6 relative">
                            <button
                                onClick={() => setShowPicker(!showPicker)}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-yellow-400 transition-colors"
                                title="Add Reaction"
                            >
                                <Smile size={24} />
                            </button>

                            {showPicker && (
                                <div className="absolute bottom-full left-0 mb-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="fixed inset-0 z-0" onClick={() => setShowPicker(false)}></div>
                                    <div className="relative z-10 shadow-2xl rounded-xl overflow-hidden border border-white/10">
                                        <EmojiPicker
                                            theme={Theme.DARK}
                                            onEmojiClick={(emojiData) => {
                                                addInteraction("emoji", emojiData.emoji);
                                                setShowPicker(false);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Quick Instructions */}
                            <span className="text-white/30 text-sm">Click to react</span>
                        </div>

                        {/* Comment Box */}
                        <div className="relative">
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-12 py-3 text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                                placeholder="Write a comment..."
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addInteraction("comment", comment)}
                            />
                            <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors disabled:opacity-50"
                                onClick={() => addInteraction("comment", comment)}
                                disabled={!comment.trim()}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
