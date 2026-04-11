"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverBookingsService = void 0;
const common_1 = require("@nestjs/common");
const customer_notifications_service_1 = require("../customer-notifications/customer-notifications.service");
const parcel_drafts_repository_1 = require("../parcel-drafts/parcel-drafts.repository");
function formatDriverBookingRows(rows) {
    return rows.map((row) => ({
        draftId: row.id,
        trackingNumber: row.tracking_number,
        pickupAddress: row.pickup_address,
        deliveryAddress: row.delivery_address,
        senderName: row.sender_name,
        receiverName: row.receiver_name,
        status: row.status,
        serviceId: row.service_id,
        deliveryType: row.delivery_mode,
        isBulk: Boolean(row.is_bulk),
        totalParcels: (row.parcel_draft_items ?? []).reduce((sum, item) => sum + Number(item.quantity ?? 0), 0),
        currentLocation: row.tracking_current_location || row.pickup_address,
        progressLabel: row.tracking_progress_label || "Awaiting driver acceptance",
        progressPercentage: Number(row.tracking_progress_percentage ?? 0),
        assignedDriverId: row.assigned_driver_id,
        assignedDriverName: row.assigned_driver_name,
        dropOffPoint: row.drop_off_point_id
            ? {
                id: row.drop_off_point_id,
                name: row.drop_off_point_name,
                address: row.drop_off_point_address,
            }
            : null,
        distance: row.distance_text,
        duration: row.duration_text,
        updatedAt: row.updated_at,
        createdAt: row.created_at,
    }));
}
let DriverBookingsService = class DriverBookingsService {
    constructor(parcelDraftsRepository, customerNotificationsService) {
        this.parcelDraftsRepository = parcelDraftsRepository;
        this.customerNotificationsService = customerNotificationsService;
    }
    ensureDriver(session) {
        if (session.role !== "driver") {
            throw new common_1.ForbiddenException("Only drivers can access driver booking requests.");
        }
    }
    async listBookingRequests(session, deliveryType, updatedSince) {
        this.ensureDriver(session);
        const normalizedFilter = deliveryType === "relay" || deliveryType === "direct"
            ? deliveryType
            : undefined;
        const parsedUpdatedSince = updatedSince ? new Date(updatedSince) : null;
        if (updatedSince && (!parsedUpdatedSince || Number.isNaN(parsedUpdatedSince.getTime()))) {
            throw new common_1.BadRequestException("updatedSince must be a valid ISO date string.");
        }
        const result = await this.parcelDraftsRepository.listDriverBookingRequests(normalizedFilter, parsedUpdatedSince?.toISOString());
        if (result.error) {
            throw new common_1.InternalServerErrorException("Unable to load driver booking requests.");
        }
        return {
            bookings: formatDriverBookingRows(result.data ?? []),
            meta: {
                deliveryType: normalizedFilter ?? "all",
                updatedSince: parsedUpdatedSince?.toISOString() ?? null,
                realtimeStrategy: "polling-ready",
            },
        };
    }
    async acceptBookingRequest(session, draftId) {
        this.ensureDriver(session);
        const bookingResult = await this.parcelDraftsRepository.findDriverBookingRequestById(draftId);
        if (bookingResult.error || !bookingResult.data) {
            throw new common_1.NotFoundException("Driver booking request not found.");
        }
        const booking = bookingResult.data;
        if (booking.assigned_driver_id && booking.assigned_driver_id !== session.userId) {
            throw new common_1.BadRequestException("This booking has already been accepted by another driver.");
        }
        const trackingLabel = booking.delivery_mode === "relay"
            ? "Relay driver en route to drop-off point"
            : "Driver assigned and preparing pickup";
        const currentLocation = booking.delivery_mode === "relay"
            ? booking.drop_off_point_name || booking.pickup_address || "Drop-off point"
            : booking.pickup_address || "Pickup point";
        const updateResult = await this.parcelDraftsRepository.acceptDriverBookingRequest(draftId, {
            assigned_driver_id: session.userId,
            assigned_driver_name: session.fullName,
            tracking_progress_label: trackingLabel,
            tracking_current_location: currentLocation,
            tracking_progress_percentage: booking.delivery_mode === "relay" ? 45 : 35,
        });
        if (updateResult.error || !updateResult.data) {
            throw new common_1.InternalServerErrorException("Unable to accept booking request.");
        }
        await this.customerNotificationsService.createNotification(booking.user_id, "delivery", "Driver assigned", `${session.fullName} accepted your ${booking.delivery_mode || "delivery"} booking.`);
        return {
            draftId,
            trackingNumber: updateResult.data.tracking_number,
            assignedDriver: {
                id: session.userId,
                fullName: session.fullName,
            },
            progressLabel: updateResult.data.tracking_progress_label,
        };
    }
};
exports.DriverBookingsService = DriverBookingsService;
exports.DriverBookingsService = DriverBookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [parcel_drafts_repository_1.ParcelDraftsRepository,
        customer_notifications_service_1.CustomerNotificationsService])
], DriverBookingsService);
