import { cleanupCVContent } from '../services/aiService';
import { sampleCVs, expectedResults } from './testData';

describe('CV Content Processing', () => {
  // Test basic CV format
  test('handles basic CV format correctly', () => {
    const processed = cleanupCVContent(sampleCVs.basic);
    expect(processed).toContain('NOAM NAUMOVSKY');
    expect(processed).toContain('PROFESSIONAL SUMMARY');
    expect(processed).toContain('TECHNICAL SKILLS');
    expect(processed.split('\n\n')).toHaveLength(expectedResults.basic.sections);
  });

  // Test special characters
  test('handles special characters correctly', () => {
    const processed = cleanupCVContent(sampleCVs.withSpecialCharacters);
    const bulletPoints = (processed.match(/•/g) || []).length;
    expect(bulletPoints).toBe(expectedResults.withSpecialCharacters.bulletPoints);
    expect(processed).not.toContain('Äď');
    expect(processed).not.toContain('úÇ');
  });

  // Test date formats
  test('handles complex date formats correctly', () => {
    const processed = cleanupCVContent(sampleCVs.withComplexDates);
    expect(processed).toContain('1/2012 - Present');
    expect(processed).toContain('06/2010 - 12/2011');
    expect(processed).toMatch(/Tel Aviv, Israel/);
  });

  // Test long bullet points
  test('handles long bullet points correctly', () => {
    const processed = cleanupCVContent(sampleCVs.withLongBulletPoints);
    const bullets = processed.split('\n').filter(line => line.trim().startsWith('•'));
    expect(bullets).toHaveLength(expectedResults.withLongBulletPoints.bulletPoints);
    bullets.forEach(bullet => {
      expect(bullet.length).toBeLessThanOrEqual(expectedResults.withLongBulletPoints.maxBulletLength);
    });
  });

  // Test special formatting
  test('handles special formatting correctly', () => {
    const processed = cleanupCVContent(sampleCVs.withSpecialFormatting);
    expect(processed).toContain('Senior Motion Designer');
    expect(processed).toContain('Tel Aviv, Israel');
    expect(processed).toMatch(/•\s+Project Management/);
    expect(processed).toMatch(/•\s+Team Leadership/);
  });

  // Test edge cases
  test('handles edge cases', () => {
    // Empty input
    expect(cleanupCVContent('')).toBe('');
    
    // Input with only whitespace
    expect(cleanupCVContent('   \n   \t   ')).toBe('');
    
    // Input with multiple consecutive newlines
    expect(cleanupCVContent('test\n\n\n\ntest')).toBe('test\n\ntest');
    
    // Input with mixed bullet points
    const mixedBullets = '• Point 1\n- Point 2\n* Point 3';
    const processed = cleanupCVContent(mixedBullets);
    expect(processed.match(/•/g)?.length).toBe(3);
  });
});
