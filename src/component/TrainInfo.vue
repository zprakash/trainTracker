<template>
        <IonPage v-if="selectedTrain" class="train-info-sidebar">
            <IonContent>
                <IonHeader class="ion-no-border">
                    <IonToolbar color="dark">
                        <IonButtons slot="start">
                            <IonButton @click="$emit('close')" class="back-button">
                                <IonIcon :icon="arrowBackOutline" slot="icon-only" />
                                Back
                            </IonButton>
                        </IonButtons>
                        <div class="train-info-title">Train Info</div>
                        <IonButtons slot="end">
                            <IonButton @click="$emit('close')" class="close-button">
                                <IonIcon :icon="closeOutline" slot="icon-only" />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <div class="train-info-header">
                    <div class="train-info-inputs">
                        <div class="input-box">
                            <label class="input-label">Train Number </label>
                            <span style="font-family: sans-serif; font-size: 1.4rem;">{{ selectedTrain.trainType.name }} {{ selectedTrain.trainNumber }}</span>
                        </div>
                        <div class="input-box">
                            <label class="input-label">Date: </label>
                            <span style="font-family: sans-serif; font-size: 1.4rem;">{{ selectedTrain.departureDate }}</span>
                        </div>
                    </div>
                    <p class="route"> {{ selectedTrain.timeTableRows[0]?.station.name }} - {{
                        selectedTrain.timeTableRows[selectedTrain.timeTableRows.length - 1]?.station.name }}</p>
                    <p id="speed-info">
                        <strong>Speed:</strong> {{ selectedTrain.trainLocations[0]?.speed }} km/h,
                        <span :class="currentStation.differenceInMinutes >= 0 ? 'on-time' : 'late'">
                         {{ currentStation.differenceInMinutes >= 0 ? 'On time' : 'Late' }}
                         {{ currentStation.differenceInMinutes }} min
                        </span>
                    </p>

                <div v-if="nextStation" class="next-station-info">
                    <span class="next-station-label">Next Station: </span>
                    <span class="next-station-name">{{ nextStation.station.name }}</span>
                </div>
            </div>

            <div class="train-stops">
                <div v-for="(stop, index) in groupedStops" :key="index" class="stop" :style="{ height: stopHeight }"
                    :class="{
                        'passed': stop.hasArrived,
                        'next-station': stop.isNextStation
                    }">
                    <div class="stop-info">
                        <p>{{ stop.station.name }}</p>
                        <p>
                            <span v-if="index === 0 && stop.scheduledDeparture">
                                {{ formatTime(stop.scheduledDeparture) }} (Departure)
                            </span>

                            <span v-if="index !== 0 && index !== groupedStops.length - 1">
                                <span v-if="stop.actualArrival && stop.actualDeparture">
                                    {{ formatTime(stop.actualArrival) }} (Arrival) -
                                    {{ formatTime(stop.actualDeparture) }} (Departure)
                                </span>
                                <span v-else>
                                    {{ formatTime(stop.scheduledArrival) }} (Scheduled Arrival) -
                                    {{ formatTime(stop.scheduledDeparture) }} (Scheduled Departure)
                                </span>
                            </span>

                            <span v-if="index === groupedStops.length - 1">
                                <span v-if="stop.actualArrival">
                                    {{ formatTime(stop.actualArrival) }} (Arrival)
                                </span>
                                <span v-else>
                                    {{ formatTime(stop.scheduledArrival) }} (Scheduled Arrival)
                                </span>
                            </span>
                        </p>
                    </div>
                    <p class="track">Track {{ stop.commercialTrack || 'N/A' }}</p>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script>
import { defineComponent, computed } from "vue";
import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon
} from "@ionic/vue";
import { closeOutline, arrowBackOutline } from "ionicons/icons";

export default defineComponent({
    name: "TrainInfoSidebar",
    components: {
        IonPage,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonIcon,
    },
    props: {
        selectedTrain: Object,
        required: true,
    },
    emits: ["close"],

    setup(props) {
        console.log("Selected train:", props.selectedTrain);
        return { closeOutline, arrowBackOutline };
    },
    computed: {

        stopHeight() {
            if (!this.groupedStops || this.groupedStops.length === 0) return 'auto';
            return `${100 / this.groupedStops.length}%`;
        },

        groupedStops() {
            if (!this.selectedTrain?.timeTableRows) return [];
            
            const stops = [];
            const rows = this.selectedTrain.timeTableRows;
            const rowsLength = rows.length;

            if (rows[0]?.type === 'DEPARTURE') {
                const firstStop = rows[0];
                stops.push({
                    station: firstStop.station,
                    scheduledArrival: null,
                    actualArrival: null,
                    scheduledDeparture: firstStop.scheduledTime,
                    actualDeparture: firstStop.actualTime,
                    differenceInMinutes: firstStop.differenceInMinutes,
                    commercialTrack: firstStop.commercialTrack,
                    hasArrived: firstStop.actualTime !== null,
                    isNextStation: false,
                    isLastPassed: false
                });
            }

            for (let i = 1; i < rowsLength - 1; i++) {
                const row = rows[i];
                const nextRow = rows[i + 1];

                if (row.type === "ARRIVAL" && nextRow?.type === "DEPARTURE") {
                    stops.push({
                        station: row.station,
                        scheduledArrival: row.scheduledTime,
                        actualArrival: row.actualTime,
                        scheduledDeparture: nextRow.scheduledTime,
                        actualDeparture: nextRow.actualTime,
                        differenceInMinutes: nextRow.differenceInMinutes,
                        commercialTrack: row.commercialTrack || nextRow.commercialTrack,
                        hasArrived: row.actualTime !== null,
                        isNextStation: false,
                        isLastPassed: false
                    });
                    i++; 
                }
            }

            const lastStop = rows[rowsLength - 1];
            if (lastStop?.type === 'ARRIVAL') {
                stops.push({
                    station: lastStop.station,
                    scheduledArrival: lastStop.scheduledTime,
                    actualArrival: lastStop.actualTime,
                    differenceInMinutes: lastStop.differenceInMinutes,
                    scheduledDeparture: null,
                    actualDeparture: null,
                    commercialTrack: lastStop.commercialTrack,
                    hasArrived: lastStop.actualTime !== null,
                    isNextStation: false,
                    isLastPassed: false
                });
            }

            const nextStationIndex = stops.findIndex(stop => !stop.hasArrived);
            if (nextStationIndex > 0) {
                stops[nextStationIndex].isNextStation = true;
                stops[nextStationIndex - 1].isLastPassed = true;
            }

            return stops;
        },

        currentStation() {
            const lastPassed = this.groupedStops.find(stop => stop.isLastPassed);
            console.log("Current station:", lastPassed);
            return lastPassed;
        },

        nextStation() {
            const stationnext= this.groupedStops.find(stop => stop.isNextStation);
            console.log("Next station:", stationnext);
            return stationnext;
        }
    },
    methods: {
        formatTime(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    },
    mounted() {
        console.log("Selected train mounted:", this.selectedTrain);
    },
});
</script>

<style scoped>

ion-content {
    --background: #1e1e1e;
}

ion-toolbar {
    --padding-start: 16px; 
    --padding-end: 16px; 
    --min-height: 56px; 
    border-bottom: 1px solid #333; 
}

ion-toolbar::part(container) {
    position: relative; 
    background: #1e1e1e;
}

.back-button {
    display: flex;
    align-items: center;
    gap: 4px;
    color: white;
    font-size: 0.9rem;
    font-weight: bold;
}

.close-button {
    color: white;
    font-size: 1.2rem;
}

.train-info-sidebar {
    width: 25%;
    background: #1e1e1e;
    color: white;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
    height: 100vh;
    overflow-y: auto;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    padding: 10px;
    padding-top: 4.6rem;
}

.train-info-title {
    font-size: 1.5rem; 
    font-weight: bold; 
    color: white; 
    text-align: center; 
    font-family: "Roboto", sans-serif; 
    margin: 0; 
    padding: 0.5rem 0; 
}

.train-info-header  {
    padding: 20px;
    border-bottom: 1px solid #333;
}

.route {
    font-size: 1.7rem;
    color: #e7e2e2;
    font-weight: bold;
    padding: 3px 0;
}

#speed-info{
    margin: 10px 0;
    font-size: 1.3rem;
    color: #e7e2e2;
    font-weight: bold;
    padding: 3px 0;
}

.train-info-inputs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    
}

.input-box {
    flex: 1;
    padding: 16px;
    border-radius: 4px;
    background: #2e2e2e;
    color: white;
    text-align: center;
    font-weight: bold;
}

.input-label {
    display: block;
    font-size: 0.9rem; 
    color: #e7e2e2;
    margin-bottom: 4px;
    font-size: 1rem;
}

.train-stops {
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 8px;
    justify-content: space-between;
}

.stop {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid #444;
    border-radius: 8px;
    background: #2e2e2e;
}

.stop.passed {
    border-left-color: #18891c;
    border-left-width: 10px;
    border-left-style: solid;
}

.stop.next-station {
    border-left-color: #FFD700;
    border-left-width: 10px;
    border-left-style: solid;
}

.stop-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stop-info p {
    margin: 0;
    color: #e7e2e2 !important;
    font-size: 1.3rem !important;
}

.track {
    font-size: 1rem !important;
    color: #c5c2c2 !important;
}

.on-time {
    color: #4caf50;
    font-weight: bold;
}

.late {
    color: #FFD700;
    font-weight: bold;
}

.back-button {
    display: flex;
    align-items: center;
    gap: 4px;
    color: white;
    font-size: 0.9rem;
}

.close-button {
    color: white;
}

.train-info-sidebar .train-info-header h2 {
    font-size: 1.2rem;
    color: white;
}

.train-info-sidebar .train-stops .stop-info p {
    font-size: 0.85rem;
    color: #ccc;
}

.train-info-sidebar .train-stops .track {
    font-size: 0.8rem;
    color: #888;
}

.next-station-info {
    margin-top: 10px;
    border-radius: 4px;
}

.next-station-label {
    color: #FFD700;
    font-weight: bold;
    font-size: 1.3rem;
}

.next-station-name {
    color: #FFD700;
    font-weight: bold;
    font-size: 1.3rem;
}
</style>
