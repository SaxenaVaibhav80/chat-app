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
 





 