'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Hash, Loader2 } from 'lucide-react'

function JoinChannelPage() {
    const params = useParams()
    const router = useRouter()
    const inviteCode = params.code
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const joinChannel = async () => {
            const token = localStorage.getItem('token')

            if (!token) {
                router.push(`/login?redirect=/channels/join/${inviteCode}`)
                return
            }

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/channels/join/${inviteCode}`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                )

                const result = await response.json()

                if (response.ok) {
                    router.push(`/channels/${result.data.id}`)
                } else {
                    setError(result.message || 'Failed to join channel')
                    setLoading(false)
                }
            } catch (error) {
                console.error('Error joining channel:', error)
                setError('Failed to join channel')
                setLoading(false)
            }
        }

        if (inviteCode) {
            joinChannel()
        }
    }, [inviteCode, router])

    if (loading) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Joining channel...</p>
                </div>
            </main>
        )
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Hash size={32} className="text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Unable to Join Channel</h1>
                <p className="text-red-600 mb-6">{error}</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push('/channels')}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Go to Channels
                    </button>
                    {/* <button
            onClick={() => router.push('/login')}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Login
          </button> */}
                </div>
            </div>
        </main>
    )
}

export default JoinChannelPage
