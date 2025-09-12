Struktur Folder Postmatic:

/apps/backend-service/(Express Typescript, Dockerfile, .env.staging, .env.production)
/apps/dashboard/(NextJs Typescript, Dockerfile, .env.staging, .env.production)
/apps/landing-page/(NextJs Typescript, Dockerfile, .env.staging, .env.production)
/infra/compose/local.production.yml
/infra/compose/local.staging.yml
/.env.production.infra
/.env.staging.infra

Domain:
api.postmatic.id 2001 (Api Production)
dashboard.postmatic.id 2002 (Dashboard Production)
www.postmatic.id & postmatic.id 2003 (Landing Page Production)
api-staging.postmatic.id (Api Staging)
dashboard-staging.postmatic.id (Dashboard Staging)
landing-staging.postmatic.id (Landing Page Staging)