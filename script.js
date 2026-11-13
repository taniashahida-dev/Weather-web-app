const searchValue = document.getElementById("location-input");
const searchBtn = document.getElementById("search-btn");
const weatherForm = document.getElementById("weather-form");
const temp = document.getElementById("temperature");
const windSpeed = document.getElementById("wind-speed");
const rainChance = document.getElementById("rain-chance");
const feelsLike = document.getElementById("feels-like");
const weatherCondition = document.getElementById("weather-description");
const cityName = document.getElementById("city-name");
const lastUpdated = document.getElementById("last-updated");
const previousForecast = document.getElementById("previous-forecast");
const nextForecast = document.getElementById("next-forecast");

searchValue.addEventListener("input", function () {
  if (searchValue.value.trim() !== "") {
    searchBtn.disabled = false;
  } else {
    searchBtn.disabled = true;
  }
});

const weatherData = async () => {
  const location = searchValue.value.trim();


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

weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = await weatherData();
  displayWeather(data);

 const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const date = yesterday.toLocaleDateString("en-CA");

const previousData = await getPreviousWeatherData(
  searchValue.value.trim(),
  date
);

// Yesterday + today's hourly data
const combinedData = {
  days: [...previousData.days, ...data.days]
};

const previousHours = displayPreAndNextWeather(
  combinedData,
  "previous"
);

const nextHours = displayPreAndNextWeather(data, "next");
console.log(previousHours)
console.log(nextHours)
displayHourlyCards(previousHours, previousForecast, data.timezone);

displayHourlyCards(nextHours, nextForecast, data.timezone);;
});

const displayWeather = (data) => {
  const currentWeather = data.currentConditions;

  temp.innerText = `${currentWeather.temp}°C`;
  windSpeed.innerText = `${currentWeather.windspeed}km/h`;
  rainChance.innerText = `${currentWeather.precipprob}%`;
  feelsLike.innerText = `${currentWeather.feelslike}°C`;
  weatherCondition.innerText = `${currentWeather.conditions}`;
  lastUpdated.innerText = `Updated: ${new Date(currentWeather.datetimeEpoch * 1000).toLocaleString()}`;
  cityName.innerText = `${data.address}`;
};

const getPreviousWeatherData = async (location,date) => {
  
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}/${date}?unitGroup=metric&key=UT4HSGLKJUR3DE9CEL9P8J93K&contentType=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Previous weather data not found");
  }

  return await response.json();
};





const displayPreAndNextWeather = (data, forecastType) => {
  const hourlyData = data.days.flatMap((day) => day.hours || []);

  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  const filteredHours = hourlyData.filter((hour) => {
    const hourTime = hour.datetimeEpoch * 1000;

    if (forecastType === "next") {
      return hourTime >= now && hourTime <= now + twentyFourHours;
    }

    if (forecastType === "previous") {
      return hourTime >= now - twentyFourHours && hourTime < now;
    }

    return false;
  });

  return filteredHours;
};


const displayHourlyCards = (hours, container, timezone) => {
  container.innerHTML = "";

  hours.forEach((hour) => {
    // Create card
    const card = document.createElement("div");
    card.classList.add("forecast-item");

    // Create time
    const time = document.createElement("p");
    time.classList.add("forecast-time");

    time.innerText = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone
    }).format(new Date(hour.datetimeEpoch * 1000));

    // Create weather icon
    // const icon = getWeatherEmoji(hour.icon);
  const icon = document.createElement("p");
icon.classList.add("forecast-icon");
icon.innerText = getWeatherEmoji(hour.icon);

    // Create temperature
    const temperature = document.createElement("p");
    temperature.classList.add("forecast-temp");
    temperature.innerText = `${hour.temp}°C`;

    // Add everything to card
    card.append(time, icon, temperature);

    // Add card to container
    container.appendChild(card);
  });
};
const getWeatherEmoji = (icon) => {
  const icons = {
    "clear-day": "☀️",
    "clear-night": "🌙",
    "partly-cloudy-day": "⛅",
    "partly-cloudy-night": "☁️",
    "cloudy": "☁️",
    "rain": "🌧️",
    "showers-day": "🌦️",
    "snow": "❄️",
    "fog": "🌫️",
    "wind": "💨"
  };

  return icons[icon] || "🌡️";
};