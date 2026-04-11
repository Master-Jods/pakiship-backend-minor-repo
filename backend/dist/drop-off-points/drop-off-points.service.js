"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropOffPointsService = void 0;
const common_1 = require("@nestjs/common");
const FRASSATI_DROP_OFF_POINTS = [
    {
        id: "frassati-7-eleven",
        name: "7-Eleven Frassati Corner",
        address: "Near Frassati Building, Sampaloc, Manila",
        distance: "120 m",
        status: "Open",
        capacity: "High",
        latitude: 14.6096,
        longitude: 120.9894,
        landmark: "Frassati Building",
    },
    {
        id: "frassati-lawson",
        name: "Lawson Frassati Walk",
        address: "P. Campa St. beside Frassati, Sampaloc, Manila",
        distance: "230 m",
        status: "Open",
        capacity: "Medium",
        latitude: 14.6091,
        longitude: 120.989,
        landmark: "Frassati Building",
    },
    {
        id: "frassati-mini-stop",
        name: "Uncle John's Dapitan",
        address: "Dapitan St. near Frassati, Sampaloc, Manila",
        distance: "350 m",
        status: "Busy",
        capacity: "Medium",
        latitude: 14.6085,
        longitude: 120.9885,
        landmark: "Frassati Building",
    },
];
let DropOffPointsService = class DropOffPointsService {
    listNearby(query) {
        const normalizedQuery = String(query ?? "").trim().toLowerCase();
        const points = normalizedQuery
            ? FRASSATI_DROP_OFF_POINTS.filter((point) => point.name.toLowerCase().includes(normalizedQuery) ||
                point.address.toLowerCase().includes(normalizedQuery) ||
                point.landmark.toLowerCase().includes(normalizedQuery))
            : FRASSATI_DROP_OFF_POINTS;
        return {
            points,
            meta: {
                source: "dummy convenience stores near Frassati",
                placeholderMapProvider: "Google Maps API placeholder",
            },
        };
    }
};
exports.DropOffPointsService = DropOffPointsService;
exports.DropOffPointsService = DropOffPointsService = __decorate([
    (0, common_1.Injectable)()
], DropOffPointsService);
