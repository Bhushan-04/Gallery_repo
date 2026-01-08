import { db } from "../lib/instantdb";
import { useStore } from "../lib/store";
import { X, MessageSquare, Heart, Trash2 } from "lucide-react";

export default function Feed() {
    const { isFeedOpen, setIsFeedOpen, user, setActiveImageId } = useStore();

    const { isLoading, error, data } = db.useQuery({
        interactions: {
            images: {},
        }
    });

    const interactions = data?.interactions || [];
    interactions.sort((a: any, b: any) => b.createdAt - a.createdAt);

    return (
        <>
            {/* Backdrop (Mobile Only) */}
            {isFeedOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsFeedOpen(false)}
                />
            )}

            {/* Floating Drawer (Mobile) / Pinned HUD (Desktop) */}
            <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-gray-900/80 backdrop-blur-md border-l border-white/5 shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isFeedOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        Activity Feed
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    </h2>
                    <button
                        onClick={() => setIsFeedOpen(false)}
                        className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* List */}
                <div className="h-[calc(100vh-80px)] overflow-y-auto p-4 space-y-4 pb-20">
                    {isLoading && <div className="text-white/50 text-center py-10">Syncing activity...</div>}
                    {error && <div className="text-red-400 p-4">Error: {error.message}</div>}

                    {!isLoading && interactions.map((interaction) => {
                        const image = Array.isArray(interaction.images) ? interaction.images[0] : interaction.images;
                        const time = new Date(interaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const isOwner = user && interaction.userId === user.id;

                        return (
                            <div
                                key={interaction.id}
                                onClick={() => {
                                    if (image && image.id) setActiveImageId(image.id);
                                }}
                                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 cursor-pointer animate-in slide-in-from-right-10 fade-in duration-300 fill-mode-backwards"
                            >
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        {interaction.type === 'emoji' ? (
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <Heart size={14} fill="currentColor" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                                <MessageSquare size={14} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-white text-sm">{interaction.userName}</span>
                                            <span className="text-xs text-white/30 font-mono">{time}</span>
                                        </div>

                                        <div className="text-white/80 text-sm leading-relaxed break-words">
                                            {interaction.type === 'emoji' ? (
                                                <span className="text-gray-400">reacted with <span className="text-lg ml-1">{interaction.content}</span></span>
                                            ) : (
                                                <span>"{interaction.content}"</span>
                                            )}
                                        </div>

                                        {image && (
                                            <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-black/20 group-hover:bg-black/40 transition-colors">
                                                <img src={image.url} className="w-8 h-8 rounded-md object-cover" alt="context" />
                                                <span className="text-xs text-white/40">on Img #{image.unsplashId.slice(0, 5)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {isOwner && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                db.transact(db.tx.interactions[interaction.id].delete());
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {!isLoading && interactions.length === 0 && (
                        <div className="text-center text-white/30 py-20 flex flex-col items-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={24} className="opacity-50" />
                            </div>
                            <p>No activity yet.</p>
                            <p className="text-sm mt-1">Be the first to react!</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
