# BILLBOOK

## Author

| Roll No. | Name | GitHub username |
|---|---|---|
| 24ESKCS073 | ATHARVA SHARMA | atharvasharma-a |

## About

BILLBOOK is a student-focused expense management web app for tracking expenses, managing budgets, and analyzing spending. It also supports shared expense splitting and balance tracking among users.

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Web server: Nginx
- Containerization: Docker and Docker Compose
- CI: GitHub Actions and Jenkins

## Running Locally

```bash
make install
make run
```

## Docker

The application is available as a public Docker Hub image:

- Image: `atharvasharmaa/billbook:latest`
- Registry: https://hub.docker.com/r/atharvasharmaa/billbook

Pull the published image:

```bash
docker pull atharvasharmaa/billbook:latest
```

Run the container:

```bash
docker run -d --name billbook -p 8081:80 atharvasharmaa/billbook:latest
```

Open http://localhost:8081 in your browser.

Alternatively, start the application from the repository using:

```bash
docker compose up --build -d
```

Live URL

https://billbook-ela8.onrender.com

Health endpoint

GET https://billbook-ela8.onrender.com/health returns HTTP 200 with JSON containing the service status and the running commit SHA.

The endpoint has been verified against the deployed Docker image.
## Continuous Integration

The GitHub Actions CI workflow validates repository hygiene and runs automated build and test checks. The workflow is defined in `.github/workflows/ci.yml`.

The Jenkins pipeline is defined in `Jenkinsfile` and runs repository hygiene checks, installation, tests, and build checks.
