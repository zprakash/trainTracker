<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>Finnish Train Tracker</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showInfo">
              <ion-icon slot="icon-only" :icon="informationCircleOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      
      <ion-content :fullscreen="true">
        <TrainMap />
      </ion-content>
    </ion-page>
  </template>
  
  <script setup>
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons } from '@ionic/vue';
  import { informationCircleOutline } from 'ionicons/icons';
  import TrainMap from '../component/TrainMap.vue';
  
  const showInfo = () => {
    console.log('Show info about the app');
  };
  </script>
  