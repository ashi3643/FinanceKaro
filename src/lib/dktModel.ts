// Deep Knowledge Tracing (DKT) Model for Adaptive Learning
// Simplified implementation for browser-based learning

interface KnowledgeState {
  conceptId: string;
  masteryLevel: number; // 0-1
  lastSeen: number;
  attempts: number;
  correct: number;
  timeSpent: number;
}

interface InteractionEvent {
  conceptId: string;
  isCorrect: boolean;
  timeTaken: number;
  timestamp: number;
  difficulty: number;
}

class DKTModel {
  private knowledgeStates: Map<string, KnowledgeState>;
  private learningRate: number = 0.1;
  private forgettingRate: number = 0.05;

  constructor() {
    this.knowledgeStates = new Map();
  }

  // Initialize or load knowledge state for a concept
  initializeKnowledgeState(conceptId: string): KnowledgeState {
    const existing = this.knowledgeStates.get(conceptId);
    if (existing) return existing;

    const newState: KnowledgeState = {
      conceptId,
      masteryLevel: 0.5, // Start with 50% mastery
      lastSeen: Date.now(),
      attempts: 0,
      correct: 0,
      timeSpent: 0
    };

    this.knowledgeStates.set(conceptId, newState);
    return newState;
  }

  // Update knowledge state based on user interaction
  updateKnowledgeState(event: InteractionEvent): KnowledgeState {
    const state = this.initializeKnowledgeState(event.conceptId);

    // Calculate time decay
    const timeElapsed = (Date.now() - state.lastSeen) / (1000 * 60 * 60 * 24); // days
    const decay = Math.exp(-this.forgettingRate * timeElapsed);
    state.masteryLevel *= decay;

    // Update based on interaction
    state.attempts++;
    state.timeSpent += event.timeTaken;
    state.lastSeen = event.timestamp;

    if (event.isCorrect) {
      state.correct++;
      // Increase mastery based on correctness and difficulty
      const masteryIncrease = this.learningRate * event.difficulty * (1 - state.masteryLevel);
      state.masteryLevel = Math.min(1, state.masteryLevel + masteryIncrease);
    } else {
      // Decrease mastery slightly on incorrect answers
      const masteryDecrease = this.learningRate * 0.5 * state.masteryLevel;
      state.masteryLevel = Math.max(0, state.masteryLevel - masteryDecrease);
    }

    this.knowledgeStates.set(event.conceptId, state);
    return state;
  }

  // Get current mastery level for a concept
  getMasteryLevel(conceptId: string): number {
    const state = this.knowledgeStates.get(conceptId);
    if (!state) return 0.5; // Default for unseen concepts

    // Apply time decay
    const timeElapsed = (Date.now() - state.lastSeen) / (1000 * 60 * 60 * 24);
    const decay = Math.exp(-this.forgettingRate * timeElapsed);
    return state.masteryLevel * decay;
  }

  // Get recommended difficulty for next question
  getRecommendedDifficulty(conceptId: string): number {
    const mastery = this.getMasteryLevel(conceptId);
    
    // Adaptive difficulty: higher mastery = harder questions
    // Difficulty scale: 0 (easy) to 1 (hard)
    return Math.max(0.1, Math.min(0.9, mastery));
  }

  // Check if concept should be skipped (high mastery)
  shouldSkipConcept(conceptId: string): boolean {
    const mastery = this.getMasteryLevel(conceptId);
    const state = this.knowledgeStates.get(conceptId);
    
    // Skip if mastery > 0.8 and at least 3 correct attempts
    return mastery > 0.8 && (state?.correct ?? 0) >= 3;
  }

  // Get concepts that need review (low mastery)
  getConceptsNeedingReview(threshold: number = 0.6): string[] {
    const conceptsNeedingReview: string[] = [];
    
    for (const [conceptId, state] of this.knowledgeStates.entries()) {
      const mastery = this.getMasteryLevel(conceptId);
      if (mastery < threshold) {
        conceptsNeedingReview.push(conceptId);
      }
    }

    // Sort by mastery level (lowest first)
    return conceptsNeedingReview.sort((a, b) => {
      return this.getMasteryLevel(a) - this.getMasteryLevel(b);
    });
  }

  // Get overall learning progress
  getOverallProgress(): {
    averageMastery: number;
    conceptsLearned: number;
    totalConcepts: number;
  } {
    const concepts = Array.from(this.knowledgeStates.values());
    const totalMastery = concepts.reduce((sum, state) => {
      return sum + this.getMasteryLevel(state.conceptId);
    }, 0);

    const conceptsLearned = concepts.filter(c => this.getMasteryLevel(c.conceptId) > 0.8).length;

    return {
      averageMastery: concepts.length > 0 ? totalMastery / concepts.length : 0,
      conceptsLearned,
      totalConcepts: concepts.length
    };
  }

  // Export knowledge state for persistence
  exportState(): Record<string, KnowledgeState> {
    const exported: Record<string, KnowledgeState> = {};
    for (const [conceptId, state] of this.knowledgeStates.entries()) {
      exported[conceptId] = state;
    }
    return exported;
  }

  // Import knowledge state from persistence
  importState(state: Record<string, KnowledgeState>): void {
    this.knowledgeStates.clear();
    for (const [conceptId, knowledgeState] of Object.entries(state)) {
      this.knowledgeStates.set(conceptId, knowledgeState);
    }
  }
}

// Singleton instance
let dktModelInstance: DKTModel | null = null;

export function getDKTModel(): DKTModel {
  if (!dktModelInstance) {
    dktModelInstance = new DKTModel();
  }
  return dktModelInstance;
}

export type { KnowledgeState, InteractionEvent };
