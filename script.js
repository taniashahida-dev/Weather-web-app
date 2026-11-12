const searchValue = document.getElementById("location-input");
const searchBtn = document.getElementById("search-btn");

searchValue.addEventListener("input", function () {
  if (searchValue.value.trim() !== "") {
    searchBtn.disabled = false;
  } else {
    searchBtn.disabled = true;
  }
});

const weatherData = async () => {
  const location = searchValue.value;
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=UT4HSGLKJUR3DE9CEL9P8J93K&contentType=json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Weather data not found");
    }
    const data = await response.json();
    // console.log(data);
    return data;
  } catch (error) {
    console.error("Weather API Error:", error);
    throw error;
  }
};


searchBtn.addEventListener("click",async(event)=>{
event.preventDefault()
    const data =await weatherData()
    console.log(data.currentConditions)
})