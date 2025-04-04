<template>
    <div ref="popupRef" class="popup-container">
      <button class="close-button" @click="closePopup">×</button>
      <h2><strong>Welcome to Live Train Tracker</strong></h2>
      <p>
        These are the live train locations based on Digitraffic data. You can search for the train using the train number or just click the train to see the detailed information about the train.
      </p>
      <p>
        Train location updates every 15 seconds and train info updates every 45 seconds.
      </p>
      <p>
        If there is something wrong, then the issue might be related to data not being updated properly. Reload or wait a few minutes!
      </p>
      <p>Happy train tracking!</p>
    </div>
  </template>
  
  <script>
  import { onMounted, onUnmounted, ref } from 'vue';
  
  export default {
    name: 'WelcomePopup',
    emits: ['close'],
    setup(_, { emit }) {
      const popupRef = ref(null);
  
      const handleClickOutside = (event) => {
        if (popupRef.value && !popupRef.value.contains(event.target)) {
          emit('close');
        }
      };
  
      onMounted(() => {
        document.addEventListener('click', handleClickOutside);
      });
  
      onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside);
      });
  
      const closePopup = () => {
        emit('close');
      };
  
      return { popupRef, closePopup };
    }
  };
  </script>
  
  <style scoped>
  .popup-container {
    position: absolute;
    top: 5rem;
    left: 1.4rem;
    width: 400px;
    background: #1e1e1e;
    color: white;
    padding: 30px;
    z-index: 9999;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    border-radius: 12px;
    font-family: sans-serif;
    pointer-events: auto;
  }
  
  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
  }
  
  .close-button:hover {
    color: #ccc;
  }
  
  p {
    font-size: 1.3rem;
    margin-bottom: 25px;
    line-height: 1.6;
  }
  </style>
  