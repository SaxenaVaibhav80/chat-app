const socket = io()
let extracted_token
fetch('/login/api', {
    method: 'POST',
})
.then(response => response.json()) 
  .then(data => {
      localStorage.setItem("token",data.token) 
      extracted_token=localStorage.getItem('token')
      socket.emit("token",extracted_token)
  })
  .catch(error => {
      console.error('Error fetching token:', error);
  });


  socket.on("online",(status)=>
{
    console.log("user is "+status)
})

socket.on("offline",(data)=>
{
    console.log("user is "+data)
})


const userListItems = document.querySelectorAll('li[data-id]');
let selectedUserId = null;

userListItems.forEach(item => {
    item.addEventListener('click', () => {
        selectedUserId = item.getAttribute('data-id'); 
        console.log(`User selected: ${selectedUserId}`);
    });
});


const messageInput = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message-button');

sendMessageButton.addEventListener('click', () => {
    const message = messageInput.value;

  
    if (selectedUserId && message) {
       
        socket.emit('sendMessageToUser', { userId: selectedUserId, message });
        const messageElement = document.createElement('h3');
        const messageBox = document.getElementById("msg-box")
        messageElement.textContent = `You : ${message}`;  
        messageBox.appendChild(messageElement); 
        messageInput.value = ''; 
    } else {
        alert('Please select a user and type a message');
    }
    
});


socket.on("receiveMessage",(data)=>
    {   const messageBox = document.getElementById("msg-box")
        const messageElement = document.createElement('h3');
        messageElement.textContent = `user : ${data}`; 
        messageBox.appendChild(messageElement); 
    })


