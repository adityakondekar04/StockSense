// apps/web/src/api/client.ts
// Typed REST API client for StockSense with friendly error handling

export interface ApiError {
  status: number;
  message: string;
  details?: Array<{ path: string; message: string }>;
}

export class StockSenseApiClient {
  private baseUrl: string;

  constructor(baseUrl = import.meta.env.VITE_API_BASE_URL || "/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });

      if (!res.ok) {
        let errMessage = `Server error (${res.status})`;
        let details = undefined;
        try {
          const errJson = await res.json();
          errMessage = errJson.error || errMessage;
          details = errJson.details;
        } catch {
          // Response was not JSON
        }
        const error: ApiError = {
          status: res.status,
          message: errMessage,
          details,
        };
        throw error;
      }

      return (await res.json()) as T;
    } catch (err: any) {
      if (err.status) {
        throw err;
      }
      // Network or offline failure
      const networkError: ApiError = {
        status: 0,
        message: "Cannot reach the server. Please check that the API is running at http://localhost:4000.",
      };
      throw networkError;
    }
  }

  // Health
  async getHealth(): Promise<{ ok: boolean; db: boolean; llmConfigured: boolean }> {
    return this.request("/health");
  }

  // Products
  async getProducts(): Promise<any[]> {
    return this.request("/products");
  }

  async createProduct(data: any): Promise<any> {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<any> {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // Analysis
  async runAnalysis(params: {
    productId: string;
    serviceLevel?: number;
    aiEnabled?: boolean;
    splitRatio?: number;
    includeUnknowns?: boolean;
  }): Promise<any> {
    return this.request("/analysis/run", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // Sales
  async getSales(productId: string): Promise<any> {
    return this.request(`/products/${productId}/sales`);
  }

  // Anomalies
  async getAnomalies(productId: string): Promise<any> {
    return this.request(`/products/${productId}/anomalies`);
  }

  async confirmAnomaly(anomalyId: string, override?: { class?: string; note?: string }): Promise<any> {
    return this.request(`/anomalies/${anomalyId}/confirm`, {
      method: "POST",
      body: JSON.stringify(override || {}),
    });
  }

  // Import
  async importDemo(): Promise<any> {
    return this.request("/import/demo", {
      method: "POST",
    });
  }

  async importSalesCsv(csvText: string): Promise<any> {
    const url = `${this.baseUrl}/import/sales`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: csvText,
      });
      return await res.json();
    } catch {
      throw {
        status: 0,
        message: "Cannot reach the server. Failed to upload sales CSV.",
      };
    }
  }
}

export const apiClient = new StockSenseApiClient();
