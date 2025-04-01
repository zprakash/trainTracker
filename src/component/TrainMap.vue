<template>
    <div id="map" style="height: 100vh;"></div>
</template>

<script>
import { defineComponent, onMounted, onUnmounted, ref, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import imageUrl from '@assets/iocn.svg';

export default defineComponent({
    name: "TrainMap",
    setup() {
        const map = ref(null);
        const trainLocations = ref([]);
        let markersLayer;
        const markerMap = new Map();
        let isFetching = false;

        const fetchTrainLocations = async () => {
            if (isFetching) return;
            isFetching = true;

            const startTime = Date.now();
            try {
                const response = await fetch("https://rata.digitraffic.fi/api/v2/graphql/graphql", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept-Encoding": "gzip"
                    },
                    body: JSON.stringify({
                        operationName: "runningTrains",
                        variables: {},
                        query: `
                    fragment RunningTrain on Train {
                        ...DigitrafficTrainInfo
                        nextTimeTableRow: timeTableRows(
                            where: {and: [{actualTime: {equals: null}}, {trainStopping: {equals: true}}, {cancelled: {equals: false}}]}
                            take: 1
                        ) {
                            differenceInMinutes
                            __typename
                        }
                        __typename
                    }

                    query runningTrains {
                        currentlyRunningTrains(
                            where: {and: [{trainType: {trainCategory: {or: [{name: {equals: "Commuter"}}, {name: {equals: "Long-distance"}}]}}}, {operator: {shortCode: {equals: "vr"}}}, {trainType: {name: {unequals: "MV"}}}, {trainType: {name: {unequals: "HV"}}}]}
                        ) {
                            ...RunningTrain
                            __typename
                        }
                    }

                    fragment DigitrafficTrainInfo on Train {
                        trainNumber
                        commuterLineId: commuterLineid
                        departureDate
                        trainType {
                            name
                            trainCategory {
                                name
                                __typename
                            }
                            __typename
                        }
                        trainLocations(orderBy: {timestamp: DESCENDING}, take: 2) {
                            speed
                            timestamp
                            location
                            __typename
                        }
                        __typename
                    }
                `
                    })
                });
                const data = await response.json();
                trainLocations.value = data.data.currentlyRunningTrains;
                console.log(`API Response Time: ${Date.now() - startTime}ms`);
                updateMap();
            } catch (error) {
                console.error("Error fetching train locations:", error);
            } finally {
                isFetching = false;
            }
        };

        const updateMap = () => {
            if (!map.value) return;

            trainLocations.value.forEach((train) => {
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
                        markersLayer.addLayer(marker);
                        animateMarker(marker, startLat, startLng, endLat, endLng);
                    }
                }
            });
        };

        const animateMarker = (marker, startLat, startLng, endLat, endLng) => {
            let startTime;
            const duration = 15000;

            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);

                const currentLat = startLat + (endLat - startLat) * progress;
                const currentLng = startLng + (endLng - startLng) * progress;

                marker.setLatLng([currentLat, currentLng]);
                if (progress < 1) requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
        };

        const fetchLoop = async () => {
            await fetchTrainLocations();
            setTimeout(fetchLoop, 120000);
        };

        onMounted(async () => {
            await nextTick();
            map.value = L.map("map", {
                center: [60.1695, 24.9354],
                zoom: 6,
                maxZoom: 16,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(map.value);

            markersLayer = L.layerGroup().addTo(map.value);

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

.custom-train-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

</style>
