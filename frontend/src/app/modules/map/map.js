  let mapsss = L.map('map').setView([4.639386,-74.082412],6)
  
  //Agregar tilelAyer mapa base desde openstreetmap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapss);
  
  module.exports = { mapsss }