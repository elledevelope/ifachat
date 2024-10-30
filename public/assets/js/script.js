// declaration de variables
const userList = document.getElementById("userList");

const sendPublic = document.querySelector("#sendPublic");
const messagesPublic = document.getElementById("messagesPublic");
const socket = io();
const query = window.location.search;
const urlParams = new URLSearchParams(query);
const pseudo = urlParams.get("pseudo");
console.log(pseudo);
const pwd = urlParams.get("pwd");
console.log(pwd);

// declarations de fonction
const displayMessage = (data) => {
    messagesPublic.innerHTML += `
    <div class="newMessage">
        <h2>${data.pseudo}</h2>
        <p class="content">${data.messageContent}</p>
        <p class="date">${data.date}</p>
    </div>`
};

//----------- TinyMCE textPublic textarea
tinymce.init({
    selector: '#textPublic',
    plugins: [
        'advlist', 'autolink',
        'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks',
        'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | formatpainter casechange blocks | bold italic backcolor | ' +
        'alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help'
});

//----------- TinyMCE privateMessageText textarea
tinymce.init({
    selector: '#privateMessageText',
    plugins: [
        'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview', 'anchor',
        'searchreplace', 'visualblocks', 'fullscreen', 'insertdatetime', 'media',
        'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | bold italic backcolor | alignleft aligncenter alignright | ' +
        'bullist numlist | removeformat | help'
});


// Open a popup to send private messaging :
const openPrivateMessagePopup = (recipient) => {
    document.getElementById("privateRecipient").textContent = recipient;
    document.getElementById("privateMessagePopup").style.display = "block";
};

///////////////--------------------------- Users-currently-online-list : 
const renderUserList = (users) => {
    userList.innerHTML = ""; // start with empty list of users
    users.forEach((user) => {
        const userElement = document.createElement("li");
        userElement.textContent = user.pseudo;
        userElement.addEventListener("click", () => openPrivateMessagePopup(user.pseudo));
        userList.appendChild(userElement);
    });
    // console.log(users.pseudo);
};


///////////////--------------------------- send private msg :
document.getElementById("sendPrivate").addEventListener("click", () => {
    const recipient = document.getElementById("privateRecipient").textContent;
    const messageContent = tinyMCE.get("privateMessageText").getContent();
    const date = new Date();

    const data = { recipient, pseudo, messageContent, date };
    socket.emit("privateMessage", data); // Emit the private message to server
    document.getElementById("privateMessagePopup").style.display = "none"; // Close popup
    tinyMCE.get("privateMessageText").setContent(""); // Clear TinyMCE content
});


// Close popup overlay :
document.getElementById("closePopup").addEventListener("click", () => {
    document.getElementById("privateMessagePopup").style.display = "none"; // Close popup
    tinyMCE.get("privateMessageText").setContent(""); // Clear TinyMCE content when closing
});


// Receiving incoming private messages :
socket.on("receivePrivateMessage", (data) => {
    const incomingMessagesDiv = document.getElementById("incomingMessages");
    
    // Create a new message element
    const messageElement = document.createElement("div");
    messageElement.classList.add("incoming-message"); // Add a class for styling if desired
    messageElement.innerHTML = `<strong>${data.pseudo}</strong>: ${data.messageContent}`;
    
    // Append the new message to the incoming messages div
    incomingMessagesDiv.appendChild(messageElement);
    
    // Optionally, ensure the popup is displayed when a new message arrives
    document.getElementById("privateMessagePopup").style.display = "block";
});

///////////////--------------------------- Receive the updated users list :
socket.on("updateUserList", (users) => {
    renderUserList(users);
});

socket.on("init", (data) => {
    console.dir(data);
    socket.emit("sendLog", {
        pseudo: pseudo,
        pwd: pwd
    });
});

sendPublic.addEventListener("click", () => {
    let messageContent = tinyMCE.get("textPublic").getContent();
    let date = new Date();//UTC ou https://momentjs.com/
    // envoie du message public au server
    let data = { pseudo: pseudo, messageContent: messageContent, date: date }
    socket.emit("publicMessage", data);
    displayMessage(data);
});


socket.on("publicMessageGlobal", (data) => {
    console.dir(data);
    displayMessage(data);
});