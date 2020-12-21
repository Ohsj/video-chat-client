/**
 * @since
 * 201216 | osj4532 | created
 */

// Dom elements
const roomSelectionContainer = document.getElementById('room-selection-container')
const nameInput = document.getElementById('name-input');
const roomInput = document.getElementById('room-input');
const connectButton = document.getElementById('connect-button');
const message = document.getElementById('message');
const selectorContainer = document.getElementById('camera-selector-container')
const selector = document.getElementById('mobile-camera-selector')

const videoChatContainer = document.getElementById('video-chat-container');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');

// Variables.
// const socket = io("localhost:5001")
const socket = io("https://vcs.osj4532.ml")
let videoConstraints = {
    width: 1280,
    height: 720,
}

let mediaConstraints = {
    audio: true,
    video: videoConstraints,
}

let localStream
let remoteStream
let socketObj = {roomId: '', userName: ''}
let isRoomCreator
let rtcPeerConnection

const iceServers = {
    iceServers: [
        { urls: 'turn:vcs.osj4532.ml:3478',
            username: 'osj4532',
            credential: 'osj4532@123'
        }
    ],
}

// Click event.
connectButton.addEventListener('click', () => {
    joinRoom({roomId: roomInput.value, userName: nameInput.value})
})

selector.addEventListener('change', async (e) => {
    if (e.target.value === 'front') {
        videoConstraints.facingMode = 'user'
    } else if (e.target.value === 'back') {
        videoConstraints.facingMode = { exact: 'environment'}
    }
})

// socket event.
socket.on('room_created', async () => {
    console.log('Socket event Callback: room_created');

    await setLocalStream(mediaConstraints)
    isRoomCreator = true;
});

socket.on('room_joined', async () => {
    console.log('Socket event Callback: room_joined');

    await setLocalStream(mediaConstraints)
    socket.emit('start_call', socketObj.roomId);
});

socket.on('full_room', async (joinData) => {
    console.log('Socket event Callback: full_room')
    showRoomSelectionConference(`The room [${joinData.roomId}] is full, please try another one`)
});

socket.on('start_call', async () => {
    console.log(`Socket event callback: start_call, isRoomCreator:[${isRoomCreator}]`)

    if (isRoomCreator) {
        console.log('start call because not RoomCreator');
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        try {
            addLocalTracks(rtcPeerConnection)
        } catch (e) {
            console.log('addLocalTracks err:', e);
        }
        rtcPeerConnection.ontrack = setRemoteStream
        rtcPeerConnection.onicecandidate = sendIceCandidate
        await createOffer(rtcPeerConnection)
    }
});

socket.on('webrtc_offer', async (event) => {
    console.log('Socket event callback: webrtc_offer');

    if (!isRoomCreator) {
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        try {
            addLocalTracks(rtcPeerConnection);
        } catch (e) {
            console.error('addLocalTracks err:',e)
        }
        rtcPeerConnection.ontrack = setRemoteStream;
        rtcPeerConnection.onicecandidate = sendIceCandidate;
        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
        await createAnswer(rtcPeerConnection)
    }
})

socket.on('webrtc_answer', (event) => {
    console.log('Socket event callback: webrtc_answer')

    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
})

socket.on('webrtc_ice_candidate', (event) => {
    console.log('Socket event callback: webrtc_ice_candidate')

    let candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate,
    })
    rtcPeerConnection.addIceCandidate(candidate)
})

// Function.
function joinRoom(joinData) {
     if (joinData.userName === '') {
        showMessage('Please type a user name')
         nameInput.focus()
    } else if (joinData.roomId === '') {
        showMessage('Please type a room ID')
         roomInput.focus()
    } else {
        socketObj = {roomId: joinData.roomId, userName: joinData.userName}
        socket.emit('join', socketObj);
        showVideoConference()
    }
}

function showVideoConference() {
    roomSelectionContainer.style = "display: none";
    selectorContainer.sytle = "display: block";
    videoChatContainer.style = "display: block";
}

function showRoomSelectionConference(content) {
    roomSelectionContainer.style = "display: block";
    selectorContainer.sytle = "display: none";
    videoChatContainer.style = "display: none";
    if (content) {
        showMessage(content)
    }
}

function showMessage(content) {
    message.style = "display: block;"
    message.innerText = content;
}

async function setLocalStream(mediaConstraints) {
    console.log('setLocalStream Start');
    let stream
    try {
        stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    } catch (error) {
        console.log('setLocalStream Could not get user media', error);
    }

    localStream = stream;
    localVideo.srcObject = stream;
    console.log('setLocalStream End');
}

function setRemoteStream(event) {
    remoteVideo.srcObject = event.streams[0]
    remoteStream = event.stream
}

function addLocalTracks(rtcPeerConnection) {
    localStream.getTracks().forEach((track) => {
        createOption(track)
        rtcPeerConnection.addTrack(track, localStream)
    });
}

function sendIceCandidate(event) {
    if (event.candidate) {
        socket.emit('webrtc_ice_candidate', {
            roomId: socketObj.roomId,
            label: event.candidate.sdpMLineIndex,
            candidate: event.candidate.candidate,
        })
    }
}

async function createOffer(rtcPeerConnection) {
    let sessionDescription
    try {
        sessionDescription = await rtcPeerConnection.createOffer();
        rtcPeerConnection.setLocalDescription(sessionDescription);
    } catch (error) {
        console.error(error);
    }

    socket.emit('webrtc_offer', {
        type: 'webrtc_offer',
        sdp: sessionDescription,
        roomId: socketObj.roomId,
    })
}

async function createAnswer(rtcPeerConnection) {
    let sessionDescription
    try {
        sessionDescription = await rtcPeerConnection.createAnswer();
        rtcPeerConnection.setLocalDescription(sessionDescription);
    } catch (error) {
        console.error(error);
    }

    socket.emit('webrtc_answer', {
        type: 'webrtc_answer',
        sdp: sessionDescription,
        roomId: socketObj.roomId,
    })
}

function createOption(track) {
    const option = document.createElement("option")
    option.value = track.id
    option.text = track.kind
    selector.appendChild(option)
}