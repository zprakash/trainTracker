<template>
    <IonPage>
        <IonContent class="ion-padding">
            <div id="map-container">
                <div id="map"></div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script>
import { defineComponent, onMounted, onUnmounted, ref, nextTick } from "vue";
import { IonContent, IonPage } from "@ionic/vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/leaflet.markercluster.js";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { fetchTrainLocations } from "@/services/trainService";

import { createCustomTrainIcon, createCustomClusterIcon } from "@/utils/mapIcons";

export default defineComponent({
   name: "TrainMap",
   setup() {
       const map = ref(null);
       const markersLayer = ref(null);
       const markerMap = new Map();
       let fetchInterval = null;

       const updateMap = (trainLocations) => {
           if (!map.value || !markersLayer.value) return;
           markersLayer.value.clearLayers();

           trainLocations.forEach((train) => {
               if (train.trainLocations?.length >= 1) {
                   const latestLocation = train.trainLocations[0];
                   const lat = latestLocation.location[1];
                   const lng = latestLocation.location[0];

                   const trainName = `${train.trainType.name}${train.trainNumber}`;
                   const customIcon = createCustomTrainIcon(trainName);

                   const marker = L.marker([lat, lng], { icon: customIcon })
                       .bindPopup(`<b>Train ${trainName}</b><br>Speed: ${latestLocation.speed} km/h`)
                       .on("click", (e) => e.target.openPopup());

                   markersLayer.value.addLayer(marker);
               }
           });
       };

       const fetchLoop = async () => {
           const trainLocations = await fetchTrainLocations();
           updateMap(trainLocations);
       };

       onMounted(async () => {
           await nextTick();
           map.value = L.map("map", {
               center: [64.9631, 25.7260],
               zoom: 6,
               minZoom: 6,
               maxZoom: 16,
           });

           L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
               attribution: "&copy; OpenStreetMap contributors",
           }).addTo(map.value);

           markersLayer.value = L.markerClusterGroup({
                iconCreateFunction: createCustomClusterIcon,
            });
           map.value.addLayer(markersLayer.value);

           setTimeout(() => {
               map.value.invalidateSize();
           }, 10);

           fetchLoop();

           fetchInterval = setInterval(() => {
               fetchLoop();
           }, 150000);
       });

       onUnmounted(() => {
           if (map.value) {
               map.value.remove();
           }
           if (fetchInterval) {
               clearInterval(fetchInterval);
           }
       });

       return { map };
   },
});
</script>

<style scoped>
#map-container {
   position: relative;
   height: 100vh;
}

#map {
   height: 100%;
   width: 100%;
   filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}
</style>
