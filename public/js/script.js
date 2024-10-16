const socket = io();
let extracted_token;


fetch('/login/api', {
    method: 'POST',
})
.then(response => response.json()) 
.then(data => {
    localStorage.setItem("token", data.token);
    extracted_token = localStorage.getItem('token');
    socket.emit("token", extracted_token);
})
.catch(error => {
    console.error('Error fetching token:', error);
});


socket.on("online", (status) => {
    console.log("user is " + status);
});

socket.on("offline", (data) => {
    console.log("user is " + data);
});


const userListItems = document.querySelectorAll('li[data-id]');
let selectedUserId = null;


const updateSelectedUser = (userId) => {
    selectedUserId = userId;
}

if (userListItems.length > 0) {
    const firstUser = userListItems[0].getAttribute('data-id');
    updateSelectedUser(firstUser);
}


userListItems.forEach(item => {
    item.addEventListener('click', () => {
        const userId = item.getAttribute('data-id');
        updateSelectedUser(userId);
        socket.emit('load chat',userId)
    });
});

const messageInput = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message-button');

sendMessageButton.addEventListener('click', () => {
    const message = messageInput.value;

    if (selectedUserId && message) {
        socket.emit('sendMessageToUser', { userId: selectedUserId, message });
        
        messageInput.value = ''; 
    } else {
        alert('Please select a user and type a message');
    }
});

socket.on("message",(msgs)=>
{
    const msgBox = document.getElementById('msg-box');
    msgBox.innerHTML = ''; // Clear previous messages
    msgs.forEach(msg => {
    const msgElement = document.createElement('div');
    msgElement.textContent = `${msg.senderId === selectedUserId ? 'You' : 'User'}: ${msg.text}`;
    msgBox.appendChild(msgElement);
})

})

socket.on("newchat",(startchat)=>
{
    const msgBox = document.getElementById('msg-box');
    const msgElement = document.createElement('div');
    msgElement.textContent = startchat
    msgBox.appendChild(msgElement);

})