<template>
    <IonPage>
        <IonContent class="ion-padding">
            <div id="map-container">
                <TrainInfo v-if="selectedTrain" :selectedTrain="selectedTrain" @close="selectedTrain = null" />
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
import { fetchTrainInfo } from "@/services/trainInfoService";

import { createCustomTrainIcon, createCustomClusterIcon } from "@/utils/mapIcons";
import TrainInfo from "@/component/TrainInfo.vue";

export default defineComponent({
   name: "TrainMap",
    components: {
         IonContent,
         IonPage,
         TrainInfo,
    },
   setup() {
       const map = ref(null);
       const markersLayer = ref(null);
       const markerMap = new Map();
       const selectedTrain = ref(null);
       const selectedMarker = ref(null);
       const selectedTrainId = ref(null);
       let fetchInterval = null;

       const fetchTrainDetails = async (trainNumber) => {
           const today = new Date().toISOString().split("T")[0]; 
           const trainInfo = await fetchTrainInfo(trainNumber, today);
           selectedTrain.value = trainInfo[0]; 
       };

       const updateMap = (trainLocations) => {
           if (!map.value || !markersLayer.value) return;
           markersLayer.value.clearLayers();

           trainLocations.forEach((train) => {
               if (train.trainLocations?.length >= 1) {
                   const latestLocation = train.trainLocations[0];
                   const lat = latestLocation.location[1];
                   const lng = latestLocation.location[0];

                   const trainName = `${train.trainType.name}${train.trainNumber}`;
                   const isHighlighted = selectedTrainId.value === train.trainNumber; 
                   const trainIcon = createCustomTrainIcon(trainName, isHighlighted);

                   const marker = L.marker([lat, lng], { icon: trainIcon  })
                       .on("click", async () => {
                           
                        selectedTrainId.value = train.trainNumber;
                        console.log("Selected train ID:", selectedTrainId.value);
                        console.log("Selected train number:", train.trainNumber);
                        await fetchTrainDetails(train.trainNumber);

                           if (selectedMarker.value) {
                               selectedMarker.value.setIcon(createCustomTrainIcon(selectedMarker.value.trainName));
                           }

                           selectedMarker.value = marker;
                           marker.setIcon(createCustomTrainIcon(trainName, true));


                           if (map.value) {
                               map.value.flyTo([lat, lng], 16, {
                                   animate: true,
                                   duration: 1.5,
                               });
                           }
                     });

                   markersLayer.value.addLayer(marker);

                   if (isHighlighted) {
                       selectedMarker.value = marker; 
                       marker.setIcon(createCustomTrainIcon(trainName, true));
                       map.value.flyTo([lat, lng], map.value.getZoom(), {
                           animate: true,
                           duration: 1.5,
                       });
                   }

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
               zoom: 4,
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
         }, 15000);
       });

       onUnmounted(() => {
           if (map.value) {
               map.value.remove();
           }
           if (fetchInterval) {
               clearInterval(fetchInterval);
           }
       });

       return { map, selectedTrain };
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
