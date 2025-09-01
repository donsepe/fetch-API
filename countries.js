const dropdown = document.getElementById("countryDropdown");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const results = document.getElementById("results");

const WEATHER_API_KEY = `004bba4151dfddf7189ea0f4828f17ee`; // replace with your key
let countries = [];

// Load countries on page load
window.addEventListener("load", async () => {
  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/all?fields=name,flags,capital,area,timezones,cca2,population`
    );
    countries = await res.json();

    // sort alphabetically
    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

    countries.forEach(c => {
      if (c.name?.common) {
        const option = document.createElement("option");
        option.value = c.name.common;
        option.textContent = c.name.common;
        dropdown.appendChild(option);
      }
    });
  } catch (err) {
    console.error("Error loading countries:", err);
  }
});

const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");

// autocomplete
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  suggestions.innerHTML = "";

  if (!query) return;

  const matches = countries.filter(c =>
    c.name.common.toLowerCase().startsWith(query)
  );

  matches.slice(0, 8).forEach(match => {
    const div = document.createElement("div");
    div.textContent = match.name.common;
    div.addEventListener("click", () => {
      searchInput.value = match.name.common;
      suggestions.innerHTML = "";
      displayCountry(match.name.common); // call the new unified function
    });
    suggestions.appendChild(div);
  });
});

// --- Reusable function to render country card ---
async function displayCountry(countryName) {
  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${countryName}?fields=name,flags,capital,population,area,timezones,cca2`
    );
    const data = await res.json();
    const country = data[0];

    const flag = country.flags.svg;
    const capital = country.capital ? country.capital[0] : "N/A";
    const landArea = country.area;
    const countryCode = country.cca2;
    const localTime = country.timezones;

    // news
    const newsHTML = await getCountryNews(countryCode);

    // weather
    let weatherHTML = "<p>No weather info available</p>";
    if (capital !== "N/A") {
      try {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${WEATHER_API_KEY}&units=metric`
        );
        const weatherData = await weatherRes.json();

        if (weatherData.cod === 200) {
          const temp = weatherData.main.temp;
          const desc = weatherData.weather[0].description;
          const icon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`;
          weatherHTML = `
            <div class="weather">
              <img src="${icon}" alt="${desc}">
              <p>${temp}°C, ${desc}</p>
            </div>
          `;
        }
      } catch (err) {
        console.error("Weather fetch failed:", err);
      }
    }

    // Create card
    const card = document.createElement("div");
    card.className = "country-card";
    card.innerHTML = `
      <img class="flag" src="${flag}" alt="Flag of ${countryName}">
      <h2>${countryName}</h2>
      <p><strong>Capital:</strong> ${capital}</p>
      <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
      <p><strong>Land Area:</strong> ${landArea.toLocaleString()} km²</p>
      <p>Population Density: ${parseInt(country.population / landArea)} people/km²</p>
      <p>Local Time: ${getLocalTime(localTime)}</p>
      
      <h3>Top News:</h3>  
      ${newsHTML}

      ${weatherHTML}
    `;

    results.prepend(card);
  } catch (err) {
    console.error("Error fetching country:", err);
  }
}

// News
async function getCountryNews(countryCode) {
  const apiKey = "016205d287b036acdf8b167c03d69fb8";
  const url = `https://gnews.io/api/v4/search?q=${countryCode}&lang=en&max=3&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.articles || data.articles.length === 0) {
      return `<p>No top headlines available.</p>`;
    }

    return data.articles
      .map(
        article => `
        <p>
          <a href="${article.url}" target="_blank">${article.title}</a>
          <small>(${article.source.name})</small>
        </p>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error fetching news:", error);
    return `<p>Could not load news.</p>`;
  }
}

// Local time
function getLocalTime(timezones) {
  if (!timezones || timezones.length === 0) return "N/A";

  const offsetString = timezones[0];
  const match = offsetString.match(/UTC([+-]\d{2}):?(\d{2})?/);
  if (!match) return "N/A";

  const sign = match[1][0];
  const hours = parseInt(match[1].slice(1), 10);
  const minutes = parseInt(match[2] || "0", 10);

  const offsetMinutes = (hours * 60 + minutes) * (sign === "+" ? 1 : -1);

  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utc + offsetMinutes * 60000);

  return local.toLocaleString();
}

// --- Button listeners ---
searchBtn.addEventListener("click", () => {
  const countryName = dropdown.value || searchInput.value;
  if (countryName) displayCountry(countryName);
});

clearBtn.addEventListener("click", () => {
  results.innerHTML = "";
});