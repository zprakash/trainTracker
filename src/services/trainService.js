
let isFetching = false;

export const fetchTrainLocations = async () => {
    if (isFetching) return [];
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
        console.log(`API Response Time: ${Date.now() - startTime}ms`);
        return data.data.currentlyRunningTrains;
    } catch (error) {
        console.error("Error fetching train locations:", error);
        return [];
    } finally {
        isFetching = false;
    }
};
