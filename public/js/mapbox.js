/*eslint-diasble*/

const locations = JSON.parse(document.getElementById('map').dataset.locations);
// console.log(JSON.parse(locations));

mapboxgl.accessToken =
    'pk.eyJ1IjoidGh1eWR1b25nOTAiLCJhIjoiY2thNjJzdTFpMDJ6dDJxb2hib3l3Z2FtcCJ9.7amqRkEXFZbhNqh5NR2NBw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    scrollZoom: false
        // center: [-118.249037, 34.070702],
        // zoom: 7
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
    //Create marker
    const el = document.createElement('div');
    el.className = 'marker';
    // Add marker
    new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
        .setLngLat(loc.coordinates)
        .addTo(map);
    new mapboxgl.Popup({
            offset: 30
        })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description} </p>`)
        .addTo(map);
    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
    padding: {
        top: 200,
        right: 100,
        bottom: 150,
        left: 100
    }
});