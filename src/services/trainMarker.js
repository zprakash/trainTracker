
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
