import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import MLWealthCalculator from './MLWealthCalculator';
import { useStore } from '@/lib/store';

// Mock next/navigation and next-intl
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));
vi.mock('next-intl', () => ({
  useLocale: vi.fn(),
}));

// Mock store
vi.mock('@/lib/store', () => ({
  useStore: vi.fn(),
}));

const mockPredictWealth = vi.fn();
const mockSubmitFeedback = vi.fn();
const mockUseRouter = vi.fn();
const mockUseLocale = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockUseLocale.mockReturnValue('en');
  mockUseRouter.mockReturnValue({ push: vi.fn() });
  vi.mocked(useRouter).mockReturnValue(mockUseRouter());
  vi.mocked(useLocale).mockReturnValue('en');
});

describe('MLWealthCalculator', () => {
  it('renders without crashing', () => {
    vi.mocked(useStore).mockReturnValue({
      predictWealth: mockPredictWealth,
      submitPredictionFeedback: mockSubmitFeedback,
      isPredicting: false,
      predictionError: null,
      recentPredictions: [],
    } as any);

    render(<MLWealthCalculator />);
    expect(screen.getByText(/Smart Wealth Builder/i)).toBeInTheDocument();
  });

  it('displays formatted currency correctly', async () => {
    vi.mocked(useStore).mockReturnValue({
      predictWealth: mockPredictWealth,
      isPredicting: false,
      predictionError: null,
      recentPredictions: [],
    } as any);

    render(<MLWealthCalculator />);
    
    // Default should show some formatted amount
    await waitFor(() => {
      expect(screen.getByText(/₹/)).toBeInTheDocument();
    });
  });

  it('updates monthly amount slider and displays new value', async () => {
    const mockPush = vi.fn();
    mockUseRouter.mockReturnValue({ push: mockPush });
    
    vi.mocked(useStore).mockReturnValue({
      predictWealth: vi.fn().mockResolvedValue({
        prediction: 1000000,
        confidence: 0.9,
        recommendation: 'Good plan!',
        modelVersion: 'v1.0',
        timestamp: '2026-01-01',
      }),
      isPredicting: false,
      predictionError: null,
      recentPredictions: [],
    } as any);

    render(<MLWealthCalculator />);
    
    const monthlySlider = screen.getByRole('slider', { name: /Monthly Investment/i });
    fireEvent.change(monthlySlider, { target: { value: '1000' } });
    
    await waitFor(() => {
      expect(monthlySlider).toHaveValue(1000);
    });
  });

  it('toggles risk tolerance buttons', async () => {
    vi.mocked(useStore).mockReturnValue({
      predictWealth: mockPredictWealth,
      isPredicting: false,
      predictionError: null,
      recentPredictions: [],
    } as any);

    render(<MLWealthCalculator />);

    const lowRiskBtn = screen.getByRole('button', { name: /Low/i });
    const mediumRiskBtn = screen.getByRole('button', { name: /Medium/i });
    
    expect(mediumRiskBtn).toHaveClass('bg-accent'); // default medium
    expect(lowRiskBtn).not.toHaveClass('bg-accent');
    
    fireEvent.click(lowRiskBtn);
    await waitFor(() => {
      expect(lowRiskBtn).toHaveClass('bg-accent');
      expect(mediumRiskBtn).not.toHaveClass('bg-accent');
    });
  });

  it('shows loading state during prediction', async () => {
    mockPredictWealth.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    vi.mocked(useStore).mockReturnValue({
      predictWealth: mockPredictWealth,
      isPredicting: true,
      predictionError: null,
      recentPredictions: [],
    } as any);

    render(<MLWealthCalculator />);
    
    expect(screen.getByText(/AI is analyzing/i)).toBeInTheDocument();
  });

  it('handles prediction error with fallback', async () => {
    mockPredictWealth.mockRejectedValue(new Error('API error'));
    
    vi.mocked(useStore).mockReturnValue({
      predictWealth: mockPredictWealth,
      isPredicting: false,
      predictionError: 'API error',
      recentPredictions: [],
    } as any);

    render(<MLWealthCalculator />);

    await waitFor(() => {
      expect(screen.getByText(/Prediction Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Using standard calculation/i)).toBeInTheDocument();
    });
  });

  it('navigates to calculator on CTA click', async () => {
    const mockPush = vi.fn();
    mockUseRouter.mockReturnValue({ push: mockPush });
    
    vi.mocked(useStore).mockReturnValue({
      predictWealth: mockPredictWealth,
      isPredicting: false,
      predictionError: null,
      recentPredictions: [],
    } as any);

    render(<MLWealthCalculator />);

    const ctaButton = screen.getByRole('button', { name: /Explore Advanced Calculator/i });
    fireEvent.click(ctaButton);
    
    expect(mockPush).toHaveBeenCalledWith('/en/calculate');
  });

  it('submits feedback buttons work', async () => {
    mockPredictWealth.mockResolvedValue({
      prediction: 1234567,
      confidence: 0.92,
      recommendation: 'Test rec',
      modelVersion: 'v1.2', 
      timestamp: '2026-04-12T10:00:00Z'
    });
    
    vi.mocked(useStore).mockReturnValue({
      predictWealth: mockPredictWealth,
      submitPredictionFeedback: mockSubmitFeedback,
      isPredicting: false,
      predictionError: null,
      recentPredictions: [{
        prediction: 1234567,
        confidence: 0.92,
        recommendation: 'Test rec',
        modelVersion: 'v1.2',
        timestamp: '2026-04-12T10:00:00Z'
      }],
    } as any);

    render(<MLWealthCalculator />);
    
    await waitFor(() => {
      const accurateBtn = screen.getByRole('button', { name: /Accurate/i });
      fireEvent.click(accurateBtn);
    });
    
    expect(mockSubmitFeedback).toHaveBeenCalledWith(
      '2026-04-12T10:00:00Z',
      'accurate'
    );
  });
});
