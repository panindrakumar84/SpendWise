import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import { config } from "@config/env.config.js";
import { logger } from "@config/logger.config.js";

class DatabaseConnection {
  private pool: Pool;
  private static instance: DatabaseConnection;

  private constructor() {
    // create pg connection pool
    const poolConfig = {
      connectionString: config.database.url,
      max: config.database.pool.max,
      min: config.database.pool.min,
      idleTimeoutMillis: config.database.pool.idleTimeoutMillis,
      connectionTimeoutMillis: config.database.pool.connectionTimeoutMillis,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
    };

    this.pool = new Pool(poolConfig);

    // handle pool errors
    this.pool.on("error", (err) => {
      logger.error("Unexpected error on idle client", err);
      process.exit(-1);
    });

    // handle pool connection
    this.pool.on("connect", () => {
      logger.info(
        `Connected to database: ${config.database.url.split("@")[1]}`
      );
    });

    // handle pool removal
    this.pool.on("remove", () => {
      logger.debug("Client removed from pool");
    });
  }

  /**
   * Get singleton instance of DatabaseConnection
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Get the pool instance (useful for transactions)
   */
  public getPool(): Pool {
    return this.pool;
  }

  /**
   * Execute a query with automatic connection management
   */
  public async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    const client = await this.pool.connect();

    try {
      const result = await client.query<T>(text, params);
      const duration = Date.now() - start;

      logger.debug("Executed query", {
        text,
        duration: `${duration}ms`,
        rows: result.rowCount,
      });
      return result;
    } catch (error) {
      logger.error("Database query error", { text, error });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const result = await this.query("SELECT NOW()");
      logger.info("Database connection test successful", {
        timestamp: result.rows[0].now,
      });
      return true;
    } catch (error) {
      logger.error("Database connection test failed", error);
      return false;
    }
  }

  /**
   * Gracefully close the pool
   */
  public async closePool(): Promise<void> {
    try {
      await this.pool.end();
      logger.info("Database pool closed");
    } catch (error) {
      logger.error("Error closing database pool", error);
      throw error;
    }
  }
}

// Export singleton instance
const databaseInstance = DatabaseConnection.getInstance();
export const database = databaseInstance;
