# Dashboard Data

Status: approved
Slug: dashboard-data

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
The dashboard is the product interface a wearer or a care circle member actually uses. It reads only the public API, so anything the dashboard shows is provable against the endpoints. This spec pins the data contract the interface depends on: tiles, series and alerts for one selected patch at a time.

## Requirements
- The wearer selector offers exactly the patches returned by GET /api/patches.
- Current value tiles show temperature, hydration, activity, battery, last sync time and the network the last sync arrived on.
- The 24 h charts plot the temperature and hydration series from GET /api/patches/:id/measurements?hours=24 without transforming units.
- The alerts list shows the selected patch's alerts from GET /api/alerts, newest first.
- Switching wearer re-fetches status, measurements and alerts for the new patch and re-renders tiles, charts, alerts and the fleet row highlight.

## Scenarios

### Scenario: Tiles mirror the status endpoint
- S1: Given a selected patch, when the dashboard loads its status, then the temperature, hydration and battery tiles equal the values returned by GET /api/patches/:id for that patch.

### Scenario: Chart series length matches the window
- S2: Given hours=24 at 15 minute spacing, when the dashboard requests measurements, then it receives 96 points per series and the chart draws all of them.

### Scenario: Alerts are filtered per wearer
- S3: Given the alerts endpoint returns alerts for several patches, when a wearer is selected, then only that patch's alerts are listed.
