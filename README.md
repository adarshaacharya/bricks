```sh
docker compose up
```

# Integrating Google Auth

To generate the env variable likes `CLIENT_ID` and `CLIENT_SECRET`, you need to create a project in Google Cloud Platform and enable the Google Auth API.

Visit this [blog](https://thriveread.com/nestjs-oauth-serve-with-google-and-passport/?expand_article=1)
for reference.

The final outcome should look like this :

<img src="./docs/google-auth.png" alt="google auth" />

Notice : Redirect URL should be `http://localhost:9000/auth/google/callback`

where `http://localhost:9000` is the base URL of the Backend application.

If you host backend application on a different URL, you need to change the redirect URL accordingly. eg : `api.dev.com/auth/google/callback`

Here's is how the flow looks like:

- User clicks on the login button
- Call the `http://localhost:9000/api/v1/auth/google` endpoint
- This will redirect to the Google Auth page
- User enters the credentials
- Google will redirect to the `http://localhost:9000/auth/google/callback` with the code
- Backend will exchange the code with the Google Auth server and get the user details
- Backend will create a JWT token and send it back to the frontend in cookies
- Backend will redirec the user to `localhost:3000` with the JWT token in the cookies
- Frontend will store the in the cookies and use it for further requests

# Github Auth

- Head over to the [Github Developer Settings](https://github.com/settings/applications/new) and create a new OAuth App

the configuration should look like this:
<img src="./docs/github-auth.png" alt="github auth" />

Notice : Redirect URL should be `http://localhost:9000/auth/github/callback`

where `http://localhost:9000` is the base URL of the Backend application.

If you host backend application on a different URL, you need to change the redirect URL accordingly. eg : `api.dev.com/auth/github/callback`

Here's is how the flow looks like:

- User clicks on the login button
- Call the `http://localhost:9000/api/v1/auth/github` endpoint
- This will redirect to the Github Auth page
- User enters the credentials
- Github will redirect to the `http://localhost:9000/auth/github/callback` with the code
- Backend will exchange the code with the Github Auth server and get the user details
- Backend will create a JWT token and send it back to the frontend in cookies
- Backend will redirec the user to `localhost:3000` with the JWT token in the cookies
- Frontend will store the in the cookies and use it for further requests
