# Serverless User Management
## Tech stack
* React
* Auth0
* Nodejs 14x
* Serverless framework
## Backend
* npm install
* set AWS_CONFIGURE --profile=serverless
* serverless deploy -v

## Client
Change the `config.ts` as following values:

* appId: z1r9t8pvk9
* apiEndpoint: https://z1r9t8pvk9.execute-api.us-east-1.amazonaws.com/dev

Install all the dependencies
* npm install

Then run the Client
* npm run start
* Open browser and browse: http://localhost:3000