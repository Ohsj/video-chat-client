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

const videoChatContainer = document.getElementById('video-chat-container');

// Variables.
const socket = io("localhost:5000")

let joinObj = {roomId: '', userName: ''}
let isRoomCreator

// Click event.
connectButton.addEventListener('click', () => {
    joinRoom({roomId: roomInput.value, userName: nameInput.value})
})

// socket event.
socket.on('room_created', async () => {
    console.log('Socket event Callback: room_created');
    isRoomCreator = true;
});

socket.on('room_joined', async () => {
    console.log('Socket event Callback: room_joined');
})

socket.on('full_room', async () => {
    console.log('Socket event Callback: full_room')
    showRoomSelectionConference('The room is full, please try another one')
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
        joinObj = {roomId: joinData.roomId, userName: joinData.userName}
        socket.emit('join', joinObj);
        showVideoConference()
    }
}

function showVideoConference() {
    roomSelectionContainer.style = "display: none";
    videoChatContainer.style = "display: block";
}

function showRoomSelectionConference(content) {
    roomSelectionContainer.style = "display: block";
    videoChatContainer.style = "display: none";
    if (content) {
        showMessage(content)
    }
}

function showMessage(content) {
    message.style = "display: block;"
    message.innerText = content;
}