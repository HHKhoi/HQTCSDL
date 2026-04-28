# ETL Architecture Design

## 1. Scenario Definitions

| Metric | Scenario A: Small Scale (MVP) | Scenario B: Medium Scale (Growing) | Scenario C: Large Scale (Enterprise) |
| :--- | :--- | :--- | :--- |
| **Business Profile** | Single luxury showroom | National dealership network | Global auto marketplace |
| **Orders/Day** | < 50 | 1,000 - 5,000 | 50,000+ |
| **Data Retention** | 3 Years | 7 Years | Infinite (Cold Storage) |
| **Update Frequency** | Rare (Status changes only) | Frequent (Price adjustments, cancellations) | Continuous + Late arriving data |
| **Freshness SLA** | Hourly / Daily | 15 mins (Ops), Daily (Sales) | Near Real-time (< 1 min) |

## 2. ETL Strategy per Scenario

| Strategy | Scenario A: Small Scale | Scenario B: Medium Scale | Scenario C: Large Scale |
| :--- | :--- | :--- | :--- |
| **Architecture** | ETL | ETL | ELT |
| **Processing** | Batch (Cron) | Micro-batch (BullMQ) | Streaming (Kafka / CDC) |
| **Load Type** | Full Load (Wipe & Replace) | Incremental (Delta Load) | Incremental (Append-only + Views) |
| **Staging Layer** | No | Yes (Internal DB) | Yes (Data Lake / S3) |
| **Data Warehouse**| No (Uses MongoDB) | No (Uses MongoDB Analytics DB) | Yes (Snowflake / BigQuery) |

## 3. Final Recommended Architecture

**Choice: Scenario B (Medium Scale / Micro-batch ETL)**  
*Justification:* The project is a car showroom application. Transaction volume will not reach Enterprise/Big Tech levels, meaning external Data Warehouses (Snowflake) and Streaming (Kafka) introduce unnecessary cost and complexity. However, the current "Wipe & Replace" strategy will break as the business grows. An incremental micro-batch ETL inside the existing Node.js + BullMQ + MongoDB stack is the perfect balance of scalability, cost, and complexity.

### Data Flow Pipeline
1. **Source (OLTP):** `Order` and `Car` collections.
2. **Extract (Delta):** Node.js worker queries MongoDB for records where `updatedAt > lastSyncTime`.
3. **Transform (In-Memory/DB):** Node.js groups the extracted records to identify which specific entities (e.g., specific Dates or specific Car Models) need re-calculation. It then computes the new aggregates *only* for those affected groups.
4. **Load (Upsert):** Transformed data is merged into analytics collections using `bulkWrite` with `upsert: true`.

## 4. Incremental Processing Design

### SyncState Structure
To track what data has been processed, we introduce a `SyncState` collection:
```json
{
  "pipelineName": "SalesAnalytics",
  "lastSyncTime": "2026-04-28T14:00:00Z",
  "lastProcessedId": "60d5ec496c9c440000000000", 
  "status": "success"
}
```

### Safely Handling Updates & Late Arrivals
*   **The Problem:** If an order from January 1st is modified on April 28th, a naive pipeline grouped by `createdAt` will miss it.
*   **The Solution:** The Extract phase queries `updatedAt`.
    *   *Extract:* `Order.find({ updatedAt: { $gt: lastSyncTime } })`
    *   *Identify:* From the extracted orders, extract the unique `dates` (based on `createdAt`) that were modified.
    *   *Recompute:* Run the aggregation *only* for those specific dates.
    *   *Result:* Late-arriving updates naturally trigger a re-calculation for their respective historical dates without needing a full database scan.

## 5. Data Model Design

### Staging Layer: `OrderFact`
Instead of doing complex groupings directly from the OLTP tables, flatten the data into a staging collection to make aggregations lightning fast.
```json
{
  "_id": "fact_60d5ec...",
  "orderId": "60d5ec...",
  "date": "2026-04-28", // extracted from createdAt
  "revenue": 55000,
  "carModel": "Camry",
  "brand": "Toyota",
  "status": "completed",
  "isCancelled": false
}
```

### Analytics Layer: `DailySalesSummary`
```json
{
  "date": "2026-04-28", // UNIQUE INDEX
  "revenue": 110000,
  "ordersCount": 2,
  "aov": 55000,
  "updatedAt": "2026-04-28T14:05:00Z"
}
```

## 6. Loading Strategy

### Idempotent Upserts
Never use `deleteMany()`. Use MongoDB's `bulkWrite`:
```javascript
const ops = updatedDailyStats.map(stat => ({
  updateOne: {
    filter: { date: stat.date },
    update: { $set: stat },
    upsert: true
  }
}));
await DailySalesSummary.bulkWrite(ops);
```
*Why?* Upserts are atomic. If a user queries the dashboard during an ETL run, they see the old data until the exact millisecond the upsert completes. Zero downtime.

## 7. Reprocessing / Backfill Strategy

*   **Logic Changes:** If the definition of "Revenue" changes, you must recalculate history.
*   **Zero-Downtime Backfill:** 
    1. Create a new collection (e.g., `DailySalesSummary_v2`).
    2. Run the ETL pipeline ignoring `SyncState` (full extract) and target `_v2`.
    3. Once complete, rename `DailySalesSummary_v2` to `DailySalesSummary` (MongoDB `renameCollection` with `dropTarget: true`). This swap is atomic.
    4. Reset `SyncState` to the current time.

## 8. Performance & Scaling Plan

*   **Indexing:** Ensure `updatedAt` is indexed on all OLTP collections (`Order`, `Car`). Ensure the primary grouping keys (`date`, `modelName`) are `unique` indexed on Analytics collections.
*   **Worker Scaling:** BullMQ can scale horizontally. Spin up multiple Docker containers for `etl-worker`. 
*   **Database Protection:** Extract data using a Read Replica connection string if OLTP load becomes too high, ensuring analytical scans never block checkout transactions.

## 9. Observability & Reliability

*   **Logging Structure:**
    `[INFO] Pipeline: SalesAnalytics | Extracted: 45 | Affected Dates: 3 | Upserted: 3 | Duration: 450ms`
*   **Metrics to Track:**
    *   **Throughput:** Records processed per minute.
    *   **Lag:** `Date.now() - SyncState.lastSyncTime`. If lag > 15 mins, trigger an alert.
*   **Failure Recovery:** If a job fails, `SyncState.lastSyncTime` is *not* updated. The next run in 5 minutes will simply pick up the same records and try again. The upsert strategy ensures no double-counting occurs if a previous run partially succeeded.

## 10. Migration Plan (Step-by-Step)

**Step 1: Database Prep**
*   Create the `SyncState` collection.
*   Add `{ updatedAt: 1 }` indexes to `Order` and `Car` collections.

**Step 2: Rewrite Pipelines (Code)**
*   Modify `extract()` to accept a `lastSyncTime` and query against `updatedAt`.
*   Modify `transform()` to only group/aggregate based on the IDs or Dates present in the extracted payload.
*   Modify `load()` to replace `deleteMany()` + `insertMany()` with `bulkWrite` + `upsert`.

**Step 3: Initial State Migration**
*   Deploy the new code. The workers will fail safely because `SyncState` doesn't exist yet.
*   Run `trigger-backfill.js` (modified to do a full historical scan and populate the initial `SyncState`).

**Step 4: Cleanup**
*   Once the backfill succeeds and the 5-minute cron takes over using deltas, remove any legacy endpoints or scripts that performed on-the-fly aggregations.
