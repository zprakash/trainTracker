<template>
    <IonHeader>
      <IonToolbar  class="navbar-toolbar">
        <IonTitle class="navbar-title">Train Tracker</IonTitle>
      </IonToolbar>
    </IonHeader>
  </template>
  
  <script>
  import { defineComponent } from "vue";
  import { IonHeader, IonToolbar, IonTitle } from "@ionic/vue";
  
  export default defineComponent({
    name: "Navbar",
    components: {
      IonHeader,
      IonToolbar,
      IonTitle,
    },
  });
  </script>
  
  <style scoped>
  .navbar-toolbar {
    background-color: #1e1e2f; 
    border-bottom: 1px solid #444; 
  }
  
  .navbar-title {
    font-family: "Roboto", sans-serif; 
    font-size: 1.5rem; 
    font-weight: bold;
    text-align: center;
  }

  .navbar-title.light {
    color: white;
  }

  .navbar-title.dark {
    color: black;
  }

  .navbar-toolbar::after {
    content: "";
    display: block;
    height: 2px;
    background: linear-gradient(to right, #ff7e5f, #feb47b); 
  }
  </style>
