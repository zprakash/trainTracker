<template>
    <div v-if="selectedTrain" class="train-info-sidebar">
        <IonHeader>
            <IonToolbar>
                <IonButtons slot="start">
                    <IonButton @click="$emit('close')" class="back-button">
                        <IonIcon :icon="arrowBackOutline" />
                        Back
                    </IonButton>
                </IonButtons>
                <IonButtons slot="end">
                    <IonButton @click="$emit('close')" class="close-button">
                        <IonIcon :icon="closeOutline" />
                    </IonButton>
                </IonButtons>
                <IonTitle>
                    <div>The Live Train Map Service</div>
                </IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent>
            <div class="train-info-header">
                <div class="train-info-inputs">
                    <div class="input-box">
                        <span>{{ selectedTrain.trainType.name }} {{ selectedTrain.trainNumber }}</span>
                    </div>
                    <div class="input-box">
                        <span>{{ selectedTrain.departureDate }}</span>
                    </div>
                </div>

                <h2>{{ selectedTrain.trainType.name }} {{ selectedTrain.trainNumber }}</h2>
                <p class="route">From {{ selectedTrain.timeTableRows[0]?.station.name }} to {{
                    selectedTrain.timeTableRows[selectedTrain.timeTableRows.length - 1]?.station.name }}</p>
                <p>
                    <strong>Speed:</strong> {{ selectedTrain.trainLocations[0]?.speed }} km/h,
                    <span class="on-time">on time {{ selectedTrain.timeTableRows[0]?.differenceInMinutes }}
                        min</span>
                </p>
            </div>

            <div class="train-stops">
                <div v-for="(stop, index) in groupedStops" :key="index" class="stop">
                    <div class="stop-info">
                        <p>{{ stop.station.name }}</p>
                        <p>
                            <span v-if="index === 0 && stop.scheduledDeparture">
                                {{ new Date(stop.scheduledDeparture).toLocaleTimeString([], {
                                    hour: '2-digit', minute: '2-digit'
                                }) }} (Departure)
                            </span>

                            <span v-if="index !== 0 && index !== groupedStops.length - 1">
                                <span v-if="stop.actualArrival && stop.actualDeparture">
                                    {{ new Date(stop.actualArrival).toLocaleTimeString([], {
                                        hour: '2-digit', minute:
                                    '2-digit' }) }} (Arrival) -
                                    {{ new Date(stop.actualDeparture).toLocaleTimeString([], {
                                        hour: '2-digit', minute:
                                    '2-digit' }) }} (Departure)
                                </span>
                                <span v-else>
                                    {{ new Date(stop.scheduledArrival).toLocaleTimeString([], {
                                        hour: '2-digit', minute:
                                    '2-digit' }) }} (Scheduled Arrival) -
                                    {{ new Date(stop.scheduledDeparture).toLocaleTimeString([], {
                                        hour: '2-digit',
                                    minute: '2-digit' }) }} (Scheduled Departure)
                                </span>
                            </span>

                            <span v-if="index === groupedStops.length - 1">
                                <span v-if="stop.actualArrival">
                                    {{ new Date(stop.actualArrival).toLocaleTimeString([], {
                                        hour: '2-digit', minute:
                                    '2-digit' }) }} (Arrival)
                                </span>
                                <span v-else>
                                    {{ new Date(stop.scheduledArrival).toLocaleTimeString([], {
                                        hour: '2-digit', minute:
                                    '2-digit' }) }} (Scheduled Arrival)
                                </span>
                            </span>
                        </p>
                    </div>
                    <p class="track">Track {{ stop.commercialTrack || 'N/A' }}</p>
                </div>
            </div>
        </IonContent>
    </div>
</template>


<script>
import { defineComponent } from "vue";
import {
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
    props: {
        selectedTrain: Object,
        required: true,
    },
    emits: ["close"],
    components: {
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonIcon,
    },
    setup(props) {
        console.log("Selected train yyyysydsyd:", props.selectedTrain);
        return { closeOutline, arrowBackOutline };
    },
    computed: {
        groupedStops() {
            const stops = [];

            if (this.selectedTrain.timeTableRows[0]?.type === 'DEPARTURE') {
                const firstStop = this.selectedTrain.timeTableRows[0];
                stops.push({
                    station: firstStop.station,
                    scheduledArrival: null,
                    actualArrival: null,
                    scheduledDeparture: firstStop.scheduledTime,
                    actualDeparture: firstStop.actualTime,
                    commercialTrack: firstStop.commercialTrack
                });
            }

            for (let i = 1; i < this.selectedTrain.timeTableRows.length - 1; i++) {
                const row = this.selectedTrain.timeTableRows[i];

                if (row.type === "ARRIVAL" && this.selectedTrain.timeTableRows[i + 1]?.type === "DEPARTURE") {
                    stops.push({
                        station: row.station,
                        scheduledArrival: row.scheduledTime,
                        actualArrival: row.actualTime,
                        scheduledDeparture: this.selectedTrain.timeTableRows[i + 1].scheduledTime,
                        actualDeparture: this.selectedTrain.timeTableRows[i + 1].actualTime,
                        commercialTrack: row.commercialTrack || this.selectedTrain.timeTableRows[i + 1].commercialTrack
                    });
                    i++;
                }
            }

            const lastStopIndex = this.selectedTrain.timeTableRows.length - 1;
            const lastStop = this.selectedTrain.timeTableRows[lastStopIndex];
            if (lastStop?.type === 'ARRIVAL') {
                stops.push({
                    station: lastStop.station,
                    scheduledArrival: lastStop.scheduledTime,
                    actualArrival: lastStop.actualTime,
                    scheduledDeparture: null,
                    actualDeparture: null,
                    commercialTrack: lastStop.commercialTrack
                });
            }

            return stops;
        }
    },
    methods: {

    },
    mounted() {
        console.log("Selected train mounted:", this.selectedTrain);
    },
});
</script>

<style scoped>
.train-info-sidebar {
    width: 450px;
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
    padding: 16px;
}

.train-info-header {
    padding: 20px;
    border-bottom: 1px solid #333;
}

.train-info-header h2 {
    margin: 8px 0;
    font-size: 1.5rem;
    font-weight: bold;
}

.train-info-header p {
    margin: 4px 0;
    font-size: 0.9rem;
    color: #ccc;
}

.train-info-inputs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.input-box {
    flex: 1;
    padding: 8px;
    border: 1px solid #444;
    border-radius: 4px;
    background: #2e2e2e;
    color: white;
    text-align: center;
    font-weight: bold;
}

.route {
    font-size: 1rem;
    color: #ccc;
    margin: 8px 0;
}

.train-stops {
    padding: 16px;
}

.stop {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border: 1px solid #444;
    border-radius: 8px;
    margin-bottom: 12px;
    background: #2e2e2e;
}

.stop-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stop-info p {
    margin: 0;
    font-size: 0.9rem;
    color: white;
}

.track {
    font-size: 0.8rem;
    color: #aaa;
}

.on-time {
    color: #4caf50;
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
</style>
