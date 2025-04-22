# Fake DBS Update Service
This repository contains a fake implementation of the Disclosure and Barring Service's [Multiple Status Check Facility](https://assets.publishing.service.gov.uk/media/67449590ece939d55ce93006/Multiple_Status_Checking_Guide_V2.0_23112024.pdf).
Perhaps confusingly, this is an API which allows employers to run an "update check" on a (single) DBS certificate to verify if the certificate is still current.
In the DBS' own words, "a Multiple Status Check is many Single Status Checks happening in quick succession".

## History / Context
The Disclosure and Barring Service (DBS) was formed in 2012, replacing the Criminal Records Bureau.
One of the key advantages of certificates issued by the DBS (excluding basic certificates) is that they can be enrolled in the [update service](https://www.gov.uk/dbs-update-service).
As of April 2025 the charge for the update service is £16 per year, although this is waived for volunteers.
The update service means that a DBS certificate can be "evergreen" and doesn't need to be perodically replaced.
In addition, a certificate issued for one employer can be verified by a different employer provided that the certificate covers the appropriate checks.
See [the gov.uk page about the DBS](https://www.gov.uk/government/organisations/disclosure-and-barring-service/about) for more details.

## Usage
The API takes a few inputs, all of which are required:
- `disclosureRef`: must be a 12-digit string. The first digit will determine the status code returned:
  - Starts with 1: returns status `NO_MATCH_FOUND`.
  - Starts with 2: returns status `BLANK_NO_NEW_INFO`.
  - Starts with 3: returns status `NON_BLANK_NO_NEW_INFO`.
  - Starts with 4: returns status `NEW_INFO`.
  - Starts with 9: throws 500 Internal Server Error.
  - Any other digit: throws 400 Bad Request.
- `dateOfBirth`: can be any valid date.
- `surname`: can be any string.
- `hasAgreedTermsAndConditions`: must be `true`.
- `organisationName`: can be any string.
- `employeeSurname`: can be any string.
- `employeeForename`: can be any string.

Sample request: https://fake-dbs-update-service.beh.uk/crsc/api/status/212345678901?dateOfBirth=01/01/2000&surname=Swift&hasAgreedTermsAndConditions=true&organisationName=Test&employeeSurname=Test&employeeForename=Test

Sample output:
```xml
<statusCheckResult>
    <statusCheckResultType>SUCCESS</statusCheckResultType>
    <status>BLANK_NO_NEW_INFO</status>
    <forename>TAYLOR</forename>
    <surname>SWIFT</surname>
    <printDate class="sql-date">2024-04-22</printDate>
</statusCheckResult>
```

Note that:
- The `forename` is not supplied as an input so will always return "TAYLOR".
- The `printDate` will always be the date 1 year before today.
- The `organisationName`, `employeeSurname`, and `employeeForename` are not used by the fake update service but these must still be supplied. For the real DBS update service these details are logged and shown to the certificate holder, but this has not been implemented.

## Deployment
This project has been deployed using [Cloudflare Pages](https://pages.cloudflare.com/) as opposed to [Cloudflare Workers](https://workers.cloudflare.com/).
This is because the logic is relatively simple and the "really easy, opinionated on-ramp" is helpful in removing boilerplate.
To deploy your own copy fork this repository and set up a new project from the fork, setting the root directory to `/pages`.

## Development
To run this project locally, run: `(cd pages && npx wrangler@latest pages dev .)`
