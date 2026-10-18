import { describe, it } from 'node:test';
import assert from 'node:assert';

// Math function duplicating the calculation used in PerDiemCalculator
function computePerDiem(
  travelDays: number,
  lodgingCap: number,
  actualLodgingNightly: number,
  standardMIE: number,
  apply75PercentRule: boolean
) {
  let totalMIE = 0;
  if (travelDays <= 1) {
    totalMIE = standardMIE * (apply75PercentRule ? 0.75 : 1.0);
  } else if (apply75PercentRule) {
    const middleDays = Math.max(0, travelDays - 2);
    totalMIE = 2 * (standardMIE * 0.75) + middleDays * standardMIE;
  } else {
    totalMIE = travelDays * standardMIE;
  }

  const lodgingNights = Math.max(1, travelDays - 1);
  const eligibleLodgingPerNight = Math.min(actualLodgingNightly, lodgingCap);
  const totalReimbursableLodging = eligibleLodgingPerNight * lodgingNights;
  const grandTotal = totalReimbursableLodging + totalMIE;

  const breakfast = Math.round(standardMIE * 0.15);
  const lunch = Math.round(standardMIE * 0.25);
  const dinner = Math.round(standardMIE * 0.40);
  const incidentals = standardMIE - (breakfast + lunch + dinner);

  const aeaPercentage = Math.round((actualLodgingNightly / lodgingCap) * 100);
  const requiresAEA = actualLodgingNightly > lodgingCap;

  return {
    totalMIE,
    totalReimbursableLodging,
    grandTotal,
    breakfast,
    lunch,
    dinner,
    incidentals,
    aeaPercentage,
    requiresAEA,
  };
}

describe('FTR & DSSR Per Diem Calculation Tests', () => {
  it('should apply the 75% rule on first and last day for multi-day travel (FTR §301-11.101)', () => {
    // 5 days travel with $100 M&IE
    // Day 1: $75, Day 2: $100, Day 3: $100, Day 4: $100, Day 5: $75 => Total: $450
    const result = computePerDiem(5, 200, 200, 100, true);
    assert.strictEqual(result.totalMIE, 450);
  });

  it('should calculate 100% M&IE when the 75% rule is toggled off', () => {
    const result = computePerDiem(5, 200, 200, 100, false);
    assert.strictEqual(result.totalMIE, 500);
  });

  it('should cap reimbursable lodging to the DSSR maximum lodging cap', () => {
    // Actual hotel is $300/night, but cap is $200/night for 4 nights => max reimbursable = $800
    const result = computePerDiem(5, 200, 300, 100, true);
    assert.strictEqual(result.totalReimbursableLodging, 800);
    assert.strictEqual(result.requiresAEA, true);
    assert.strictEqual(result.aeaPercentage, 150);
  });

  it('should correctly sum M&IE meal deductions according to DSSR standard splits', () => {
    const result = computePerDiem(3, 185, 185, 110, true);
    // Breakfast: 15% of 110 = 17 (rounded)
    // Lunch: 25% of 110 = 28 (rounded)
    // Dinner: 40% of 110 = 44 (rounded)
    // Incidentals: 110 - (17 + 28 + 44) = 21
    assert.strictEqual(result.breakfast, 17);
    assert.strictEqual(result.lunch, 28);
    assert.strictEqual(result.dinner, 44);
    assert.strictEqual(result.incidentals, 21);
    assert.strictEqual(result.breakfast + result.lunch + result.dinner + result.incidentals, 110);
  });
});
