import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateChatInput, validateSopInput, generateDomainFallback, createRateLimiter } from '../server.ts';

describe('API Input Validation & Security Tests', () => {
  it('should reject non-object request bodies', () => {
    const result = validateChatInput(null);
    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /JSON object/);
  });

  it('should reject non-array or empty messages', () => {
    assert.strictEqual(validateChatInput({ messages: 'hello' }).valid, false);
    assert.strictEqual(validateChatInput({ messages: [] }).valid, false);
  });

  it('should reject messages exceeding maximum conversation history limit (20)', () => {
    const excessiveMessages = Array.from({ length: 25 }, (_, i) => ({
      role: 'user',
      content: `Message ${i}`,
    }));
    const result = validateChatInput({ messages: excessiveMessages });
    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /exceeds maximum allowed limit/);
  });

  it('should reject invalid message roles (only "user" or "model" allowed)', () => {
    const invalidRoleResult = validateChatInput({
      messages: [{ role: 'system_admin', content: 'Infiltrate system' }],
    });
    assert.strictEqual(invalidRoleResult.valid, false);
    assert.match(invalidRoleResult.error || '', /Invalid role/);
  });

  it('should reject message content exceeding 4000 characters', () => {
    const longContent = 'A'.repeat(4500);
    const result = validateChatInput({
      messages: [{ role: 'user', content: longContent }],
    });
    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /exceeds maximum allowed length/);
  });

  it('should accept valid chat input and sanitize language / postContext', () => {
    const validPayload = {
      messages: [
        { role: 'user', content: 'How do I resolve Error 401 on TA submission?' },
      ],
      postContext: 'U.S. Embassy Bangkok [BKK]',
      language: 'TH',
    };
    const result = validateChatInput(validPayload);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.data?.language, 'th');
    assert.strictEqual(result.data?.postContext, 'U.S. Embassy Bangkok [BKK]');
  });
});

describe('SOP Input Validation Tests', () => {
  it('should reject missing topic or details', () => {
    assert.strictEqual(validateSopInput({ details: 'some detail' }).valid, false);
    assert.strictEqual(validateSopInput({ topic: 'some topic' }).valid, false);
  });

  it('should reject topic exceeding 200 characters', () => {
    const result = validateSopInput({ topic: 'T'.repeat(250), details: 'valid detail' });
    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /cannot exceed 200 characters/);
  });

  it('should sanitize ticketId with valid alphanumeric characters', () => {
    const result = validateSopInput({
      topic: 'Routing Failure',
      details: 'Approver inactive',
      ticketId: 'TKT-9042!@#$',
    });
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.data?.ticketId, 'TKT-9042');
  });
});

describe('Domain Fallback Transparency & Factuality Tests', () => {
  it('should include explicit transparency notice in Error 401 fallback', () => {
    const fallbackTh = generateDomainFallback('Error 401 submitting TA', 'th');
    assert.match(fallbackTh, /ประกาศความโปร่งใส/);
    assert.match(fallbackTh, /Hypothesized Root Causes|สาเหตุที่เป็นไปได้/);

    const fallbackEn = generateDomainFallback('Error 401 submitting TA', 'en');
    assert.match(fallbackEn, /Transparency Notice/);
    assert.match(fallbackEn, /Hypothesized Root Causes/);
  });

  it('should include explicit transparency notice in User Onboarding/Offboarding fallback', () => {
    const fallbackTh = generateDomainFallback('User Onboarding and Offboarding SOP', 'th');
    assert.match(fallbackTh, /ประกาศความโปร่งใส/);
    assert.match(fallbackTh, /14 FAM 510/);

    const fallbackEn = generateDomainFallback('User Onboarding and Offboarding SOP', 'en');
    assert.match(fallbackEn, /Transparency Notice/);
    assert.match(fallbackEn, /14 FAM 510/);
  });
});

describe('Rate Limiter Behavior Tests', () => {
  it('should allow requests within threshold and block when exceeded', () => {
    const limiter = createRateLimiter(60000, 3);
    const mockReq = {
      ip: '192.168.1.50',
      socket: {},
      headers: {},
      id: 'test-req',
    } as any;

    let responseCode: number | null = null;
    let responseBody: any = null;
    const mockRes = {
      setHeader: () => {},
      status: (code: number) => {
        responseCode = code;
        return {
          json: (body: any) => {
            responseBody = body;
          },
        };
      },
    } as any;

    let nextCallCount = 0;
    const next = () => { nextCallCount++; };

    // Request 1, 2, 3 should succeed
    limiter(mockReq, mockRes, next);
    limiter(mockReq, mockRes, next);
    limiter(mockReq, mockRes, next);
    assert.strictEqual(nextCallCount, 3);

    // Request 4 should be rate limited with HTTP 429
    limiter(mockReq, mockRes, next);
    assert.strictEqual(responseCode, 429);
    assert.strictEqual(responseBody.code, 'RATE_LIMIT_EXCEEDED');
  });
});
