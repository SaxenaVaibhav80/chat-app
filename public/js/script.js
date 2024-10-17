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

const userListItems = document.querySelectorAll('div[data-id]');
const defaultuser= document.querySelectorAll('div[data-id]')[0];
let selectedUserId =defaultuser.getAttribute('data-id')
console.log(selectedUserId)
socket.emit("load chat", selectedUserId);

userListItems.forEach(item => {
    item.addEventListener('click', () => {
        selectedUserId = item.getAttribute('data-id'); 
        socket.emit("load chat", selectedUserId);
        console.log(`User selected: ${selectedUserId}`);
    });
});


const messageInput = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message-button');

sendMessageButton.addEventListener('click', () => {
    const message = messageInput.value;

    if (selectedUserId && message) {
        socket.emit('sendMessageToUser', { userId: selectedUserId, message });
   
        const messageElement = document.createElement('p');
        const messageBox = document.getElementById("msg-box");
        messageElement.textContent = `You: ${message}`;  
        messageBox.appendChild(messageElement); 
        messageInput.value = ''; 
    } else {
        alert('Please select a user and type a message');
    }
});


socket.on("message", (message) => {
    const messageBox = document.getElementById("msg-box");
    const messageElement = document.createElement('p');
    messageElement.textContent = `User: ${message[0]}`;
    if(selectedUserId===message[1])
    {
        messageBox.appendChild(messageElement);

    }else {
       
       // notifictaion will be added soon
    }

});

socket.on("Load msg", (msgs) => {
    console.log("hii")
    const messageBox = document.getElementById("msg-box");
    messageBox.innerHTML = '';

    try {
        if (Array.isArray(msgs) && msgs.length > 0) {
            msgs.forEach(msg => {
                const messageElement = document.createElement('div');
               
                messageElement.textContent = `${msg.senderId === selectedUserId ? 'User' : 'You'}: ${msg.text}`;
                messageBox.appendChild(messageElement);
            });
        } else {
            const messageElement = document.createElement('div');
            messageElement.textContent = "Start chat";
            messageBox.appendChild(messageElement);
        }
    } catch (err) {
        console.error("Error loading chat", err);
    }
});
