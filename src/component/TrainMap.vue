<template>
    <IonPage>
        <NavBar />
        <IonContent class="ion-padding">
            <div id="map-container">
                <WelcomePopup v-if="showWelcome" @close="showWelcome = false" />

                <TrainInfo v-if="selectedTrain" :selectedTrain="selectedTrain" @close="selectedTrain = null" />
                <div class="search-bar-container">
                    <ion-searchbar v-model="searchQuery" @keyup.enter="searchTrain" placeholder="Enter Train Number..."
                        class="custom-search-bar" show-clear-button="always"></ion-searchbar>
                </div>
                <div id="map"></div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script>
import { defineComponent, onMounted, onUnmounted, ref, nextTick } from "vue";
import { IonContent, IonPage, IonSearchbar } from "@ionic/vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/leaflet.markercluster.js";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { fetchTrainLocations } from "@/services/trainService";
import { fetchTrainInfo } from "@/services/trainInfoService";
import WelcomePopup from "./WelcomePopup.vue";

import NavBar from "./NavBar.vue";

import { createCustomTrainIcon, createCustomClusterIcon } from "@/utils/mapIcons";
import TrainInfo from "@/component/TrainInfo.vue";

export default defineComponent({
   name: "TrainMap",
    components: {
         IonContent,
         IonPage,
         TrainInfo,
         NavBar,
         IonSearchbar,
         WelcomePopup 
    },
   setup() {
       const map = ref(null);
       const markersLayer = ref(null);
       const markerMap = new Map();
       const selectedTrain = ref(null);
       const selectedMarker = ref(null);
       const selectedTrainId = ref(null);
       let fetchInterval = null;
       let fetchDetailsInterval = null;

       const searchQuery = ref("");
       const showWelcome = ref(true);

       const searchTrain = async () => {
           const input = searchQuery.value.trim();
           const trainNumber = parseInt(input, 10);

           if (!trainNumber || isNaN(trainNumber)) {
               alert("Please enter a valid train number.");
               return;
           }

           const today = new Date().toISOString().split("T")[0];
           const trainData = await fetchTrainInfo(trainNumber, today);

           if (!trainData || trainData.length === 0) {
               alert("Train not found. Recheck the id!!");
               return;
           }

           const train = trainData[0];
           selectedTrain.value = train;
           selectedTrainId.value = train.trainNumber;

           const trainName = `${train.trainType.name}${train.trainNumber}`;
           const latestLocation = train.trainLocations?.[0];

           if (!latestLocation) {
               alert("No location data for this train");
               return;
           }

           const lat = latestLocation.location[1];
           const lng = latestLocation.location[0];

           const existingMarker = markerMap.get(trainNumber);

           if (existingMarker) {
               if (selectedMarker.value) {
                   selectedMarker.value.setIcon(
                       createCustomTrainIcon(selectedMarker.value.trainName)
                   );
               }

               selectedMarker.value = existingMarker;
               existingMarker.setIcon(createCustomTrainIcon(trainName, true));

               map.value.flyTo([lat, lng], 16.5, {
                   animate: true,
                   duration: 1.5,
               });
           } else {
               alert("Train not found!");
           }
       };

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
                               map.value.flyTo([lat, lng], 16.5, {
                                   animate: true,
                                   duration: 1.5,
                               });
                           }
                     });

                   markerMap.set(train.trainNumber, marker);
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

       const fetchTrainDetailsPeriodically = async () => {
           if (selectedTrainId.value) {
               await fetchTrainDetails(selectedTrainId.value);
           }
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
           }, 20);

           fetchLoop();

         fetchInterval = setInterval(() => {
              fetchLoop();
         }, 15000);

         fetchDetailsInterval = setInterval(() => {
               fetchTrainDetailsPeriodically();
           }, 60000); 
           
       });

       onUnmounted(() => {
           if (map.value) {
               map.value.remove();
           }
           if (fetchInterval) {
               clearInterval(fetchInterval);
           }
       });

       return { map, selectedTrain, searchQuery, selectedTrainId, searchTrain, showWelcome };
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

.search-bar-container {
    position: absolute;
    top: 20px;
    right: 30px;
    z-index: 999;
    width: 300px;
    background-color: transparent;
}

.custom-search-bar {
    --background: #ffffff; 
    --color: #333333; 
    --placeholder-color: #000000;
    --box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    --border-radius: 20px; 
    --padding-start: 15px;
    --padding-end: 15px;
    --height: 50px;
    transition: all 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.custom-search-bar:hover {
    --box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3); 
    --background: #f9f9f9; 
}

.custom-search-bar:focus-within {
    --box-shadow: 0 0 10px 4px rgba(0, 123, 255, 0.5); 
    --background: #ffffff; 
}

</style>
