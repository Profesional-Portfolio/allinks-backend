import request from 'supertest';
import { App } from 'supertest/types';

export const getCsrfAgent = async (app: App) => {
  const agent = request.agent(app);
  const response = await agent.get('/api/csrf-token').expect(200);
  return {
    agent,
    csrfToken: response.body.csrfToken,
  };
};
