# PakiApps Backend Checklist

This checklist is narrowed to your part only: `shared NestJS API/backend support for web and mobile`.

Frontend prototypes, Figma decisions, and mobile/web visual implementation are not your ownership. Your job is to make sure both clients can use the same API layer safely.

## Core Scope

- Focus on [backend/src](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src)
- Support both `website` and `mobile`
- Keep all shared data access behind the NestJS API layer
- Use the shared `pakiAPPS` database
- Do not add direct frontend/mobile database access

## PakiShip Must-Do

- [ ] Confirm all personas can log in and log out through the API
- [ ] Review [backend/src/auth/auth.controller.ts](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/auth/auth.controller.ts)
- [ ] Review [backend/src/auth/auth.service.ts](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/auth/auth.service.ts)
- [ ] Verify signup/login follows the current rule: no manual approval yet for drivers/operators
- [ ] Confirm customer parcel booking works end-to-end through the API
- [ ] Review [backend/src/parcel-drafts/parcel-drafts.controller.ts](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/parcel-drafts/parcel-drafts.controller.ts)
- [ ] Review [backend/src/parcel-drafts/parcel-drafts.service.ts](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/parcel-drafts/parcel-drafts.service.ts)
- [ ] Review [backend/src/parcel-drafts/parcel-drafts.repository.ts](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/parcel-drafts/parcel-drafts.repository.ts)
- [ ] Add or confirm driver-facing booking request endpoints
- [ ] Make sure drivers can filter booking requests by delivery type: `relay` or `direct`
- [ ] Add or confirm relay bookings are visible to the Drop-off Point Operator
- [ ] Add or confirm relay booking QR data can be retrieved for scanning workflows
- [ ] Add backend support for nearby drop-off points
- [ ] Use convenience stores near Frassati as dummy drop-off point data
- [ ] Keep Google Maps integration backend-safe, even if it is only placeholder support for now
- [ ] Confirm both web and mobile can consume the same booking and tracking APIs
- [ ] Make sure all data passes through the API layer only
- [ ] Ensure the backend is prepared for real-time updates across customer, driver, and operator roles

## PakiShip Business Rules

- [ ] Remove any backend dependency on a separate bulk-order option
- [ ] Add backend rule: orders with `10+` items are automatically treated as bulk
- [ ] Allow both `relay delivery` and `direct delivery` for any parcel quantity
- [ ] If relay is selected, only relay booking requests should be shown to the driver
- [ ] If direct is selected, only direct booking requests should be shown to the driver
- [ ] Improve parcel tracking response to include current location/progress
- [ ] Extend [backend/src/customer-notifications/customer-notifications.service.ts](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/customer-notifications/customer-notifications.service.ts) for customer status updates

## PakiShip Mobile Constraints

- [ ] Support QR-code-related API flows for customer and operator/driver use
- [ ] Do not build analytics-specific mobile requirements if they are not needed
- [ ] If mobile omits a screen, keep the backend reusable anyway
- [ ] Make sure the same API contracts work for both Next.js and Expo clients

## PakiPark Backend Scope

- [ ] Confirm all personas can log in and log out through the API
- [ ] Add or confirm a `Keep Me Signed In` backend/session flow
- [ ] Customers can book parking slots through the API
- [ ] New parking bookings should reflect to the Business Partner side
- [ ] Booking data must sync with the web system and mobile system through shared APIs
- [ ] Booking ID must be retrievable by teller/business partner flows
- [ ] QR code metadata must be retrievable for the customer side
- [ ] Teller uses Booking ID only to verify reservations
- [ ] Teller does not need QR scanning support
- [ ] If a feature is incomplete, return a safe backend state the frontend can map to a `Coming Soon` page
- [ ] Coordinate schema/API shape with Roaring integration requirements if pakiPark depends on it

## Database And Environment Rules

- [ ] Use the `pakiAPPS` database, not a dummy database
- [ ] Keep staging/production access behind the NestJS API layer only
- [ ] If schema changes are needed, create proper Supabase migration files
- [ ] Do not change staging/production schema manually
- [ ] Keep migration files reviewable and sequence-safe

## Likely Backend Modules To Own

- [ ] [backend/src/auth](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/auth)
- [ ] [backend/src/parcel-drafts](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/parcel-drafts)
- [ ] [backend/src/customer-notifications](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/customer-notifications)
- [ ] [backend/src/operator-dashboard](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/operator-dashboard)
- [ ] [backend/src/drop-off-points](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/drop-off-points)
- [ ] Add a driver-bookings module if driver request handling needs its own API surface
- [ ] Add pakiPark-specific modules when those flows enter this repo

## Good Next Steps

- [ ] Add polling/WebSocket/SSE strategy for real-time requirements
- [ ] Add driver request endpoints if they do not exist yet
- [ ] Add QR lookup endpoints if mobile/web scanner flows need dedicated routes
- [ ] Register any new modules in [backend/src/app.module.ts](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/app.module.ts)
- [ ] Keep shared database access centralized through [backend/src/supabase/supabase.service.ts](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/supabase/supabase.service.ts)

## Not Your Part

- [ ] Figma/prototype decisions
- [ ] Web page layout decisions
- [ ] Mobile UI styling and screen composition
- [ ] Frontend-only card/button removal
- [ ] Analytics mobile UI if design ownership belongs elsewhere

## First Files To Open

1. [backend/src/auth/auth.service.ts](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/auth/auth.service.ts)
2. [backend/src/parcel-drafts/parcel-drafts.service.ts](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/parcel-drafts/parcel-drafts.service.ts)
3. [backend/src/parcel-drafts/parcel-drafts.repository.ts](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/parcel-drafts/parcel-drafts.repository.ts)
4. [backend/src/customer-notifications/customer-notifications.service.ts](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/customer-notifications/customer-notifications.service.ts)
5. [backend/src/operator-dashboard/operator-dashboard.service.ts](/Users/samantha.rosales/Desktop/pakiship-backend-minor-repo/backend/src/operator-dashboard/operator-dashboard.service.ts)
