'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Hash, Calendar, Link2 } from 'lucide-react';
import BgLayout from '@/components/layout/bgLayout';

function ChannelPage() {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [newChannel, setNewChannel] = useState({ name: '', description: '' });
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/channels`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                setChannels(result.data);
            }
        } catch (error) {
            console.error('Error fetching channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChannel = async (e) => {
        e.preventDefault();
        setError('');

        if (!newChannel.name.trim()) {
            setError('Channel name is required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/channels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newChannel)
            });

            const result = await response.json();

            if (response.ok) {
                setShowCreateModal(false);
                setNewChannel({ name: '', description: '' });
                fetchChannels();
                router.push(`/channels/${result.data.id}`);
            } else {
                setError(result.message || 'Failed to create channel');
            }
        } catch (error) {
            console.error('Error creating channel:', error);
            setError('Failed to create channel');
        }
    };

    const handleJoinChannel = async (e) => {
        e.preventDefault();
        setError('');

        if (!inviteCode.trim()) {
            setError('Invite code is required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/channels/join/${inviteCode}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok) {
                setShowJoinModal(false);
                setInviteCode('');
                fetchChannels();
                router.push(`/channels/${result.data.id}`);
            } else {
                setError(result.message || 'Failed to join channel');
            }
        } catch (error) {
            console.error('Error joining channel:', error);
            setError('Failed to join channel');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#1b1d21] p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7f3a87] mx-auto"></div>
                        <p className="mt-4 text-gray-100">Loading channels...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <BgLayout>
            <main className="min-h-screen bg-[#1b1d21] p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-200 mb-2">Channels</h1>
                        <p className="text-gray-400">Create or join channels to collaborate with your team</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-[#7e3986] text-white rounded-lg hover:bg-[#6b3173] transition-colors"
                        >
                            <Plus size={20} />
                            Create Channel
                        </button>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-[#7e3986] border-2 border-[#7e3986] rounded-lg hover:bg-[#f3e8ff] transition-colors"
                        >
                            <Link2 size={20} />
                            Join via Invite
                        </button>
                    </div>

                    {/* Channels Grid */}
                    {channels.length === 0 ? (
                        <div className="bg-[#2c2f36] rounded-xl shadow-sm p-12 text-center">
                            <Hash size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">No channels yet</h3>
                            <p className="text-gray-400 mb-6">Create your first channel or join one using an invite code</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {channels.map((channel) => (
                                <div
                                    key={channel.id}
                                    onClick={() => router.push(`/channels/${channel.id}`)}
                                    className="bg-[#2c2f36] rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-6 border border-gray-700"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-[#7e3986] rounded-lg">
                                                <Hash size={24} className="text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-100 text-lg">{channel.name}</h3>
                                                {channel.description && (
                                                    <p className="text-sm text-gray-300 line-clamp-2">{channel.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-200">
                                        <div className="flex items-center gap-2">
                                            <Users size={16} />
                                            <span>{channel.memberCount} {channel.memberCount === 1 ? 'member' : 'members'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span>Created {formatDate(channel.createdAt)}</span>
                                        </div>
                                    </div>

                                    {channel.lastMessage && (
                                        <div className="mt-4 pt-4 border-t border-gray-400">
                                            <p className="text-sm text-gray-200 line-clamp-1">
                                                Last message: {channel.lastMessage.content}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Create Channel Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                            <div className="bg-[#401145] rounded-xl shadow-xl max-w-md w-full p-6">
                                <h2 className="text-2xl font-bold text-gray-100 mb-4">Create New Channel</h2>
                                <form onSubmit={handleCreateChannel}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Channel Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={newChannel.name}
                                            onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                                            className="w-full px-4 py-2 text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e3986] focus:border-transparent"
                                            placeholder="e.g., Team Discussion"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Description (optional)
                                        </label>
                                        <textarea
                                            value={newChannel.description}
                                            onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                                            className="w-full px-4 py-2 text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e3986] focus:border-transparent"
                                            placeholder="What's this channel about?"
                                            rows="3"
                                        />
                                    </div>
                                    {error && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                            {error}
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-[#7e3986] text-white rounded-lg hover:bg-[#6b3173] transition-colors"
                                        >
                                            Create Channel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                setNewChannel({ name: '', description: '' });
                                                setError('');
                                            }}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Join Channel Modal */}
                    {showJoinModal && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                            <div className="bg-[#401145] rounded-xl shadow-xl max-w-md w-full p-6">
                                <h2 className="text-2xl font-bold text-gray-100 mb-4">Join Channel</h2>
                                <form onSubmit={handleJoinChannel}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Invite Code *
                                        </label>
                                        <input
                                            type="text"
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value)}
                                            className="w-full px-4 py-2 text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e3986] focus:border-transparent"
                                            placeholder="Enter invite code"
                                        />
                                    </div>
                                    {error && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                            {error}
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-[#7e3986] text-white rounded-lg hover:bg-[#6b3173] transition-colors"
                                        >
                                            Join Channel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowJoinModal(false);
                                                setInviteCode('');
                                                setError('');
                                            }}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </BgLayout>
    );
}

export default ChannelPage;