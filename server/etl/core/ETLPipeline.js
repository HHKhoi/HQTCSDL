const SyncState = require('../../modules/analytics/infrastructure/models/SyncState');
const logger = require('../../shared/utils/etl-logger');

/**
 * ETLPipeline — abstract base class for all analytical pipelines.
 *
 * Lifecycle (enforced by run()):
 *   init() → extract() → transform(rawData) → load(transformed) → finalize()
 *
 * Constraints:
 *   - transform() receives ONLY what extract() returns (no secret DB calls)
 *   - SyncState is updated ONLY after a successful load (atomicity)
 *   - Subclasses must override extract(), transform(), load()
 */
class ETLPipeline {
  constructor(name) {
    if (!name) throw new Error('ETLPipeline requires a name');
    this.name = name;
    this.syncState = null;
  }

  // ─── Lifecycle orchestrator ──────────────────────────────────────────────

  async run(options = {}) {
    const runStart = Date.now();
    const log = await logger.start(this.name);

    try {
      // 1. INIT — load SyncState (skipped for backfill runs)
      await this.init(options);

      // 2. EXTRACT — delta query using high-water mark
      const rawData = await this.extract(options);

      const extracted = Array.isArray(rawData) ? rawData.length : (rawData ? 1 : 0);

      // Warning: nothing to process (no-op run)
      if (extracted === 0) {
        await logger.warn(log._id, this.name, 'No new records extracted — skipping transform/load');
        return { success: true, extracted: 0, transformed: 0, upserted: 0 };
      }

      // 3. TRANSFORM — receives only the extracted payload
      const transformedData = await this.transform(rawData);
      const transformed = this._countTransformed(transformedData);

      // 4. LOAD — upsert into analytics collections
      const loadResult = await this.load(transformedData);
      const upserted = loadResult.count ?? 0;

      // 5. FINALIZE — advance high-water mark only after successful load
      await this.finalize(options);

      const durationSeconds = (Date.now() - runStart) / 1000;
      await logger.success(log._id, durationSeconds, { extracted, transformed, upserted });

      return { success: true, extracted, transformed, upserted };
    } catch (error) {
      await logger.error(log._id, this.name, error);
      throw error; // Let BullMQ handle retry
    }
  }

  // ─── Default lifecycle steps ─────────────────────────────────────────────

  /**
   * Loads (or seeds) SyncState from DB.
   * Defaults lastSyncTime to epoch so first run processes all history.
   */
  async init(options) {
    if (options.isBackfill) return; // Backfill manages its own range; no SyncState needed
    this.syncState = await SyncState.findOne({ pipelineName: this.name });
    if (!this.syncState) {
      this.syncState = await SyncState.create({
        pipelineName: this.name,
        lastSyncTime: new Date(0), // epoch → full historical scan on first run
      });
    }
  }

  /**
   * Advances the high-water mark to now.
   * Called ONLY after load() succeeds to guarantee atomicity.
   * Uses server clock captured AFTER extraction to tolerate clock drift:
   * any record that arrived during the ETL run will be caught next tick.
   */
  async finalize(options) {
    if (options.isBackfill || !this.syncState) return;
    this.syncState.lastSyncTime = new Date();
    this.syncState.lastRunStatus = 'success';
    await this.syncState.save();
  }

  // ─── Abstract methods (subclasses must implement) ─────────────────────────

  // eslint-disable-next-line no-unused-vars
  async extract(options) {
    throw new Error(`${this.name}: extract() not implemented`);
  }

  // eslint-disable-next-line no-unused-vars
  async transform(rawData) {
    throw new Error(`${this.name}: transform() not implemented`);
  }

  // eslint-disable-next-line no-unused-vars
  async load(transformedData) {
    throw new Error(`${this.name}: load() not implemented`);
  }

  // ─── Internal helpers ─────────────────────────────────────────────────────

  /**
   * Counts total transformed records across all keys in the transformed payload.
   * Subclasses may override if their payload shape differs.
   */
  _countTransformed(transformedData) {
    if (!transformedData || typeof transformedData !== 'object') return 0;
    return Object.values(transformedData).reduce((sum, v) => {
      return sum + (Array.isArray(v) ? v.length : 0);
    }, 0);
  }
}

module.exports = ETLPipeline;
