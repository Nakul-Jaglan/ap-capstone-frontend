'use client'

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { io } from 'socket.io-client'

const CallContext = createContext()

export const useCall = () => {
    const context = useContext(CallContext)
    if (!context) {
        throw new Error('useCall must be used within CallProvider')
    }
    return context
}

export const CallProvider = ({ children }) => {
    const [incomingCall, setIncomingCall] = useState(null)
    const [activeCall, setActiveCall] = useState(null)
    const [localStream, setLocalStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const [isAudioEnabled, setIsAudioEnabled] = useState(true)
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [callStatus, setCallStatus] = useState('idle') // idle, calling, ringing, connected

    const peerConnectionRef = useRef(null)
    const socketRef = useRef(null)
    const localStreamRef = useRef(null)
    const remoteStreamRef = useRef(null)
    const pendingOfferRef = useRef(false)
    const activeCallRef = useRef(null)

    const ICE_SERVERS = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
        ]
    }

    useEffect(() => {
        socketRef.current = io(process.env.NEXT_PUBLIC_API_URL)

        socketRef.current.on('call:incoming', handleIncomingCall)
        socketRef.current.on('call:accepted', handleCallAccepted)
        socketRef.current.on('call:rejected', handleCallRejected)
        socketRef.current.on('call:offer', handleReceiveOffer)
        socketRef.current.on('call:answer', handleReceiveAnswer)
        socketRef.current.on('call:ice-candidate', handleReceiveIceCandidate)
        socketRef.current.on('call:ended', handleCallEnded)
        socketRef.current.on('call:audio-toggled', handleRemoteAudioToggle)
        socketRef.current.on('call:video-toggled', handleRemoteVideoToggle)

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
            }
            cleanupCall()
        }
    }, [])

    // Handle creating offer after call is accepted and activeCall is set
    useEffect(() => {
        const createOfferIfNeeded = async () => {
            const currentCall = activeCallRef.current
            if (pendingOfferRef.current && currentCall && callStatus === 'connecting') {
                pendingOfferRef.current = false

                await setupPeerConnection()
                const offer = await peerConnectionRef.current.createOffer()
                await peerConnectionRef.current.setLocalDescription(offer)

                socketRef.current.emit('call:offer', {
                    channelId: currentCall.channelId,
                    offer,
                    targetUserId: currentCall.targetUserId
                })
            }
        }
        createOfferIfNeeded()
    }, [activeCall, callStatus])

    const handleIncomingCall = (callData) => {
        setIncomingCall(callData)
        setCallStatus('ringing')
    }

    const handleCallAccepted = async () => {
        setCallStatus('connecting')
        // Mark that we need to create an offer
        pendingOfferRef.current = true
    }

    const handleCallRejected = () => {
        alert('Call was rejected')
        cleanupCall()
    }

    const handleReceiveOffer = async ({ offer, senderId }) => {
        if (!peerConnectionRef.current) {
            await setupPeerConnection()
        }

        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await peerConnectionRef.current.createAnswer()
        await peerConnectionRef.current.setLocalDescription(answer)

        const currentCall = activeCallRef.current
        if (currentCall) {
            socketRef.current.emit('call:answer', {
                channelId: currentCall.channelId,
                answer,
                targetUserId: currentCall.targetUserId
            })
        }
    }

    const handleReceiveAnswer = async ({ answer }) => {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
        setCallStatus('connected')
    }

    const handleReceiveIceCandidate = async ({ candidate }) => {
        if (peerConnectionRef.current && candidate) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
        }
    }

    const handleCallEnded = () => {
        cleanupCall()
    }

    const handleRemoteAudioToggle = ({ enabled }) => {
        // You can show UI notification that remote user muted/unmuted
        console.log('Remote audio:', enabled ? 'enabled' : 'disabled')
    }

    const handleRemoteVideoToggle = ({ enabled }) => {
        // You can show UI notification that remote user turned video on/off
        console.log('Remote video:', enabled ? 'enabled' : 'disabled')
    }

    const setupPeerConnection = async () => {
        const peerConnection = new RTCPeerConnection(ICE_SERVERS)
        peerConnectionRef.current = peerConnection

        // Add local stream tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStreamRef.current)
            })
        }

        // Handle incoming remote stream
        peerConnection.ontrack = (event) => {
            const [stream] = event.streams
            remoteStreamRef.current = stream
            setRemoteStream(stream)
            setCallStatus('connected')
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            const currentCall = activeCallRef.current
            if (event.candidate && currentCall) {
                socketRef.current.emit('call:ice-candidate', {
                    channelId: currentCall.channelId,
                    candidate: event.candidate,
                    targetUserId: currentCall.targetUserId
                })
            }
        }

        peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', peerConnection.connectionState)
            if (peerConnection.connectionState === 'disconnected' ||
                peerConnection.connectionState === 'failed') {
                cleanupCall()
            }
        }
    }

    const createOffer = async () => {
        await setupPeerConnection()

        const offer = await peerConnectionRef.current.createOffer()
        await peerConnectionRef.current.setLocalDescription(offer)

        socketRef.current.emit('call:offer', {
            channelId: activeCall.channelId,
            offer,
            targetUserId: activeCall.targetUserId
        })
    }

    const startCall = async (channelId, targetUserId, targetUserName, callType = 'video') => {
        try {
            const constraints = {
                audio: true,
                video: callType === 'video' ? { width: 1280, height: 720 } : false
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            localStreamRef.current = stream
            setLocalStream(stream)
            setIsAudioEnabled(true)
            setIsVideoEnabled(callType === 'video')

            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const result = await response.json()
            const currentUser = result.data

            const callData = {
                channelId,
                targetUserId,
                targetUserName,
                callType,
                callerId: currentUser.id,
                callerName: currentUser.name || currentUser.username,
                callerAvatar: currentUser.avatarUrl,
                startTime: Date.now()
            }

            activeCallRef.current = callData
            setActiveCall(callData)
            setCallStatus('calling')

            socketRef.current.emit('join_channel', channelId)
            socketRef.current.emit('call:initiate', callData)
        } catch (error) {
            console.error('Error starting call:', error)
            alert('Could not access camera/microphone')
            cleanupCall()
        }
    }

    const acceptCall = async () => {
        if (!incomingCall) return

        try {
            const constraints = {
                audio: true,
                video: incomingCall.callType === 'video' ? { width: 1280, height: 720 } : false
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            localStreamRef.current = stream
            setLocalStream(stream)
            setIsVideoEnabled(incomingCall.callType === 'video')

            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const result = await response.json()
            const currentUser = result.data

            const callData = {
                ...incomingCall,
                targetUserId: incomingCall.callerId,
                startTime: Date.now()
            }

            activeCallRef.current = callData
            setActiveCall(callData)
            setCallStatus('connecting')
            setIncomingCall(null)

            socketRef.current.emit('join_channel', incomingCall.channelId)
            socketRef.current.emit('call:accept', {
                channelId: incomingCall.channelId,
                userId: currentUser.id
            })
        } catch (error) {
            console.error('Error accepting call:', error)
            alert('Could not access camera/microphone')
            rejectCall()
        }
    }

    const rejectCall = async () => {
        if (!incomingCall) return

        const token = localStorage.getItem('token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await response.json()
        const currentUser = result.data

        socketRef.current.emit('call:reject', {
            channelId: incomingCall.channelId,
            userId: currentUser.id
        })

        setIncomingCall(null)
        setCallStatus('idle')
    }

    const endCall = async () => {
        if (activeCall) {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const result = await response.json()
            const currentUser = result.data

            socketRef.current.emit('call:end', {
                channelId: activeCall.channelId,
                userId: currentUser.id
            })

            // Save call log
            const startTime = activeCall.startTime || Date.now()
            const duration = Math.floor((Date.now() - startTime) / 1000)
            try {
                const token = localStorage.getItem('token')
                const participants = activeCall.targetUserId
                    ? [currentUser.id, activeCall.targetUserId].filter(Boolean)
                    : [currentUser.id]

                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/calls`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        channelId: activeCall.channelId,
                        callType: activeCall.callType,
                        duration,
                        participants,
                        startedAt: new Date(startTime).toISOString()
                    })
                })
            } catch (error) {
                console.error('Error saving call log:', error)
            }
        }

        cleanupCall()
    }

    const toggleAudio = async () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                setIsAudioEnabled(audioTrack.enabled)

                const currentCall = activeCallRef.current
                if (currentCall) {
                    const token = localStorage.getItem('token')
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                    const result = await response.json()
                    const currentUser = result.data

                    socketRef.current.emit('call:toggle-audio', {
                        channelId: currentCall.channelId,
                        userId: currentUser.id,
                        enabled: audioTrack.enabled
                    })
                }
            }
        }
    }

    const toggleVideo = async () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled
                setIsVideoEnabled(videoTrack.enabled)

                const currentCall = activeCallRef.current
                if (currentCall) {
                    const token = localStorage.getItem('token')
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                    const result = await response.json()
                    const currentUser = result.data

                    socketRef.current.emit('call:toggle-video', {
                        channelId: currentCall.channelId,
                        userId: currentUser.id,
                        enabled: videoTrack.enabled
                    })
                }
            }
        }
    }

    const cleanupCall = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop())
            localStreamRef.current = null
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close()
            peerConnectionRef.current = null
        }

        activeCallRef.current = null
        setLocalStream(null)
        setRemoteStream(null)
        setActiveCall(null)
        setIncomingCall(null)
        setCallStatus('idle')
        setIsAudioEnabled(true)
        setIsVideoEnabled(true)
    }

    const value = {
        incomingCall,
        activeCall,
        localStream,
        remoteStream,
        isAudioEnabled,
        isVideoEnabled,
        callStatus,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleAudio,
        toggleVideo
    }

    return <CallContext.Provider value={value}>{children}</CallContext.Provider>
}
