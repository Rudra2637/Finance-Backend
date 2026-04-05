export const apiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Finance Dashboard API',
    version: '1.0.0',
    description:
      'Finance dashboard backend with in-memory data handling, token-based access control, validation, analytics, and API documentation.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'UUID',
      },
    },
  },
  paths: {
    '/health': { get: { summary: 'Health check', responses: { '200': { description: 'OK' } } } },
    '/api/auth/demo-accounts': {
      get: { summary: 'Get demo accounts', responses: { '200': { description: 'OK' } } },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login and receive bearer token',
        responses: { '200': { description: 'OK' }, '401': { description: 'Unauthorized' } },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: 'Logout current session',
        security: [{ bearerAuth: [] }],
        responses: { '204': { description: 'No Content' } },
      },
    },
    '/api/users': {
      get: {
        summary: 'List users',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' }, '403': { description: 'Forbidden' } },
      },
      post: {
        summary: 'Create user',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/users/{id}': {
      get: {
        summary: 'Get user by id',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } },
      },
      patch: {
        summary: 'Update user',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/records': {
      get: {
        summary: 'List financial records',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
      post: {
        summary: 'Create financial record',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/records/{id}': {
      get: {
        summary: 'Get record by id',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } },
      },
      patch: {
        summary: 'Update financial record',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
      delete: {
        summary: 'Delete financial record',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/dashboard/summary': {
      get: {
        summary: 'Get dashboard analytics',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
  },
}

export const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Finance Dashboard API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #f4f7fb; }
      .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        displayRequestDuration: true,
        persistAuthorization: true
      })
    </script>
  </body>
</html>`
