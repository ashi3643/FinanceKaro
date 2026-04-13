interface ModelPredictionLog {
  deviceId: string;
  modelVersion: string;
  inputFeatures: Record<string, any>;
  prediction: number;
  confidence: number;
  timestamp: string;
  actualValue?: number;
  error?: number;
}

interface ModelMetrics {
  modelVersion: string;
  totalPredictions: number;
  averageConfidence: number;
  averageError?: number;
  timestamp: string;
}

const logs: ModelPredictionLog[] = [];

export const modelObservability = {
  getLogs(): ModelPredictionLog[] {
    return logs;
  },

  logPrediction(log: ModelPredictionLog): void {
    logs.push(log);
    
    // Keep only last 1000 logs in memory
    if (logs.length > 1000) {
      logs.shift();
    }

    // Log to console for now (can be extended to MLflow/Weights & Biases)
    console.log('[ModelObservability]', {
      model: log.modelVersion,
      confidence: log.confidence,
      timestamp: log.timestamp
    });

    // In production, send to ML backend or observability platform
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.sendToObservabilityService(log);
    }
  },

  calculateMetrics(modelVersion: string): ModelMetrics | null {
    const versionLogs = logs.filter(log => log.modelVersion === modelVersion);
    
    if (versionLogs.length === 0) return null;

    const totalPredictions = versionLogs.length;
    const averageConfidence = versionLogs.reduce((sum, log) => sum + log.confidence, 0) / totalPredictions;
    
    const logsWithActuals = versionLogs.filter(log => log.actualValue !== undefined);
    let averageError: number | undefined;
    
    if (logsWithActuals.length > 0) {
      averageError = logsWithActuals.reduce((sum, log) => {
        if (log.actualValue === undefined || log.error === undefined) return sum;
        return sum + Math.abs(log.error);
      }, 0) / logsWithActuals.length;
    }

    return {
      modelVersion,
      totalPredictions,
      averageConfidence,
      averageError,
      timestamp: new Date().toISOString()
    };
  },

  async sendToObservabilityService(log: ModelPredictionLog): Promise<void> {
    try {
      // Placeholder for sending to MLflow, Weights & Biases, or custom service
      // This would be implemented based on your observability platform choice
      const response = await fetch('/api/model-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });

      if (!response.ok) {
        console.warn('Failed to send to observability service');
      }
    } catch (error) {
      console.error('Error sending to observability service:', error);
    }
  },

  getModelAccuracy(modelVersion: string, tolerance: number = 0.1): number {
    const versionLogs = logs.filter(log => 
      log.modelVersion === modelVersion && 
      log.actualValue !== undefined &&
      log.error !== undefined
    );

    if (versionLogs.length === 0) return 0;

    const accuratePredictions = versionLogs.filter(log => 
      log.error !== undefined && Math.abs(log.error) <= tolerance * Math.abs(log.actualValue || 1)
    );

    return accuratePredictions.length / versionLogs.length;
  },

  clearLogs(): void {
    logs.length = 0;
  }
};
