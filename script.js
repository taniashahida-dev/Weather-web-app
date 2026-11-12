const searchValue = document.getElementById("location-input");
const searchBtn = document.getElementById("search-btn");
const weatherForm = document.getElementById("weather-form");
const temp = document.getElementById("temperature")
const windSpeed = document.getElementById("wind-speed")
const rainChance = document.getElementById("rain-chance")
const feelsLike = document.getElementById("feels-like")
const weatherCondition = document.getElementById("weather-description")
const cityName = document.getElementById("city-name")


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


weatherForm.addEventListener("click",async(event)=>{
event.preventDefault()
    const data =await weatherData()
    const currentWeather = data.currentConditions
    displayWeather(currentWeather)

    
})

const displayWeather=(currentWeather)=>{
console.log(currentWeather)
temp.innerText = `${currentWeather.temp}°C`
windSpeed.innerText = `${currentWeather.windspeed}km/h`
rainChance.innerText = `${currentWeather.precipprob}%`
feelsLike.innerText = `${currentWeather.feelslike}°C`
weatherCondition.innerText = `${currentWeather.conditions}`
cityName.innerText = `${searchValue.value}`
}