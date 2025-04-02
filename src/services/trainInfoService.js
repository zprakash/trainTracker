let isFetching = false;

export const fetchTrainInfo = async (trainNumber, departureDate) => {
    if (isFetching) return null;
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
                operationName: "getTrainInfo",
                variables: {
                    trainNumber: trainNumber,
                    departureDate: departureDate
                },
                query: `
                    query getTrainInfo($trainNumber: Int!, $departureDate: Date!) {
                        train(trainNumber: $trainNumber, departureDate: $departureDate) {
                            ...DigitrafficTrainInfo
                            cancelled
                            runningCurrently
                            timetableAcceptanceDate
                            operator {
                                shortCode
                                __typename
                            }
                            timeTableRows(where: {and: [{commercialStop: {equals: true}}]}) {
                                type
                                cancelled
                                trainStopping
                                scheduledTime
                                actualTime
                                differenceInMinutes
                                liveEstimateTime
                                estimateSourceType
                                unknownDelay
                                commercialTrack
                                station {
                                    name
                                    countryCode
                                    location
                                    shortCode
                                    type
                                    __typename
                                }
                                __typename
                            }
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
        return data.data.train;


    } catch (error) {
        console.error("Error fetching train info:", error);
        return null;
    } finally {
        isFetching = false;
    }
};
