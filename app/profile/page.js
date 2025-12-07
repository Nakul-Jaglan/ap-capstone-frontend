'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Save, Edit2, X } from 'lucide-react'
import Header from '@/components/layout/header'

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [showPasswordChange, setShowPasswordChange] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        avatarUrl: ''
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        fetchUserProfile()
    }, [])

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data.data)
                setFormData({
                    name: data.data.name || '',
                    bio: data.data.bio || '',
                    avatarUrl: data.data.avatarUrl || ''
                })
            } else {
                router.push('/login')
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            setError('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setSaving(true)

        const token = localStorage.getItem('token')

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                setUser(data.data)
                setSuccess('Profile updated successfully!')
                setEditMode(false)
            } else {
                setError(data.message || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            setError('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match')
            return
        }

        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setSaving(true)
        const token = localStorage.getItem('token')

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess('Password updated successfully!')
                setShowPasswordChange(false)
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            } else {
                setError(data.message || 'Failed to update password')
            }
        } catch (error) {
            console.error('Error updating password:', error)
            setError('Failed to update password')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950">
                <Header />
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <div className="text-gray-400">Loading profile...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                        {!editMode && (
                            <button
                                onClick={() => setEditMode(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </button>
                        )}
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center space-x-6 mb-6">
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <User className="w-12 h-12" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">{user?.name || 'No name set'}</h2>
                            <p className="text-gray-400">@{user?.username}</p>
                        </div>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded-lg text-green-400">
                            {success}
                        </div>
                    )}

                    {/* Profile Form */}
                    {editMode ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="Tell us about yourself"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Avatar URL</label>
                                <input
                                    type="url"
                                    value={formData.avatarUrl}
                                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditMode(false)
                                        setFormData({
                                            name: user?.name || '',
                                            bio: user?.bio || '',
                                            avatarUrl: user?.avatarUrl || ''
                                        })
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                <div className="flex items-center space-x-2 text-white">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span>{user?.email}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                                <div className="flex items-center space-x-2 text-white">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span>@{user?.username}</span>
                                </div>
                            </div>

                            {user?.bio && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                                    <p className="text-white">{user.bio}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Password Change Section */}
                <div className="bg-gray-900 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white">Security</h2>
                    </div>

                    {!showPasswordChange ? (
                        <button
                            onClick={() => setShowPasswordChange(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            <Lock className="w-4 h-4" />
                            <span>Change Password</span>
                        </button>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>{saving ? 'Updating...' : 'Update Password'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordChange(false)
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                                        setError('')
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
