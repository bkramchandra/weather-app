// विश्वको नक्सा बनाउने (सुरुमा पूरै विश्व देखिन्छ)
const map = L.map("map", {
  zoomControl: false,
}).setView([20, 0], 2);

// नक्साको तस्बिर (tiles) OpenStreetMap बाट ल्याउने
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let marker = null; // खोजेको सहरको चिन्ह

const input = document.getElementById("cityInput");
const button = document.getElementById("searchBtn");
const message = document.getElementById("message");
const result = document.getElementById("result");

// मौसमको कोडलाई शब्दमा बदल्ने
const weatherCodes = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Fog",
  51: "Light drizzle",
  61: "Rain",
  71: "Snow",
  80: "Rain showers",
  95: "Thunderstorm",
};

async function getWeather(city) {
  try {
    message.textContent = "Loading...";
    result.classList.add("hidden");

    // पहिलो काम: सहरको location खोज्ने
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results) {
      message.textContent = "City not found. Try again.";
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // नक्सा सहरमा उड्दै zoom हुन्छ
    map.flyTo([latitude, longitude], 10, { duration: 3 });

    // पुरानो चिन्ह हटाएर नयाँ राख्ने
    if (marker) map.removeLayer(marker);
    marker = L.marker([latitude, longitude]).addTo(map);

    // दोस्रो काम: त्यो location को मौसम ल्याउने
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    // स्क्रिनमा देखाउने
    document.getElementById("cityName").textContent = `${name}, ${country}`;
    document.getElementById("temp").textContent = `${current.temperature_2m}°C`;
    document.getElementById("desc").textContent =
      weatherCodes[current.weather_code] || "Unknown";
    document.getElementById("humidity").textContent =
      `Humidity: ${current.relative_humidity_2m}%`;
    document.getElementById("wind").textContent =
      `Wind: ${current.wind_speed_10m} km/h`;

    message.textContent = "";
    result.classList.remove("hidden");
  } catch (error) {
    message.textContent = "Something went wrong. Check your internet.";
  }
}

button.addEventListener("click", () => {
  const city = input.value.trim();
  if (city) getWeather(city);
});

// Enter थिच्दा पनि चलोस्
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") button.click();
});
