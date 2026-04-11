type DropOffPoint = {
    id: string;
    name: string;
    address: string;
    distance: string;
    status: "Open" | "Busy";
    capacity: "High" | "Medium";
    latitude: number;
    longitude: number;
    landmark: string;
};
export declare class DropOffPointsService {
    listNearby(query?: string): {
        points: DropOffPoint[];
        meta: {
            source: string;
            placeholderMapProvider: string;
        };
    };
}
export {};
