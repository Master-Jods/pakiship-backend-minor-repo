import { DropOffPointsService } from "./drop-off-points.service";
export declare class DropOffPointsController {
    private readonly dropOffPointsService;
    constructor(dropOffPointsService: DropOffPointsService);
    listNearby(query?: string): {
        points: {
            id: string;
            name: string;
            address: string;
            distance: string;
            status: "Open" | "Busy";
            capacity: "High" | "Medium";
            latitude: number;
            longitude: number;
            landmark: string;
        }[];
        meta: {
            source: string;
            placeholderMapProvider: string;
        };
    };
}
