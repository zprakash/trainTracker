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
                <div v-for="(stop, index) in selectedTrain.timeTableRows" :key="index" class="stop">
                    <div class="stop-info">
                        <p>{{ stop.station.name }}</p> <!-- Fix: Use stop.station.name -->
                        <p>{{ new Date(stop.scheduledTime).toLocaleTimeString() }}</p> <!-- Convert UTC time -->
                    </div>
                    <p class="track">Track {{ stop.commercialTrack }}</p> <!-- Fix: Correct field name -->
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
    methods: {

    },
    mounted() {
        console.log("Selected train mounted:", this.selectedTrain);
    },
});
</script>

<style scoped>
.train-info-sidebar {
    width: 400px;
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
}

.train-info-header {
    padding: 16px;
    border-bottom: 1px solid #333;
}

.train-info-header h2 {
    margin: 8px 0;
    font-size: 1.5rem;
}

.train-info-header p {
    margin: 4px 0;
    font-size: 0.9rem;
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
    padding: 8px 0;
    border-bottom: 1px solid #333;
}

.stop-info p {
    margin: 0;
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
</style>
