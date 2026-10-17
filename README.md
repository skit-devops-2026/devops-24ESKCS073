# BILLBOOK

> Replace every angle-bracket placeholder below. The hygiene check in CI will
> fail until you do.

## Author

| Roll No. | Name | GitHub username |
|---|---|---|
| 24ESKCS073 | ATHARVA SHARMA | atharvasharma-a |

## About

BILLBOOK is a student-focused expense management web app for tracking expenses, managing budgets, and analyzing spending. It also supports shared expense splitting and balance tracking among users

## Tech stack

- Frontend: HTML , CSS , JS
- Backend: NA
- Database: NA

## Running locally

```bash
make install
make run
```

## Live URL

<Add once M5 is done. Until then, leave as is.>

## Health endpoint

`GET /health` returns the running commit SHA. See `Makefile` and the milestone
sheet for why this is required.


## Continuous Integration
The GitHub Actions CI workflow validates repository hygiene and runs the project's automated build and test checks on pushes to the repository.
The workflow is defined in `.github/workflows/ci.yml`. Its successful execution helps verify that changes preserve the expected project structure and pass the available automated checks.
