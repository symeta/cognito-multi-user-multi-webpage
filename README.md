# cognito-multi-user-multi-webpage

This demo showcases how to set up a multi-user, multi-webpage authorization mechanism leveraging on Amazon Cognito.

# User authentication and image accessing process

<img width="700" height="931" alt="image" src="https://github.com/user-attachments/assets/70142ac8-ec28-455f-8b2b-9d6ee2b71a87" />


# Security mechanism                                                                            
  - The pre-signed URL expires after 1 hour.
  - A new signed URL is generated with each login.
  - The S3 bucket is not public; it cannot be accessed without a signature.
  - Cognito authentication is required to obtain the pre-signed URL.
  
# Implementation Process
- create user pool
```sh
aws cognito-idp create-user-pool \
  --pool-name <specific user pool name> \
  --auto-verified-attributes email \
  --admin-create-user-config AllowAdminCreateUserOnly=false \
  --region <specific region id, e.g. us-east-1> 
```
- get user pool id from output: Id value of the JSON below
```txt
{
    "UserPool": {
        "Id": "us-east-1_axxxxxxxx",
        "Name": "xx",
        "Policies": {
            "PasswordPolicy": {
                "MinimumLength": 8,
                "RequireUppercase": true,
                "RequireLowercase": true,
                "RequireNumbers": true,
                "RequireSymbols": true,
                "TemporaryPasswordValidityDays": 7
            },
            "SignInPolicy": {
                "AllowedFirstAuthFactors": [
                    "PASSWORD"
                ]
            }
        },
        "DeletionProtection": "INACTIVE",
        "LambdaConfig": {},
        ... ...
}

```
- create user pool domain
```sh
aws cognito-idp create-user-pool-domain \
  --user-pool-id <specific user pool Id> \
  --domain <specific user pool domain name>-auth \
  --region <specific region id, e.g. us-east-1>
```
- create user pool client
```sh
aws cognito-idp create-user-pool-client \
  --user-pool-id <specific user pool Id> \
  --client-name <specific client name> \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH \
  --supported-identity-providers COGNITO \
  --allowed-o-auth-flows code \
  --allowed-o-auth-scopes openid email profile \
  --callback-urls "http://localhost:3000/callback" \
  --logout-urls "http://localhost:3000/logout" \
  --allowed-o-auth-flows-user-pool-client \
  --region us-east-1
```

- create two users
```sh
aws cognito-idp admin-create-user \
  --user-pool-id <specific user pool Id> \
  --username u1 \
  --user-attributes Name=email,Value=<email address1> Name=email_verified,Value=true \
  --message-action SUPPRESS \
  --region us-east-1


aws cognito-idp admin-create-user \
  --user-pool-id <specific user pool Id> \
  --username u2 \
  --user-attributes Name=email,Value=<email address2> Name=email_verified,Value=true \
  --message-action SUPPRESS \
  --region us-east-1


aws cognito-idp admin-set-user-password \
  --user-pool-id <specific user pool Id> \
  --username u1 \
  --password 'TempPass123!' \
  --permanent \
  --region us-east-1


aws cognito-idp admin-set-user-password \
  --user-pool-id <specific user pool Id>\
  --username u2 \
  --password 'TempPass123!' \
  --permanent \
  --region us-east-1
```

- start node server
```sh
node server.js
```
# Demo Video


https://github.com/user-attachments/assets/175c06ae-d45b-4279-bfd7-cf3a35bdb83d

