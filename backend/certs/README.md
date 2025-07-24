# Backend HTTPS Certificates

This directory contains self-signed certificates for local development. For production, use certificates from a trusted CA (e.g., Let's Encrypt).

## Generate self-signed certs (development only)

```
mkdir -p backend/certs
openssl req -x509 -newkey rsa:4096 -sha256 -days 365 -nodes \
  -keyout backend/certs/key.pem -out backend/certs/cert.pem \
  -subj "/CN=localhost"
```

- `key.pem`: Private key
- `cert.pem`: Certificate

## Automated Renewal (Production)
- Use a tool like [certbot](https://certbot.eff.org/) to automate certificate renewal.
- Update environment variables to point to production certs.
