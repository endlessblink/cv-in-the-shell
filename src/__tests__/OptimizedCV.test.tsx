import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OptimizedCV from '../components/OptimizedCV';
import { sampleCVs } from './testData';

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    getTextWidth: jest.fn().mockReturnValue(50),
    internal: {
      pageSize: {
        getWidth: jest.fn().mockReturnValue(210),
        getHeight: jest.fn().mockReturnValue(297),
      }
    },
    text: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
    splitTextToSize: jest.fn().mockImplementation((text) => [text]),
  }));
});

describe('OptimizedCV Component', () => {
  // Test basic rendering
  test('renders CV content correctly', () => {
    render(<OptimizedCV content={sampleCVs.basic} />);
    expect(screen.getByText('NOAM NAUMOVSKY')).toBeInTheDocument();
    expect(screen.getByText(/Senior Motion Designer/)).toBeInTheDocument();
  });

  // Test special characters rendering
  test('renders special characters correctly', () => {
    render(<OptimizedCV content={sampleCVs.withSpecialCharacters} />);
    const bullets = screen.getAllByText('•');
    expect(bullets).toHaveLength(3);
  });

  // Test long content
  test('handles long bullet points correctly', () => {
    render(<OptimizedCV content={sampleCVs.withLongBulletPoints} />);
    expect(screen.getByText(/Managed and coordinated/)).toBeInTheDocument();
  });

  // Test PDF generation
  test('generates PDF when button is clicked', () => {
    render(<OptimizedCV content={sampleCVs.basic} />);
    const downloadButton = screen.getByText(/Download PDF/i);
    fireEvent.click(downloadButton);
    // Verify jsPDF was called
    expect(require('jspdf')).toHaveBeenCalled();
  });

  // Test reset functionality
  test('reset button works correctly', () => {
    const onReset = jest.fn();
    render(<OptimizedCV content={sampleCVs.basic} onReset={onReset} />);
    const resetButton = screen.getByText(/Reset/i);
    fireEvent.click(resetButton);
    expect(onReset).toHaveBeenCalled();
  });

  // Test empty state
  test('handles empty content correctly', () => {
    render(<OptimizedCV content="" />);
    const downloadButton = screen.getByText(/Download PDF/i);
    expect(downloadButton).toBeDisabled();
  });

  // Test PDF generation with different content types
  test.each([
    ['basic CV', sampleCVs.basic],
    ['CV with special characters', sampleCVs.withSpecialCharacters],
    ['CV with complex dates', sampleCVs.withComplexDates],
    ['CV with long bullet points', sampleCVs.withLongBulletPoints],
    ['CV with special formatting', sampleCVs.withSpecialFormatting],
  ])('generates PDF correctly for %s', (_, content) => {
    render(<OptimizedCV content={content} />);
    const downloadButton = screen.getByText(/Download PDF/i);
    fireEvent.click(downloadButton);
    // Verify PDF generation was attempted
    expect(require('jspdf')).toHaveBeenCalled();
  });
});
