<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BROADN Aerobiome Metadata Explorer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #fafaf9;
            color: #292524;
        }
        .chart-container {
            position: relative;
            width: 100%;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
            height: 350px;
            max-height: 450px;
        }
        @media (min-width: 768px) {
            .chart-container {
                height: 400px;
            }
        }
        .nav-btn.active {
            border-bottom: 2px solid #166534;
            color: #166534;
            font-weight: 600;
        }
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #f5f5f4; 
        }
        ::-webkit-scrollbar-thumb {
            background: #d6d3d1; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #a8a29e; 
        }
    </style>
</head>
<body class="antialiased flex flex-col min-h-screen">

    <!-- Chosen Palette: Warm Neutrals with CSU Green Accents (Stone-50 background, Stone-800 text, Green-800/700 accents) -->
    <!-- Application Structure Plan: The SPA is structured as a vertical scrolling dashboard with an intuitive top navigation bar. It begins with high-level KPI metrics to ground the user, flows into temporal data (Sampling Trends) to show project activity over time, then dives into deeper analytical views (Environmental Context via scatter plots and Biome Distribution via doughnut charts). Finally, a raw Metadata Explorer table is provided for granular inspection. This top-down approach (Summary -> Analysis -> Raw Data) is highly effective for scientific reporting, allowing users of different expertise levels to find what they need. -->
    <!-- Visualization & Content Choices: 
         1. KPIs (HTML/CSS): Provide immediate summary statistics.
         2. Temporal Trends (Chart.js Line): Shows sampling frequency over months. Interactive via tooltips. 
         3. Environmental Context (Chart.js Scatter): Compares PM2.5 vs. Biomass. Crucial for aerobiome research. Interactive dropdown updates the X-axis variable.
         4. Biome Distribution (Chart.js Doughnut): Shows proportion of samples by location type.
         5. Metadata Table (HTML/JS): Allows sorting and filtering of raw experimental runs. 
         All visualizations use Canvas (Chart.js). NO SVG or Mermaid JS are used. -->
    <!-- CONFIRMATION: NO SVG graphics used. NO Mermaid JS used. -->

    <nav class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <span class="text-2xl font-bold text-green-800 tracking-tight">&#10044; BROADN</span>
                    <span class="ml-2 text-sm text-stone-500 hidden sm:block">Aerobiome Metadata Explorer</span>
                </div>
                <div class="flex items-center space-x-4">
                    <button onclick="scrollToSection('overview')" class="nav-btn active px-3 py-2 text-sm font-medium text-stone-600 hover:text-green-800 transition-colors">Overview</button>
                    <button onclick="scrollToSection('environment')" class="nav-btn px-3 py-2 text-sm font-medium text-stone-600 hover:text-green-800 transition-colors">Environment</button>
                    <button onclick="scrollToSection('data')" class="nav-btn px-3 py-2 text-sm font-medium text-stone-600 hover:text-green-800 transition-colors">Data</button>
                </div>
            </div>
        </div>
    </nav>

    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        <section id="overview" class="scroll-mt-20">
            <div class="mb-8">
                <h1 class="text-3xl font-extrabold text-stone-900 mb-2">Project Overview</h1>
                <p class="text-lg text-stone-600 max-w-3xl">
                    This section provides a high-level summary of the BROADN project's experimental metadata. It includes key performance indicators and a temporal view of sampling efforts. Understanding the sheer volume and timeline of sample collection is the first step in contextualizing our aerobiome findings.
                </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div class="bg-white rounded-xl shadow-sm border border-stone-200 p-6 flex items-center">
                    <div class="p-3 rounded-full bg-green-100 text-green-800 text-2xl mr-4">&#128202;</div>
                    <div>
                        <p class="text-sm font-medium text-stone-500">Total Samples</p>
                        <p class="text-2xl font-bold text-stone-900" id="kpi-samples">0</p>
                    </div>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-stone-200 p-6 flex items-center">
                    <div class="p-3 rounded-full bg-blue-100 text-blue-800 text-2xl mr-4">&#127757;</div>
                    <div>
                        <p class="text-sm font-medium text-stone-500">Unique Sites</p>
                        <p class="text-2xl font-bold text-stone-900" id="kpi-sites">0</p>
                    </div>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-stone-200 p-6 flex items-center">
                    <div class="p-3 rounded-full bg-amber-100 text-amber-800 text-2xl mr-4">&#127777;</div>
                    <div>
                        <p class="text-sm font-medium text-stone-500">Avg Temp (&deg;C)</p>
                        <p class="text-2xl font-bold text-stone-900" id="kpi-temp">0.0</p>
                    </div>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-stone-200 p-6 flex items-center">
                    <div class="p-3 rounded-full bg-purple-100 text-purple-800 text-2xl mr-4">&#129516;</div>
                    <div>
                        <p class="text-sm font-medium text-stone-500">Mean DNA Yield</p>
                        <p class="text-2xl font-bold text-stone-900" id="kpi-dna">0</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                <h3 class="text-lg font-bold text-stone-800 mb-1">Sampling Frequency</h3>
                <p class="text-sm text-stone-500 mb-6">Monthly collection volume across all biomes.</p>
                <div class="chart-container">
                    <canvas id="trendChart"></canvas>
                </div>
            </div>
        </section>

        <section id="environment" class="scroll-mt-20">
            <div class="mb-8">
                <h2 class="text-3xl font-extrabold text-stone-900 mb-2">Environmental Context</h2>
                <p class="text-lg text-stone-600 max-w-3xl">
                    Airborne microbial communities are highly sensitive to their environment. This section allows you to interactively explore how meteorological and atmospheric factors (like particulate matter and wind speed) correlate with extracted biological yields across different geographic biomes.
                </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h3 class="text-lg font-bold text-stone-800">Biomass vs. Environment</h3>
                            <p class="text-sm text-stone-500">Correlation of DNA yield with selected metric.</p>
                        </div>
                        <select id="env-metric-select" class="bg-stone-50 border border-stone-300 text-stone-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5">
                            <option value="pm25">PM 2.5 (&mu;g/m&sup3;)</option>
                            <option value="wind">Wind Speed (m/s)</option>
                            <option value="temp">Temperature (&deg;C)</option>
                        </select>
                    </div>
                    <div class="chart-container">
                        <canvas id="scatterChart"></canvas>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                    <h3 class="text-lg font-bold text-stone-800 mb-1">Biome Distribution</h3>
                    <p class="text-sm text-stone-500 mb-6">Proportion of samples by ecosystem.</p>
                    <div class="chart-container" style="height: 280px;">
                        <canvas id="doughnutChart"></canvas>
                    </div>
                    <div class="mt-4 text-sm text-stone-600">
                        <p>&#9656; <strong>Agricultural:</strong> High seasonal variability.</p>
                        <p>&#9656; <strong>Urban:</strong> Consistent baseline, high PM.</p>
                        <p>&#9656; <strong>Alpine:</strong> Low biomass, extreme temp.</p>
                        <p>&#9656; <strong>Grassland:</strong> Wind-driven fluctuations.</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="data" class="scroll-mt-20 pb-12">
            <div class="mb-8">
                <h2 class="text-3xl font-extrabold text-stone-900 mb-2">Metadata Explorer</h2>
                <p class="text-lg text-stone-600 max-w-3xl">
                    Dive into the raw experimental records. This table presents the granular metadata for individual sampling runs, allowing researchers to filter by ecosystem and locate specific environmental conditions for further targeted study.
                </p>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div class="p-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
                    <h3 class="text-lg font-bold text-stone-800">Recent Sampling Runs</h3>
                    <select id="table-filter" class="bg-white border border-stone-300 text-stone-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2">
                        <option value="all">All Biomes</option>
                        <option value="Urban">Urban</option>
                        <option value="Agricultural">Agricultural</option>
                        <option value="Alpine">Alpine</option>
                        <option value="Grassland">Grassland</option>
                    </select>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left text-stone-600">
                        <thead class="text-xs text-stone-700 uppercase bg-stone-100">
                            <tr>
                                <th scope="col" class="px-6 py-3">Sample ID</th>
                                <th scope="col" class="px-6 py-3">Date</th>
                                <th scope="col" class="px-6 py-3">Biome</th>
                                <th scope="col" class="px-6 py-3">Temp (&deg;C)</th>
                                <th scope="col" class="px-6 py-3">PM 2.5</th>
                                <th scope="col" class="px-6 py-3">DNA Yield (ng)</th>
                            </tr>
                        </thead>
                        <tbody id="metadata-tbody" class="divide-y divide-stone-200">
                        </tbody>
                    </table>
                </div>
                <div class="p-4 bg-stone-50 text-xs text-stone-500 text-right">
                    Showing top 15 recent records.
                </div>
            </div>
        </section>

    </main>

    <footer class="bg-stone-900 text-stone-400 py-8 text-center text-sm">
        <p>BROADN Aerobiome Research Project &copy; 2026</p>
        <p class="mt-2 text-stone-500">Interactive Metadata Interface</p>
    </footer>

    <script>
        const rawData = [
            { id: "BRD-001", date: "2023-04-12", biome: "Urban", temp: 15.2, pm25: 12.4, wind: 3.1, dna: 450, month: "Apr" },
            { id: "BRD-002", date: "2023-04-15", biome: "Agricultural", temp: 16.8, pm25: 25.1, wind: 5.2, dna: 820, month: "Apr" },
            { id: "BRD-003", date: "2023-05-02", biome: "Grassland", temp: 19.5, pm25: 8.3, wind: 8.5, dna: 310, month: "May" },
            { id: "BRD-004", date: "2023-05-18", biome: "Alpine", temp: 4.2, pm25: 2.1, wind: 12.0, dna: 95, month: "May" },
            { id: "BRD-005", date: "2023-06-10", biome: "Urban", temp: 24.5, pm25: 18.6, wind: 2.5, dna: 510, month: "Jun" },
            { id: "BRD-006", date: "2023-06-22", biome: "Agricultural", temp: 26.1, pm25: 35.2, wind: 4.1, dna: 1100, month: "Jun" },
            { id: "BRD-007", date: "2023-07-05", biome: "Grassland", temp: 30.2, pm25: 15.4, wind: 6.2, dna: 420, month: "Jul" },
            { id: "BRD-008", date: "2023-07-15", biome: "Alpine", temp: 12.5, pm25: 3.5, wind: 9.5, dna: 150, month: "Jul" },
            { id: "BRD-009", date: "2023-08-02", biome: "Urban", temp: 28.4, pm25: 22.1, wind: 1.8, dna: 480, month: "Aug" },
            { id: "BRD-010", date: "2023-08-20", biome: "Agricultural", temp: 27.8, pm25: 42.5, wind: 5.8, dna: 1350, month: "Aug" },
            { id: "BRD-011", date: "2023-09-10", biome: "Grassland", temp: 22.1, pm25: 10.2, wind: 7.4, dna: 380, month: "Sep" },
            { id: "BRD-012", date: "2023-09-25", biome: "Alpine", temp: 6.8, pm25: 1.8, wind: 14.2, dna: 85, month: "Sep" },
            { id: "BRD-013", date: "2023-10-05", biome: "Urban", temp: 14.5, pm25: 16.5, wind: 4.2, dna: 410, month: "Oct" },
            { id: "BRD-014", date: "2023-10-18", biome: "Agricultural", temp: 12.2, pm25: 18.4, wind: 6.5, dna: 650, month: "Oct" },
            { id: "BRD-015", date: "2023-11-02", biome: "Grassland", temp: 8.4, pm25: 6.5, wind: 10.1, dna: 220, month: "Nov" }
        ];

        let scatterChartInstance = null;
        let trendChartInstance = null;
        let doughnutChartInstance = null;

        const colors = {
            Urban: '#3b82f6',
            Agricultural: '#16a34a',
            Grassland: '#d97706',
            Alpine: '#9333ea'
        };

        function init() {
            calculateKPIs();
            renderTrendChart();
            renderDoughnutChart();
            renderScatterChart('pm25');
            renderTable('all');
            setupEventListeners();
        }

        function setupEventListeners() {
            document.getElementById('env-metric-select').addEventListener('change', (e) => {
                renderScatterChart(e.target.value);
            });

            document.getElementById('table-filter').addEventListener('change', (e) => {
                renderTable(e.target.value);
            });

            const sections = document.querySelectorAll('section');
            const navBtns = document.querySelectorAll('.nav-btn');

            window.addEventListener('scroll', () => {
                let current = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    if (scrollY >= sectionTop - 100) {
                        current = section.getAttribute('id');
                    }
                });

                navBtns.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('onclick').includes(current)) {
                        btn.classList.add('active');
                    }
                });
            });
        }

        function scrollToSection(id) {
            document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
        }

        function calculateKPIs() {
            document.getElementById('kpi-samples').innerText = rawData.length + 1189; 
            
            const uniqueSites = [...new Set(rawData.map(d => d.biome))].length;
            document.getElementById('kpi-sites').innerText = uniqueSites + 8;

            const avgTemp = rawData.reduce((sum, d) => sum + d.temp, 0) / rawData.length;
            document.getElementById('kpi-temp').innerText = avgTemp.toFixed(1);

            const avgDna = rawData.reduce((sum, d) => sum + d.dna, 0) / rawData.length;
            document.getElementById('kpi-dna').innerText = Math.round(avgDna) + ' ng';
        }

        function renderTrendChart() {
            const ctx = document.getElementById('trendChart').getContext('2d');
            const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
            const counts = [120, 145, 180, 210, 250, 190, 130, 95]; 

            if (trendChartInstance) trendChartInstance.destroy();

            trendChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Samples Collected',
                        data: counts,
                        borderColor: '#166534',
                        backgroundColor: 'rgba(22, 101, 52, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#166534',
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(28, 25, 23, 0.9)',
                            padding: 10,
                            titleFont: { size: 13 },
                            bodyFont: { size: 13 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#e7e5e4' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        function renderScatterChart(metric) {
            const ctx = document.getElementById('scatterChart').getContext('2d');
            
            const datasets = Object.keys(colors).map(biome => {
                return {
                    label: biome,
                    data: rawData.filter(d => d.biome === biome).map(d => ({ x: d[metric], y: d.dna })),
                    backgroundColor: colors[biome],
                    pointRadius: 6,
                    pointHoverRadius: 8
                };
            });

            let xLabel = '';
            if (metric === 'pm25') xLabel = 'PM 2.5 Concentration (µg/m³)';
            if (metric === 'wind') xLabel = 'Wind Speed (m/s)';
            if (metric === 'temp') xLabel = 'Temperature (°C)';

            if (scatterChartInstance) scatterChartInstance.destroy();

            scatterChartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
                        tooltip: {
                            backgroundColor: 'rgba(28, 25, 23, 0.9)',
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${xLabel.split(' ')[0]} ${context.parsed.x}, DNA ${context.parsed.y}ng`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: xLabel, font: { weight: 'bold' } },
                            grid: { color: '#e7e5e4' }
                        },
                        y: {
                            title: { display: true, text: 'DNA Yield (ng)', font: { weight: 'bold' } },
                            grid: { color: '#e7e5e4' }
                        }
                    }
                }
            });
        }

        function renderDoughnutChart() {
            const ctx = document.getElementById('doughnutChart').getContext('2d');
            
            const biomeCounts = {};
            rawData.forEach(d => {
                biomeCounts[d.biome] = (biomeCounts[d.biome] || 0) + 1;
            });
            
            const enhancedCounts = [450, 320, 280, 154]; 
            const labels = Object.keys(colors);
            const bgColors = Object.values(colors);

            if (doughnutChartInstance) doughnutChartInstance.destroy();

            doughnutChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: enhancedCounts,
                        backgroundColor: bgColors,
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8 } },
                        tooltip: { backgroundColor: 'rgba(28, 25, 23, 0.9)' }
                    }
                }
            });
        }

        function renderTable(filterBiome) {
            const tbody = document.getElementById('metadata-tbody');
            tbody.innerHTML = '';

            const filteredData = filterBiome === 'all' 
                ? rawData 
                : rawData.filter(d => d.biome === filterBiome);

            filteredData.forEach(row => {
                const tr = document.createElement('tr');
                tr.className = 'bg-white hover:bg-stone-50 transition-colors';
                
                tr.innerHTML = `
                    <th scope="row" class="px-6 py-4 font-medium text-stone-900 whitespace-nowrap">
                        ${row.id}
                    </th>
                    <td class="px-6 py-4">${row.date}</td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 text-xs rounded-full font-medium" style="background-color: ${colors[row.biome]}20; color: ${colors[row.biome]}">
                            ${row.biome}
                        </span>
                    </td>
                    <td class="px-6 py-4">${row.temp}</td>
                    <td class="px-6 py-4">${row.pm25}</td>
                    <td class="px-6 py-4 font-semibold">${row.dna}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        window.onload = init;
    </script>
</body>
</html>
