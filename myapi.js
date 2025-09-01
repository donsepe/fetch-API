const dogImg = document.getElementById("your-dog");
const getDogBtn = document.getElementById("get-dog");
const catFactEl = document.getElementById("cat-fact");

window.addEventListener("load", function(){
    //dogImg.alt = "Get your dog today";
      dogImg.style.display = "none";

});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


getDogBtn.addEventListener("click", async function(){
    try {
        dogImg.alt = "Fetching a cute doggo... 🐾";
        dogImg.src = "";
        catFactEl.innerHTML = "Pulling an interesting cat fact...";

        //await delay(2000);

        // call the API
        const response = await fetch("https://dog.ceo/api/breeds/image/random");

        // convert response into JSON
        const data = await response.json();

        const catResponse = await fetch("https://catfact.ninja/fact");

        const catData = await catResponse.json();

        console.log(data); // <-- you'll see { message: "imageURL", status: "success" }
        console.log(catData);
        
        dogImg.src = data.message;
        dogImg.alt = "Your dog of the day 🐶";
        dogImg.style.display = "block"; // only show now
        catFactEl.innerText = catData.fact;
    } 
    
    catch (error) {
        console.log("Something went wrong:", error);
        catFactEl.innerText = `Oopps! Something went wrong: ${error}`;
  }
});