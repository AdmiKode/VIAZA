import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  getUserMock: vi.fn(),
  maybeSingleMock: vi.fn(),
  limitMock: vi.fn(),
  orderMock: vi.fn(),
  eqLogsMock: vi.fn(),
  selectLogsMock: vi.fn(),
  eqProfileMock: vi.fn(),
  selectProfileMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock('../services/supabaseClient', () => ({
  supabase: {
    rpc: mocks.rpcMock,
    auth: { getUser: mocks.getUserMock },
    from: mocks.fromMock,
  },
}));

import { getEmergencyQrAccessLogs, logEmergencyPublicAccess } from '../services/emergencyService';

describe('emergency qr logs smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.orderMock.mockReturnValue({ limit: mocks.limitMock });
    mocks.eqLogsMock.mockReturnValue({ order: mocks.orderMock });
    mocks.selectLogsMock.mockReturnValue({ eq: mocks.eqLogsMock });

    mocks.eqProfileMock.mockReturnValue({ maybeSingle: mocks.maybeSingleMock });
    mocks.selectProfileMock.mockReturnValue({ eq: mocks.eqProfileMock });

    mocks.fromMock.mockImplementation((table: string) => {
      if (table === 'emergency_profiles') return { select: mocks.selectProfileMock };
      if (table === 'emergency_qr_access_logs') return { select: mocks.selectLogsMock };
      throw new Error(`Unexpected table: ${table}`);
    });
  });

  it('registra acceso público por RPC', async () => {
    mocks.rpcMock.mockResolvedValue({ data: true, error: null });

    const ok = await logEmergencyPublicAccess({
      publicToken: 'token-123',
      source: 'web',
      clientInfo: 'Mozilla Test',
    });

    expect(ok).toBe(true);
    expect(mocks.rpcMock).toHaveBeenCalledWith('log_emergency_qr_access', {
      token: 'token-123',
      source: 'web',
      client_info: 'Mozilla Test',
    });
  });

  it('lee historial de escaneos del owner', async () => {
    mocks.getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mocks.maybeSingleMock.mockResolvedValue({ data: { id: 'profile-1' }, error: null });
    mocks.limitMock.mockResolvedValue({
      data: [
        {
          id: 1,
          access_type: 'public_view',
          source: 'web',
          client_info: 'Mozilla Test',
          accessed_at: '2026-03-25T19:00:00.000Z',
        },
      ],
      error: null,
    });

    const logs = await getEmergencyQrAccessLogs(10);

    expect(logs).toHaveLength(1);
    expect(logs[0].access_type).toBe('public_view');
    expect(mocks.fromMock).toHaveBeenCalledWith('emergency_profiles');
    expect(mocks.fromMock).toHaveBeenCalledWith('emergency_qr_access_logs');
    expect(mocks.eqLogsMock).toHaveBeenCalledWith('emergency_profile_id', 'profile-1');
  });
});
