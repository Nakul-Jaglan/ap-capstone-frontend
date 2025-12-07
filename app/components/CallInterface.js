'use client'

import React, { useEffect, useRef } from 'react'
import { useCall } from '../contexts/CallContext'
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, X } from 'lucide-react'

export default function CallInterface() {
    const {
        incomingCall,
        activeCall,
        localStream,
        remoteStream,
        isAudioEnabled,
        isVideoEnabled,
        callStatus,
        acceptCall,
        rejectCall,
        endCall,
        toggleAudio,
        toggleVideo
    } = useCall()

    const localVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream
        }
    }, [localStream])

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    // Incoming call modal
    if (incomingCall && !activeCall) {
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                    <div className="mb-6">
                        <div className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 animate-pulse">
                            {incomingCall.callerName?.[0]?.toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {incomingCall.callerName}
                        </h2>
                        <p className="text-gray-600 flex items-center justify-center gap-2">
                            {incomingCall.callType === 'video' ? (
                                <>
                                    <Video size={20} />
                                    Incoming Video Call
                                </>
                            ) : (
                                <>
                                    <Phone size={20} />
                                    Incoming Voice Call
                                </>
                            )}
                        </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={acceptCall}
                            className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <Phone size={20} />
                            Accept
                        </button>
                        <button
                            onClick={rejectCall}
                            className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <PhoneOff size={20} />
                            Decline
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Active call interface
    if (activeCall && (callStatus === 'calling' || callStatus === 'connecting' || callStatus === 'connected')) {
        const isVideoCall = activeCall.callType === 'video'

        return (
            <div className="fixed inset-0 bg-gray-900 z-50">
                {/* Remote video/placeholder */}
                <div className="w-full h-full relative bg-gray-800">
                    {isVideoCall && remoteStream ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-32 h-32 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold mx-auto mb-4">
                                    {activeCall.targetUserName?.[0]?.toUpperCase() || activeCall.callerName?.[0]?.toUpperCase()}
                                </div>
                                <h2 className="text-2xl font-semibold text-white mb-2">
                                    {activeCall.targetUserName || activeCall.callerName}
                                </h2>
                                <p className="text-gray-300">
                                    {callStatus === 'calling' && 'Calling...'}
                                    {callStatus === 'connecting' && 'Connecting...'}
                                    {callStatus === 'connected' && 'Connected'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Local video (picture-in-picture) */}
                    {isVideoCall && localStream && (
                        <div className="absolute top-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover mirror"
                            />
                        </div>
                    )}

                    {/* Call status overlay */}
                    {callStatus !== 'connected' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
                                <p className="text-white text-xl">
                                    {callStatus === 'calling' && 'Ringing...'}
                                    {callStatus === 'connecting' && 'Connecting...'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls - Fixed at bottom with backdrop */}
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/60 to-transparent p-8">
                    <div className="max-w-md mx-auto flex items-center justify-center gap-4">
                        {/* Toggle Audio */}
                        <button
                            onClick={toggleAudio}
                            className={`p-4 rounded-full transition-all shadow-lg ${isAudioEnabled
                                    ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                            title={isAudioEnabled ? 'Mute' : 'Unmute'}
                        >
                            {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                        </button>

                        {/* Toggle Video (only for video calls) */}
                        {isVideoCall && (
                            <button
                                onClick={toggleVideo}
                                className={`p-4 rounded-full transition-all shadow-lg ${isVideoEnabled
                                        ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                    }`}
                                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                            >
                                {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                            </button>
                        )}

                        {/* End Call */}
                        <button
                            onClick={endCall}
                            className="p-5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg"
                            title="End call"
                        >
                            <PhoneOff size={28} />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return null
}
