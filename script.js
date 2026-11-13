const searchValue = document.getElementById("location-input");
const searchBtn = document.getElementById("search-btn");
const weatherForm = document.getElementById("weather-form");

const locationBtn = document.getElementById("location-btn");
const refreshBtn = document.getElementById("refresh-btn");

const temp = document.getElementById("temperature");
const windSpeed = document.getElementById("wind-speed");
const rainChance = document.getElementById("rain-chance");
const feelsLike = document.getElementById("feels-like");

const weatherIcon = document.getElementById("weather-icon");
const weatherCondition = document.getElementById("weather-description");
const cityName = document.getElementById("city-name");
const lastUpdated = document.getElementById("last-updated");

const previousForecast = document.getElementById("previous-forecast");
const nextForecast = document.getElementById("next-forecast");

const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");

const API_KEY = "UT4HSGLKJUR3DE9CEL9P8J93K";

const API_BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

let activeLocation = "";

searchValue.addEventListener("input", function () {
  searchBtn.disabled = searchValue.value.trim() === "";
});

const weatherData = async (location) => {
  const encodedLocation = encodeURIComponent(location);

  const url = `${API_BASE_URL}/${encodedLocation}?unitGroup=metric&key=${API_KEY}&contentType=json`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Invalid location. Please enter a valid location.");
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error("API key is invalid or access is denied.");
    }

    throw new Error("Unable to fetch weather data. Please try again.");
  }

  return await response.json();
};

const getPreviousWeatherData = async (location, startDate, endDate) => {
  const encodedLocation = encodeURIComponent(location);

  const url = `${API_BASE_URL}/${encodedLocation}/${startDate}/${endDate}?unitGroup=metric&key=${API_KEY}&contentType=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to fetch previous weather data.");
  }

  return await response.json();
};

const getYesterdayDate = (timezone) => {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const yesterday = new Date(`${today}T00:00:00Z`);

  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  return yesterday.toISOString().split("T")[0];
};

const loadweather = async (location = searchValue.value.trim()) => {
  if (!location) {
    errorMessage.innerText = "Please enter a location first.";
    errorMessage.style.display = "block";
    return;
  }

  activeLocation = location;

  loadingMessage.style.display = "block";
  errorMessage.style.display = "none";

  searchBtn.disabled = true;
  locationBtn.disabled = true;
  refreshBtn.disabled = true;

  try {
    const data = await weatherData(location);

    displayWeather(data);

    const yesterday = getYesterdayDate(data.timezone);

    const previousData = await getPreviousWeatherData(
      location,
      yesterday,
      yesterday,
    );

    const combinedData = {
      days: [...previousData.days, ...data.days],
    };

    const previousHours = displayPreAndNextWeather(
      combinedData,
      "previous",
      data.timezone,
    );

    const nextHours = displayPreAndNextWeather(data, "next", data.timezone);

    displayHourlyCards(previousHours, previousForecast, data.timezone);

    displayHourlyCards(nextHours, nextForecast, data.timezone);
  } catch (error) {
    console.error("Weather Error:", error);

    errorMessage.innerText =
      error.message || "Unable to load weather data. Please try again.";

    errorMessage.style.display = "block";
  } finally {
    loadingMessage.style.display = "none";

    searchBtn.disabled = searchValue.value.trim() === "";
    locationBtn.disabled = false;
    refreshBtn.disabled = false;
  }
};

weatherForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const location = searchValue.value.trim();

  loadweather(location);
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    errorMessage.innerText = "Geolocation is not supported by your browser.";

    errorMessage.style.display = "block";
    return;
  }

  loadingMessage.style.display = "block";
  errorMessage.style.display = "none";

  locationBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const location = `${latitude},${longitude}`;

      searchValue.value = "";

      loadweather(location);
    },

    (error) => {
      loadingMessage.style.display = "none";
      locationBtn.disabled = false;

      if (error.code === error.PERMISSION_DENIED) {
        errorMessage.innerText =
          "Location permission denied. Please allow location access.";
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage.innerText = "Your current location is unavailable.";
      } else if (error.code === error.TIMEOUT) {
        errorMessage.innerText =
          "Location request timed out. Please try again.";
      } else {
        errorMessage.innerText = "Unable to detect your location.";
      }

      errorMessage.style.display = "block";
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  );
});

refreshBtn.addEventListener("click", () => {
  if (activeLocation) {
    loadweather(activeLocation);
  }
});

const displayWeather = (data) => {
  const currentWeather = data.currentConditions;

  temp.innerText = `${currentWeather.temp}°C`;

  windSpeed.innerText = `${currentWeather.windspeed} km/h`;

  rainChance.innerText = `${currentWeather.precipprob ?? 0}%`;

  feelsLike.innerText = `${currentWeather.feelslike}°C`;

  weatherCondition.innerText = currentWeather.conditions;

  weatherIcon.innerText = getWeatherEmoji(currentWeather.icon);

  cityName.innerText = data.resolvedAddress || data.address;

  lastUpdated.innerText = `Updated: ${new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: data.timezone,
  }).format(new Date())}`;
};

const displayPreAndNextWeather = (data, forecastType, timezone) => {
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

  filteredHours.sort((a, b) => a.datetimeEpoch - b.datetimeEpoch);

  return filteredHours;
};

const displayHourlyCards = (hours, container, timezone) => {
  container.innerHTML = "";

  if (hours.length === 0) {
    container.innerHTML =
      '<p class="no-forecast">No hourly forecast available.</p>';

    return;
  }

  hours.forEach((hour) => {
    const card = document.createElement("div");
    card.classList.add("forecast-item");

    const time = document.createElement("p");
    time.classList.add("forecast-time");

    time.innerText = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone,
    }).format(new Date(hour.datetimeEpoch * 1000));

    const icon = document.createElement("p");
    icon.classList.add("forecast-icon");

    icon.innerText = getWeatherEmoji(hour.icon);

    const temperature = document.createElement("p");
    temperature.classList.add("forecast-temp");

    temperature.innerText = `${hour.temp}°C`;

    card.append(time, icon, temperature);

    container.appendChild(card);
  });
};

const getWeatherEmoji = (icon) => {
  const icons = {
    "clear-day": "☀️",
    "clear-night": "🌙",

    "partly-cloudy-day": "⛅",
    "partly-cloudy-night": "☁️",

    cloudy: "☁️",

    rain: "🌧️",
    "showers-day": "🌦️",
    "showers-night": "🌧️",

    snow: "❄️",
    "snow-showers-day": "🌨️",
    "snow-showers-night": "🌨️",

    fog: "🌫️",
    wind: "💨",

    thunderstorm: "⛈️",
  };

  return icons[icon] || "🌡️";
};
