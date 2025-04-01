<template>
    <div id="map" style="height: 100vh;"></div>
</template>

<script>
import { defineComponent, onMounted, onUnmounted, ref, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchTrainLocations } from "@/services/trainService";
import { animateMarker } from "@/services/trainMarker";
import imageUrl from '@assets/iocn.svg';

export default defineComponent({
    name: "TrainMap",
    setup() {
        const map = ref(null);
        const markersLayer = ref(null);
        const markerMap = new Map();

        const updateMap = (trainLocations) => {
            if (!map.value || !markersLayer.value) return;

            trainLocations.forEach((train) => {
                if (train.trainLocations?.length >= 2) {
                    const latestLocation = train.trainLocations[0];
                    const previousLocation = train.trainLocations[1];
                    const startLat = previousLocation.location[1];
                    const startLng = previousLocation.location[0];
                    const endLat = latestLocation.location[1];
                    const endLng = latestLocation.location[0];

                    const trainName = `${train.trainType.name}${train.trainNumber}`;

                    const customIcon = L.divIcon({
                         className: "custom-train-icon",
                         html: `<div class="train-marker"><img src="${imageUrl}" alt="Train" /><span>${trainName}</span></div>`,
                         iconSize: [180, 80],
                         iconAnchor: [40, 40],
                     });

                    if (markerMap.has(train.trainNumber)) {
                        const marker = markerMap.get(train.trainNumber);
                        animateMarker(marker, startLat, startLng, endLat, endLng);
                    } else {
                        const marker = L.marker([startLat, startLng], { icon: customIcon })
                            .bindPopup(`<b>Train ${trainName}</b><br>Speed: ${latestLocation.speed} km/h`)
                            .on("click", (e) => e.target.openPopup());

                        markerMap.set(train.trainNumber, marker);
                        markersLayer.value.addLayer(marker);
                        animateMarker(marker, startLat, startLng, endLat, endLng);
                    }
                }
            });
        };

        const fetchLoop = async () => {
            const trainLocations = await fetchTrainLocations();
            updateMap(trainLocations);
            setTimeout(fetchLoop, 120000);
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

            markersLayer.value = L.layerGroup().addTo(map.value);

            setTimeout(() => {
                map.value.invalidateSize();
            }, 10);

            fetchLoop();
        });

        onUnmounted(() => {
            if (map.value) {
                map.value.remove();
            }
        });

        return { map };
    },
});
</script>

<style scoped>
#map {
    height: 100vh;
}
</style>
