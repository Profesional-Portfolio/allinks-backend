import request, { Response } from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';

export const getCsrfAgent = async (
  app: App
): Promise<{ agent: TestAgent; csrfToken: string }> => {
  const agent = request.agent(app);
  const response: Response = await agent.get('/api/csrf-token').expect(200);
  return {
    agent,
    csrfToken: (response.body as { csrfToken: string }).csrfToken,
  };
};
