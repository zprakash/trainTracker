
import L from "leaflet";

export const createTrainMarker = (trainName, imageUrl) => {
    return L.divIcon({
        className: "custom-train-icon",
        html: `<div class="train-marker"><img src="${imageUrl}" alt="Train" /><span>${trainName}</span></div>`,
        iconSize: [180, 80],
        iconAnchor: [40, 40],
    });
};

export const animateMarker = (marker, startLat, startLng, endLat, endLng) => {
    let startTime;
    const duration = 60000;

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
