let sizeOfA = 0
function itemTemplate(item)
{
    sizeOfA++
    document.getElementById("headerA").innerText = `Todo Count: ${sizeOfA} things`
    return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
    <span class="item-text">${item.text}</span>
    <div>
      <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
      <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
  </li>`
}

//Initial page load render
let ourHTML = items.map(function(item) { 
    return itemTemplate(item)
}).join('')
document.getElementById("item-list").insertAdjacentHTML("beforeend", ourHTML)
//create feature without refresh
let createField = document.getElementById("create-field")
document.getElementById("create-form").addEventListener("submit", function(e) {
    //prevent default behaviour of webbrowser
    e.preventDefault()
    //{property: value}
    axios.post('/new-item', {text: createField.value}).then(function(res) {
        //html for new item
        document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(res.data))
        
        createField.value = ""
        createField.focus()
    }).catch(function() {
        console.log("try later(error)")
    })

})


//label anonymous function parameter e for event
//using webrowser console with this script
document.addEventListener("click", function(e) {
    //update feature
    if(e.target.classList.contains("edit-me"))
    {
        let userInput = prompt("Enter new text: ", e.target.parentElement.parentElement.querySelector(".item-text").innerHTML)
        //now send userInput to node.js server
        //tell webrowser to send req to server without form or url
        //need to use <script> from github/axios
        if(userInput)
        {
            axios.post('/update-item', {text: userInput, id: e.target.getAttribute("data-id")}).then(function() {
                e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput
            }).catch(function() {
                console.log("try later(error)")
            })
        }
    }
    //delete feature
    if(e.target.classList.contains("delete-me"))
    {
        if(confirm("Are you sure? (permanently deletes): "))
        {
            axios.post('/delete-item', {id: e.target.getAttribute("data-id")}).then(function() {
                e.target.parentElement.parentElement.remove()
                sizeOfA--
                document.getElementById("headerA").innerText = `Todo: ${sizeOfA} things`
            }).catch(function() {
                console.log("try later(error)")
            })
        }
    }
    
})