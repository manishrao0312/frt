// ==================== Weather Forecasting ====================

// Your OpenWeatherMap API Key
const WEATHER_API_KEY = 'adbbf33300084696a36f6f151a2efe5b'; // Replace with your actual API key

// Function to fetch weather data
async function getWeather(city) {
    const weatherDiv = document.getElementById('weather-result');
    weatherDiv.innerText = 'Loading...'; // Loading indicator

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error data:', errorData);
            throw new Error(`City not found: ${errorData.message}`);
        }
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        weatherDiv.innerText = error.message;
    }
}

// Function to display weather data
function displayWeather(data) {
    const weatherDiv = document.getElementById('weather-result');
    const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`; // URL for weather icon

    weatherDiv.innerHTML = `
        <h3>Weather in ${data.name}, ${data.sys.country}</h3>
        <img src="${iconUrl}" alt="${data.weather[0].description}" class="weather-icon">
        <p><strong>Temperature:</strong> ${data.main.temp.toFixed(1)} °C</p>
        <p><strong>Feels Like:</strong> ${data.main.feels_like.toFixed(1)} °C</p>
        <p><strong>Condition:</strong> ${data.weather[0].description}</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${data.wind.speed.toFixed(1)} m/s</p>
        <p><strong>Rain (last hour):</strong> ${data.rain ? data.rain['1h'] : 0} mm</p>
        <p><strong>Cloud Cover:</strong> ${data.clouds.all}%</p>
    `;
}

// Event listener for Weather button
document.getElementById('get-weather-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value.trim();
    if (city === '') {
        alert('Please enter a city name.');
        return;
    }
    getWeather(city);
});

// ==================== AI Flood Prediction ====================

let model;

// Function to create and train a simple logistic regression model
async function trainModel() {
    // Simple dataset: [Rainfall(mm)] -> [Flood (1) or No Flood (0)]
    const rainfall = tf.tensor2d([50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150], [11, 1]);
    const labels = tf.tensor2d([0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], [11, 1]);

    // Define a simple model
    model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [1], units: 1, activation: 'sigmoid' }));

    model.compile({
        optimizer: tf.train.sgd(0.01),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });

    // Train the model
    await model.fit(rainfall, labels, {
        epochs: 200,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                if (epoch % 50 === 0) {
                    console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
                }
            }
        }
    });
    console.log('Model training complete');
}

// Function to predict flood risk
async function predictFlood(rainfallValue) {
    const predictionDiv = document.getElementById('prediction-result');
    predictionDiv.innerText = 'Predicting...'; // Loading indicator

    if (!model) {
        await trainModel();
    }

    const input = tf.tensor2d([rainfallValue], [1, 1]);
    const prediction = model.predict(input);
    const probability = prediction.dataSync()[0];
    const result = probability > 0.5 ? 'High risk of flood' : 'Low risk of flood';
    
    predictionDiv.innerText = `${result} (${(probability * 100).toFixed(2)}%)`;
}

// Event listener for Predict button
document.getElementById('predict-btn').addEventListener('click', () => {
    const rainfall = parseFloat(document.getElementById('rainfall-input').value);
    if (isNaN(rainfall)) {
        alert('Please enter a valid rainfall value.');
        return;
    }
    predictFlood(rainfall);
});

// ==================== Generic Prediction Fetch Function ====================

async function fetchPrediction(url, displayFunction, resultDivId) {
    const predictionDiv = document.getElementById(resultDivId);
    predictionDiv.innerText = 'Loading...'; // Loading indicator

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error fetching data: ${errorData.message}`);
        }
        const data = await response.json();
        displayFunction(data, predictionDiv);
    } catch (error) {
        predictionDiv.innerText = error.message;
    }
}

// ==================== Earthquake Prediction ====================

function displayEarthquakePrediction(data, predictionDiv) {
    predictionDiv.innerHTML = `
        <strong>Earthquake Probability:</strong> ${data.probability}%<br>
        <strong>Advice:</strong> ${data.advice}
    `;
}

// Event listener for Earthquake Prediction button
document.getElementById('get-earthquake-btn').addEventListener('click', () => {
    fetchPrediction('https://earthquake.usgs.gov/fdsnws/event/1/application.json', displayEarthquakePrediction, 'earthquake-prediction-result');
});

// ==================== Tsunami Prediction ====================

function displayTsunamiPrediction(data, predictionDiv) {
    predictionDiv.innerHTML = `
        <strong>Tsunami Risk Level:</strong> ${data.riskLevel}<br>
        <strong>Advice:</strong> ${data.advice}
    `;
}

// Event listener for Tsunami Prediction button
document.getElementById('get-tsunami-btn').addEventListener('click', () => {
    fetchPrediction('https://api.example.com/tsunami-prediction', displayTsunamiPrediction, 'tsunami-prediction-result');
});

// ==================== Tornado Prediction ====================

function displayTornadoPrediction(data, predictionDiv) {
    predictionDiv.innerHTML = `
        <strong>Tornado Probability:</strong> ${data.probability}%<br>
        <strong>Advice:</strong> ${data.advice}
    `;
}

// Event listener for Tornado Prediction button
document.getElementById('get-tornado-btn').addEventListener('click', () => {
    fetchPrediction('https://api.example.com/tornado-prediction', displayTornadoPrediction, 'tornado-prediction-result');
});

// Optional: Pre-train the model on page load
// Uncomment the line below if you want to train the model as soon as the page loads
// trainModel();
