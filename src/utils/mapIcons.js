import L from "leaflet";

export const createCustomTrainIcon = (trainName,  isHighlighted = false) => {

  const glowEffect = isHighlighted
  ? "0 0 15px 5px red"
  : "none";

  return L.divIcon({
    className: "custom-train-icon",
    html: `
      <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: green; border: 2px solid blue;  box-shadow: ${glowEffect}; transition: all 0.3s ease-in-out;">
          <span style="color: white; font-weight: bold; font-size: 12px;">${trainName}</span>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [30, 30],
  });
};

export const createCustomClusterIcon = (cluster) => {
  const count = cluster.getChildCount();
  const backgroundColor = " #F9E795 "; 

  return L.divIcon({
    html: `
      <div style="position: relative; width: 80px; height: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 50%; background: ${backgroundColor}; border: 8px solid gray; box-shadow: 0 0 5px rgba(0,0,0,0.3);">
          <span style="color: black; font-weight: bold; font-size: 14px;">${count}</span>
          <span style="color: black; font-size: 12px;">trains</span>
      </div>
    `,
    className: "custom-cluster-icon",
    iconSize: [60, 60],
    iconAnchor: [24, 24],
  });
};
